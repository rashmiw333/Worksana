
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Tasks = () => {
  const { token } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  //  filter values from URL
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [status, setStatus] = useState(
    searchParams.get("status") || "All"
  );

  const [priority, setPriority] = useState(
    searchParams.get("priority") || "All"
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://workasana-backend-xi.vercel.app/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch tasks.");
      }

      const taskList = Array.isArray(data) ? data : data.tasks;

      if (!Array.isArray(taskList)) {
        throw new Error("Unexpected task response from the server.");
      }

      setTasks(taskList);
    } catch (err) {
      setError(err.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    } else {
      setLoading(false);
      setError("Please log in to view tasks.");
    }
  }, [token]);

  // URL change when filters change
  useEffect(() => {
    const params = {};

    if (search.trim()) {
      params.search = search;
    }

    if (status !== "All") {
      params.status = status;
    }

    if (priority !== "All") {
      params.priority = priority;
    }

    setSearchParams(params);
  }, [search, status, priority, setSearchParams]);

  // Search and filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      status === "All" || task.status === status;

    const matchesPriority =
      priority === "All" || task.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Delete a task
  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://workasana-backend-xi.vercel.app/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete task.");
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id)
      );

      alert("Task deleted successfully!");
    } catch (err) {
      setError(err.message || "Unable to delete task.");
    }
  };

  return (
    <div className="d-flex">
      <Navbar />

      <main className="flex-grow-1 p-4">
        <div className="container-fluid">

          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">

            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-list-task fs-2 text-primary"></i>
              <h2 className="mb-0">Task Management</h2>
            </div>

            <div className="d-flex gap-2">
              <Link
                to="/dashboard"
                className="btn btn-outline-secondary"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard
              </Link>

              <Link
                to="/tasks/add"
                className="btn btn-primary"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add Task
              </Link>
            </div>

          </div>

          {/* Search and Filters */}
          <div className="row g-3 mb-4">

            <div className="col-md-4">
              <label htmlFor="search" className="form-label">
                Search Tasks
              </label>

              <input
                id="search"
                type="text"
                className="form-control"
                placeholder="Search by task name..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="status" className="form-label">
                Filter by Status
              </label>

              <select
                id="status"
                className="form-select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="priority" className="form-label">
                Filter by Priority
              </label>

              <select
                id="priority"
                className="form-select"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

          </div>

          {/* Loading and Error Messages */}
          {loading && <p>Loading tasks...</p>}

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {/* Task Table */}
          {!loading && !error && (
            <>
              <p className="text-muted">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>

              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">

                  <thead className="table-dark">
                    <tr>
                      <th>Task Name</th>
                      <th>Project</th>
                      <th>Team</th>
                      <th>Assigned To</th>
                      <th>Due Date</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task._id}>
                        <td>{task.name}</td>

                        <td>
                          {task.project?.name || "Not available"}
                        </td>

                        <td>
                          {task.team?.name || "Not available"}
                        </td>

                        <td>
                          {task.owners?.length > 0
                            ? task.owners
                                .map((owner) => owner.name)
                                .join(", ")
                            : "Unassigned"}
                        </td>

                        <td>
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "Not set"}
                        </td>

                        <td>
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
                        </td>

                        <td>{task.status}</td>

                        <td>
                          <div className="d-flex gap-2">
                            <Link
                              to={`/tasks/${task._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View
                            </Link>

                            <Link
                              to={`/tasks/edit/${task._id}`}
                              className="btn btn-sm btn-outline-warning"
                            >
                              Edit
                            </Link>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteTask(task._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredTasks.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          No tasks found.
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default Tasks;