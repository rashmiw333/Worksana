
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProjectManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Fetch projects, users and tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [projectRes, userRes, tagRes] = await Promise.all([
          fetch("https://workasana-backend-xi.vercel.app/projects", { headers }),
          fetch("https://workasana-backend-xi.vercel.app/users", { headers }),
          fetch("https://workasana-backend-xi.vercel.app/tags", { headers }),
        ]);

        if (!projectRes.ok || !userRes.ok || !tagRes.ok) {
          throw new Error("Failed to load project information.");
        }

        const projectData = await projectRes.json();
        const userData = await userRes.json();
        const tagData = await tagRes.json();

        setProjects(projectData);
        setUsers(userData);
        setTags(tagData);

        if (projectData.length > 0) {
          setSelectedProject(projectData[0]._id);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Fetch tasks whenever project, filters or sorting changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProject) {
        setTasks([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.append("project", selectedProject);

        if (selectedOwner) {
          params.append("owner", selectedOwner);
        }

        if (selectedTag) {
          params.append("tags", selectedTag);
        }

        if (sortBy) {
          params.append("sort", sortBy);
        }

        const response = await fetch(
          `https://workasana-backend-xi.vercel.app/tasks?${params.toString()}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch project tasks.");
        }

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && selectedProject) {
      fetchTasks();
    }
  }, [token, selectedProject, selectedOwner, selectedTag, sortBy]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-success";
      case "In Progress":
        return "bg-primary";
      case "Blocked":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "text-danger";
      case "Medium":
        return "text-warning";
      case "Low":
        return "text-success";
      default:
        return "text-secondary";
    }
  };

  if (loading && projects.length === 0) {
    return <div className="container mt-4">Loading projects...</div>;
  }

  return (
    <div className="container-fluid bg-light min-vh-100">

      {/* Header */}
      <div className="bg-white border-bottom p-3">
        <h3 className="text-center mb-0">Project Management</h3>
      </div>

      <div className="row">

        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 bg-white border-end min-vh-100 p-4">
          <button
            className="btn btn-outline-primary w-100"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 p-4">

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <div>
              <label className="form-label fw-semibold">
                Select Project
              </label>

              <select
                className="form-select"
                style={{ minWidth: "250px" }}
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Select a project</option>

                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/tasks/add")}
              disabled={!selectedProject}
            >
              + Add New Task
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="alert alert-info">
              No projects available. Please create a project first.
            </div>
          ) : (
            <>
              <h4 className="mb-3">
                Task List -{" "}
                {projects.find((p) => p._id === selectedProject)?.name}
              </h4>

              {/* Filters */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                  <div className="row g-3">

                    <div className="col-md-4">
                      <label className="form-label">Filter by Owner</label>

                      <select
                        className="form-select"
                        value={selectedOwner}
                        onChange={(e) => setSelectedOwner(e.target.value)}
                      >
                        <option value="">All Owners</option>

                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Filter by Tag</label>

                      <select
                        className="form-select"
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                      >
                        <option value="">All Tags</option>

                        {tags.map((tag) => (
                          <option key={tag._id} value={tag.name}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Sort By</label>

                      <select
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="">Default</option>
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                      </select>
                    </div>

                  </div>
                </div>
              </div>

              {/* Task List */}
              {error ? (
                <div className="alert alert-danger">{error}</div>
              ) : loading ? (
                <p>Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <div className="alert alert-info">
                  No tasks found for this project.
                </div>
              ) : (
                <div className="row">
                  {tasks.map((task) => (
                    <div className="col-12 mb-3" key={task._id}>
                      <div className="card shadow-sm border-0">
                        <div className="card-body">

                          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">

                            <div>
                              <h5 className="mb-2">{task.name}</h5>

                              <div className="mb-2">
                                <span
                                  className={`badge ${getStatusClass(task.status)} me-2`}
                                >
                                  {task.status}
                                </span>

                                <span className={getPriorityClass(task.priority)}>
                                  {task.priority} Priority
                                </span>
                              </div>

                              <p className="text-muted mb-1">
                                <strong>Team:</strong>{" "}
                                {task.team?.name || "Not assigned"}
                              </p>

                              <p className="text-muted mb-1">
                                <strong>Owner:</strong>{" "}
                                {task.owners?.length
                                  ? task.owners.map((owner) => owner.name).join(", ")
                                  : "Not assigned"}
                              </p>

                              <p className="text-muted mb-1">
                                <strong>Due Date:</strong>{" "}
                                {task.dueDate
                                  ? new Date(task.dueDate).toLocaleDateString()
                                  : "Not set"}
                              </p>

                              <div className="mt-2">
                                {task.tags?.map((tag) => (
                                  <span
                                    className="badge bg-light text-dark border me-2"
                                    key={tag._id}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="d-flex flex-wrap gap-2">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate(`/tasks/${task._id}`)}
                              >
                                View
                              </button>

                              <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={() =>
                                  navigate(`/tasks/edit/${task._id}`)
                                }
                              >
                                Edit
                              </button>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
