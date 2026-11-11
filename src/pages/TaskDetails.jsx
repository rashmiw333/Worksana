import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(
          `https://workasana-backend-xi.vercel.app/tasks/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch task.");
        }

        setTask(data.task || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchTask();
    }
  }, [id, token]);

  if (loading) {
  return (
    <div className="d-flex flex-column flex-md-row bg-light min-vh-100">
      <Navbar />
      <main className="flex-grow-1 p-3 p-md-4">
        <p>Loading task details...</p>
      </main>
    </div>
  );
}

if (error) {
  return (
    <div className="d-flex flex-column flex-md-row bg-light min-vh-100">
      <Navbar />
      <main className="flex-grow-1 p-3 p-md-4">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/tasks")}
        >
          Back to Tasks
        </button>
      </main>
    </div>
  );
}

if (!task) {
  return (
    <div className="d-flex flex-column flex-md-row bg-light min-vh-100">
      <Navbar />
      <main className="flex-grow-1 p-3 p-md-4">
        <p>Task not found.</p>
      </main>
    </div>
  );
}

return (
  <div className="d-flex flex-column flex-md-row bg-light min-vh-100">
    <Navbar />

    <main className="flex-grow-1 p-3 p-md-4" style={{ minWidth: 0 }}>
      <div className="card shadow-sm">
        <div className="card-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
          <h4 className="mb-0">Task Details</h4>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/tasks")}
          >
            Back to Tasks
          </button>
        </div>

        <div className="card-body">
          <h3>{task.name}</h3>
          <hr />

          <p>
            <strong>Project:</strong>{" "}
            {task.project?.name || "Not assigned"}
          </p>

          <p>
            <strong>Team:</strong>{" "}
            {task.team?.name || "Not assigned"}
          </p>

          <p>
            <strong>Owners:</strong>{" "}
            {task.owners?.length
              ? task.owners
                  .map((owner) =>
                    typeof owner === "object" ? owner.name : owner
                  )
                  .join(", ")
              : "No owners assigned"}
          </p>

          <p>
            <strong>Tags:</strong>{" "}
            {task.tags?.length
              ? task.tags
                  .map((tag) =>
                    typeof tag === "object" ? tag.name : tag
                  )
                  .join(", ")
              : "No tags"}
          </p>

          <p>
            <strong>Due Date:</strong>{" "}
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString()
              : "Not set"}
          </p>

          <p>
            <strong>Time to Complete:</strong>{" "}
            {task.timeToComplete} days
          </p>

          <p>
            <strong>Priority:</strong>{" "}
            <span className="badge bg-warning text-dark">
              {task.priority}
            </span>
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span className="badge bg-primary">
              {task.status}
            </span>
          </p>
        </div>
      </div>
    </main>
  </div>
);
}

export default TaskDetails;
