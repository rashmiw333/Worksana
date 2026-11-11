
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const ProjectManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  const [selectedProject, setSelectedProject] = useState(
    searchParams.get("project") || ""
  );

  const [selectedOwner, setSelectedOwner] = useState(
    searchParams.get("owner") || ""
  );

  const [selectedTag, setSelectedTag] = useState(
    searchParams.get("tag") || ""
  );

  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || ""
  );

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
        setError("");

        const [projectRes, userRes, tagRes] = await Promise.all([
          fetch("https://workasana-backend-xi.vercel.app/projects", {
            headers,
          }),
          fetch("https://workasana-backend-xi.vercel.app/users", {
            headers,
          }),
          fetch("https://workasana-backend-xi.vercel.app/tags", {
            headers,
          }),
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

        const projectFromUrl = searchParams.get("project");

        const projectExists = projectData.some(
          (project) => project._id === projectFromUrl
        );

        if (projectExists) {
          setSelectedProject(projectFromUrl);
        } else if (projectData.length > 0) {
          setSelectedProject(projectData[0]._id);
        } else {
          setSelectedProject("");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setLoading(false);
      setError("Please log in to view projects.");
    }
  }, [token]);

  // Update URL when filters change
  useEffect(() => {
    const params = {};

    if (selectedProject) {
      params.project = selectedProject;
    }

    if (selectedOwner) {
      params.owner = selectedOwner;
    }

    if (selectedTag) {
      params.tag = selectedTag;
    }

    if (sortBy) {
      params.sort = sortBy;
    }

    setSearchParams(params);
  }, [
    selectedProject,
    selectedOwner,
    selectedTag,
    sortBy,
    setSearchParams,
  ]);

  // Fetch tasks when project or filters change
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
    } else {
      setTasks([]);
    }
  }, [
    token,
    selectedProject,
    selectedOwner,
    selectedTag,
    sortBy,
  ]);

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

  return (
    <div className="d-flex flex-column flex-md-row bg-light min-vh-100">
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow-1" style={{ minWidth: 0 }}>
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <h3 className="mb-0 fw-bold">Project Management</h3>
        </div>

        <div className="container-fluid p-3 p-md-4">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {loading && projects.length === 0 ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <div className="alert alert-info">
              No projects available. Please create a project first.
            </div>
          ) : (
            <>
              {/* Project Selection */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-end gap-3 mb-4">
                <div className="flex-grow-1">
                  <label className="form-label fw-semibold">
                    Select Project
                  </label>

                  <select
                    className="form-select"
                    value={selectedProject}
                    onChange={(e) =>
                      setSelectedProject(e.target.value)
                    }
                  >
                    <option value="">Select a project</option>

                    {projects.map((project) => (
                      <option
                        key={project._id}
                        value={project._id}
                      >
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-primary text-nowrap"
                  onClick={() => navigate("/tasks/add")}
                  disabled={!selectedProject}
                >
                  + Add New Task
                </button>
              </div>

              {/* Selected Project Task List */}
              {selectedProject && (
                <>
                  <h4 className="mb-3">
                    Task List -{" "}
                    {projects.find(
                      (project) => project._id === selectedProject
                    )?.name}
                  </h4>

                  {/* Filters */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                      <div className="row g-3">
                        {/* Owner Filter */}
                        <div className="col-12 col-md-4">
                          <label className="form-label">
                            Filter by Owner
                          </label>

                          <select
                            className="form-select"
                            value={selectedOwner}
                            onChange={(e) =>
                              setSelectedOwner(e.target.value)
                            }
                          >
                            <option value="">All Owners</option>

                            {users.map((user) => (
                              <option
                                key={user._id}
                                value={user._id}
                              >
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Tag Filter */}
                        <div className="col-12 col-md-4">
                          <label className="form-label">
                            Filter by Tag
                          </label>

                          <select
                            className="form-select"
                            value={selectedTag}
                            onChange={(e) =>
                              setSelectedTag(e.target.value)
                            }
                          >
                            <option value="">All Tags</option>

                            {tags.map((tag) => (
                              <option
                                key={tag._id}
                                value={tag.name}
                              >
                                {tag.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Sort */}
                        <div className="col-12 col-md-4">
                          <label className="form-label">
                            Sort By
                          </label>

                          <select
                            className="form-select"
                            value={sortBy}
                            onChange={(e) =>
                              setSortBy(e.target.value)
                            }
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
                  {loading ? (
                    <p>Loading tasks...</p>
                  ) : error ? (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="alert alert-info">
                      No tasks found for this project.
                    </div>
                  ) : (
                    <div className="row g-3">
                      {tasks.map((task) => (
                        <div
                          className="col-12"
                          key={task._id}
                        >
                          <div className="card shadow-sm border-0">
                            <div className="card-body">
                              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3">
                                <div className="flex-grow-1">
                                  <h5 className="mb-2">
                                    {task.name}
                                  </h5>

                                  <div className="mb-2">
                                    <span
                                      className={`badge ${getStatusClass(
                                        task.status
                                      )} me-2`}
                                    >
                                      {task.status}
                                    </span>

                                    <span
                                      className={getPriorityClass(
                                        task.priority
                                      )}
                                    >
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
                                      ? task.owners
                                          .map((owner) => owner.name)
                                          .join(", ")
                                      : "Not assigned"}
                                  </p>

                                  <p className="text-muted mb-1">
                                    <strong>Due Date:</strong>{" "}
                                    {task.dueDate
                                      ? new Date(
                                          task.dueDate
                                        ).toLocaleDateString()
                                      : "Not set"}
                                  </p>

                                  <div className="mt-2 d-flex flex-wrap gap-2">
                                    {task.tags?.map((tag) => (
                                      <span
                                        className="badge bg-light text-dark border"
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
                                    onClick={() =>
                                      navigate(`/tasks/${task._id}`)
                                    }
                                  >
                                    View
                                  </button>

                                  <button
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() =>
                                      navigate(
                                        `/tasks/edit/${task._id}`
                                      )
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectManagement;
