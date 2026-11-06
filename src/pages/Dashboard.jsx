import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { token, user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [taskFilter, setTaskFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [projectResponse, taskResponse] = await Promise.all([
        fetch("https://workasana-backend-xi.vercel.app/projects", { headers }),
        fetch("https://workasana-backend-xi.vercel.app/tasks?myTasks=true", { headers }),
      ]);

      const projectData = await projectResponse.json();
      const taskData = await taskResponse.json();

      if (!projectResponse.ok) {
        throw new Error(projectData.message || "Unable to fetch projects.");
      }

      if (!taskResponse.ok) {
        throw new Error(taskData.message || "Unable to fetch tasks.");
      }

      setProjects(Array.isArray(projectData) ? projectData : projectData.projects || []);
      setTasks(Array.isArray(taskData) ? taskData : taskData.tasks || []);
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
      setError("Please log in to view the dashboard.");
    }
  }, [token]);

  const handleCreateProject = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: projectName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create project.");
      }

      setProjects((previous) => [...previous, data.project]);
      setProjectName("");
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const counts = {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === "To Do").length,
    progress: tasks.filter((task) => task.status === "In Progress").length,
    completed: tasks.filter((task) => task.status === "Completed").length,
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const projectTasks = tasks.filter(
      (task) => task.project?._id === project._id
    );

    const status = projectTasks.some(
      (task) => task.status === "In Progress"
    )
      ? "In Progress"
      : projectTasks.length > 0 &&
        projectTasks.every((task) => task.status === "Completed")
      ? "Completed"
      : "To Do";

    return (
      matchesSearch &&
      (projectFilter === "All" || status === projectFilter)
    );
  });

  const filteredTasks = tasks.filter((task) => {
    return taskFilter === "All" || task.status === taskFilter;
  });

  return (
    <div className="d-flex bg-light min-vh-100">
      <Navbar />

      <main className="flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <div className="container-fluid">

          <input
            type="text"
            className="form-control mb-4"
            placeholder="Search projects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <h5 className="mb-4">
            Welcome back, {user?.name || "User"}!
          </h5>

          {loading && <p>Loading dashboard...</p>}

          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && (
            <>
              {/* Projects Section */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold mb-0">Projects</h3>

                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={projectFilter}
                    onChange={(event) => setProjectFilter(event.target.value)}
                  >
                    <option value="All">All Projects</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    className="btn btn-primary text-nowrap"
                    onClick={() => setShowModal(true)}
                  >
                    + New Project
                  </button>
                </div>
              </div>

              <div className="row g-3 mb-5">
                {filteredProjects.length === 0 ? (
                  <p className="text-muted">No projects found.</p>
                ) : (
                  filteredProjects.map((project) => {
                    const projectTasks = tasks.filter(
                      (task) => task.project?._id === project._id
                    );

                    const completed = projectTasks.filter(
                      (task) => task.status === "Completed"
                    ).length;

                    return (
                      <div className="col-12 col-md-6 col-xl-4" key={project._id}>
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <span className="badge bg-primary-subtle text-primary mb-3">
                              Project
                            </span>

                            <h5 className="fw-bold">{project.name}</h5>

                            <p className="text-muted mb-2">
                              {projectTasks.length} Tasks
                            </p>

                            <p className="text-muted small mb-0">
                              {completed} tasks completed
                            </p>

                            <div className="progress mt-3" style={{ height: "6px" }}>
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${
                                    projectTasks.length
                                      ? (completed / projectTasks.length) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* My Tasks Section */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold mb-0">My Tasks</h3>

                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={taskFilter}
                    onChange={(event) => setTaskFilter(event.target.value)}
                  >
                    <option value="All">All Tasks</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>

                  <Link to="/tasks/add" className="btn btn-primary text-nowrap">
                    + New Task
                  </Link>
                </div>
              </div>

              <div className="row g-3">
                {filteredTasks.length === 0 ? (
                  <div className="col-12">
                    <div className="alert alert-info">
                      No assigned tasks found.
                    </div>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div className="col-12 col-md-6 col-xl-4" key={task._id}>
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <span
                            className={`badge mb-3 ${
                              task.status === "Completed"
                                ? "bg-success"
                                : task.status === "In Progress"
                                ? "bg-info text-dark"
                                : task.status === "Blocked"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {task.status}
                          </span>

                          <h5 className="fw-bold">{task.name}</h5>

                          <p className="text-muted small mb-2">
                            {task.project?.name || "No project"}
                          </p>

                          <p className="text-muted small mb-2">
                            Due:{" "}
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "Not set"}
                          </p>

                          <span
                            className={`badge ${
                              task.priority === "High"
                                ? "bg-danger"
                                : task.priority === "Medium"
                                ? "bg-warning text-dark"
                                : "bg-success"
                            }`}
                          >
                            {task.priority}
                          </span>

                          <div className="mt-3">
                            <Link
                              to={`/tasks/${task._id}`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              View Task
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* New Project Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleCreateProject}>
                <div className="modal-header">
                  <h5 className="modal-title">Create New Project</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter project name"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    required
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;