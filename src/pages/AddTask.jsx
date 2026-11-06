
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

//const API_URL = "http://localhost:5000";
const API_URL ="https://workasana-backend-xi.vercel.app";

const AddTask = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    project: "",
    team: "",
    owners: [],
    tags: [],
    timeToComplete: 1,
    dueDate: "",
    status: "To Do",
    priority: "Medium",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch projects, teams, users and tags
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoints = [
          "/projects",
          "/teams",
          "/tags",
          "/users",
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`${API_URL}${endpoint}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          )
        );

        const data = await Promise.all(
          responses.map(async (response) => {
            const result = await response.json();

            if (!response.ok) {
              throw new Error(
                result.message || "Unable to load form options."
              );
            }

            return result;
          })
        );

        setProjects(
          Array.isArray(data[0]) ? data[0] : data[0].projects || []
        );

        setTeams(
          Array.isArray(data[1]) ? data[1] : data[1].teams || []
        );

        setTags(
          Array.isArray(data[2]) ? data[2] : data[2].tags || []
        );

        setUsers(
          Array.isArray(data[3]) ? data[3] : data[3].users || []
        );
      } catch (err) {
        setError(err.message || "Unable to load form options.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOptions();
    } else {
      setLoading(false);
      setError("Please log in to create a task.");
    }
  }, [token]);

  // Handle normal inputs
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle task creation
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.project ||
      !formData.team ||
      !Number.isFinite(Number(formData.timeToComplete)) ||
      Number(formData.timeToComplete) < 1
    ) {
      setError(
        "Please enter a task name, select a project and team, and enter a valid completion time."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          timeToComplete: Number(formData.timeToComplete),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create task.");
      }

      setSuccess("Task created successfully!");

      setTimeout(() => {
        navigate("/tasks");
      }, 800);
    } catch (err) {
      setError(err.message || "Unable to create task.");
    } finally {
      setSaving(false);
    }
  };

  // Convert users into React Select options
  const userOptions = users.map((user) => ({
    value: user._id,
    label: `${user.name} (${user.email})`,
  }));

  // Convert tags into React Select options
  const tagOptions = tags.map((tag) => ({
    value: tag._id,
    label: tag.name,
  }));

  // Find the selected users
  const selectedUsers = userOptions.filter((option) =>
    formData.owners.includes(option.value)
  );

  // Find the selected tags
  const selectedTags = tagOptions.filter((option) =>
    formData.tags.includes(option.value)
  );

  // Shared styling for multi-select dropdowns
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "38px",
      borderColor: state.isFocused ? "#86b7fe" : "#dee2e6",
      boxShadow: state.isFocused
        ? "0 0 0 0.2rem rgba(13, 110, 253, 0.15)"
        : "none",
      "&:hover": {
        borderColor: "#86b7fe",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 10,
    }),
  };

  return (
    <div className="d-flex">
      <Navbar />

      <main className="flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="mb-0">Add Task</h2>

          <Link to="/tasks" className="btn btn-outline-secondary">
            Back to Tasks
          </Link>
        </div>

        {loading && <p>Loading form options...</p>}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit} className="card shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                {/* Task Name */}
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    Task Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Project */}
                <div className="col-md-6">
                  <label htmlFor="project" className="form-label">
                    Project *
                  </label>

                  <select
                    id="project"
                    name="project"
                    className="form-select"
                    value={formData.project}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Project</option>

                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team */}
                <div className="col-md-6">
                  <label htmlFor="team" className="form-label">
                    Team *
                  </label>

                  <select
                    id="team"
                    name="team"
                    className="form-select"
                    value={formData.team}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Team</option>

                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assign Users */}
                <div className="col-md-6">
                  <label className="form-label">
                    Assign Users
                  </label>

                  <Select
                    isMulti
                    isSearchable
                    options={userOptions}
                    value={selectedUsers}
                    onChange={(selected) => {
                      setFormData((previous) => ({
                        ...previous,
                        owners: (selected || []).map(
                          (option) => option.value
                        ),
                      }));
                    }}
                    placeholder="Search and select users..."
                    noOptionsMessage={() => "No users found"}
                    closeMenuOnSelect={false}
                    styles={selectStyles}
                  />
                </div>

                {/* Tags */}
                <div className="col-md-6">
                  <label className="form-label">
                    Tags
                  </label>

                  <Select
                    isMulti
                    isSearchable
                    options={tagOptions}
                    value={selectedTags}
                    onChange={(selected) => {
                      setFormData((previous) => ({
                        ...previous,
                        tags: (selected || []).map(
                          (option) => option.value
                        ),
                      }));
                    }}
                    placeholder="Search and select tags..."
                    noOptionsMessage={() => "No tags found"}
                    closeMenuOnSelect={false}
                    styles={selectStyles}
                  />
                </div>

                {/* Due Date */}
                <div className="col-md-6">
                  <label htmlFor="dueDate" className="form-label">
                    Due Date
                  </label>

                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    className="form-control"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>

                {/* Time to Complete */}
                <div className="col-md-4">
                  <label
                    htmlFor="timeToComplete"
                    className="form-label"
                  >
                    Time to Complete *
                  </label>

                  <input
                    id="timeToComplete"
                    name="timeToComplete"
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.timeToComplete}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Priority */}
                <div className="col-md-4">
                  <label htmlFor="priority" className="form-label">
                    Priority
                  </label>

                  <select
                    id="priority"
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Status */}
                <div className="col-md-4">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 text-center">
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={saving}
                >
                  {saving ? "Creating Task..." : "Create Task"}
                </button>

                <Link to="/tasks" className="btn btn-secondary">
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default AddTask;
