import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { useAuth } from "../context/AuthContext";

const API_URL = "https://workasana-backend-xi.vercel.app";

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    project: "",
    team: "",
    owners: [],
    tags: [],
    dueDate: "",
    timeToComplete: "",
    priority: "Medium",
    status: "To Do",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch task details and dropdown data
        const responses = await Promise.all(
          ["/tasks/" + id, "/projects", "/teams", "/users", "/tags"].map(
            (endpoint) =>
              fetch(`${API_URL}${endpoint}`, { headers })
          )
        );

        const results = await Promise.all(
          responses.map(async (response) => {
            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message || "Failed to load task information."
              );
            }

            return data;
          })
        );

        const [taskResult, projectData, teamData, userData, tagData] =
          results;

        const task = taskResult.task || taskResult;

        setProjects(Array.isArray(projectData) ? projectData : []);
        setTeams(Array.isArray(teamData) ? teamData : []);
        setUsers(Array.isArray(userData) ? userData : []);
        setTags(Array.isArray(tagData) ? tagData : []);

        setFormData({
          name: task.name || "",
          project: task.project?._id || task.project || "",
          team: task.team?._id || task.team || "",
          owners: (task.owners || []).map((owner) =>
            typeof owner === "object" ? owner._id : owner
          ),
          tags: (task.tags || []).map((tag) =>
            typeof tag === "object" ? tag._id : tag
          ),
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().slice(0, 10)
            : "",
          timeToComplete: task.timeToComplete ?? "",
          priority: task.priority || "Medium",
          status: task.status || "To Do",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchData();
    }
  }, [id, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const userOptions = users.map((user) => ({
    value: user._id,
    label: `${user.name} (${user.email})`,
  }));

  const tagOptions = tags.map((tag) => ({
    value: tag._id,
    label: tag.name,
  }));

  const selectedUsers = userOptions.filter((option) =>
    formData.owners.includes(option.value)
  );

  const selectedTags = tagOptions.filter((option) =>
    formData.tags.includes(option.value)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!formData.name.trim()) {
      setError("Task name is required.");
      return;
    }

    if (!formData.project || !formData.team) {
      setError("Please select a project and team.");
      return;
    }

    if (
      formData.timeToComplete === "" ||
      Number(formData.timeToComplete) < 1
    ) {
      setError("Time to complete must be at least 1 day.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
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
        throw new Error(data.message || "Failed to update task.");
      }

      setMessage("Task updated successfully!");

      setTimeout(() => {
        navigate("/tasks");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mt-4">Loading task details...</div>;
  }

  if (error && !formData.name) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/tasks")}
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Edit Task</h4>
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              {message && (
                <div className="alert alert-success">{message}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Task Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Project</label>
                    <select
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Team</label>
                    <select
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
                </div>

                <div className="mb-3">
                  <label className="form-label">Assign Owners</label>
                  <Select
                    isMulti
                    isSearchable
                    options={userOptions}
                    value={selectedUsers}
                    onChange={(selected) =>
                      setFormData((previousData) => ({
                        ...previousData,
                        owners: selected.map((option) => option.value),
                      }))
                    }
                    placeholder="Search and select owners..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Tags</label>
                  <Select
                    isMulti
                    isSearchable
                    options={tagOptions}
                    value={selectedTags}
                    onChange={(selected) =>
                      setFormData((previousData) => ({
                        ...previousData,
                        tags: selected.map((option) => option.value),
                      }))
                    }
                    placeholder="Search and select tags..."
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      className="form-control"
                      value={formData.dueDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Time to Complete (Days)
                    </label>
                    <input
                      type="number"
                      name="timeToComplete"
                      className="form-control"
                      min="1"
                      value={formData.timeToComplete}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Priority</label>
                    <select
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <select
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

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/tasks")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditTask;