
import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Teams = () => {
  const { token } = useAuth();
  //const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all teams
  const fetchTeams = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://workasana-backend-xi.vercel.app/teams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch teams.");
      }

      setTeams(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTeams();
    }
  }, [token]);

  // Add new team
  const handleAddTeam = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("https://workasana-backend-xi.vercel.app/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create team.");
      }

      setTeams((previousTeams) => [...previousTeams, data.team]);

      setName("");
      setDescription("");
      setShowForm(false);
      setMessage("Team created successfully.");
    } catch (error) {
      setError(error.message);
    }
  };

return (
  <div className="d-flex flex-column flex-md-row bg-light min-vh-100">
    <Navbar />

    <main className="flex-grow-1 p-3 p-md-4" style={{ minWidth: 0 }}>
      <div className="bg-white border-bottom p-3 mb-4">
        <h3 className="text-center mb-0">Teams Management</h3>
      </div>

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <h4 className="mb-0">Teams List</h4>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setMessage("");
          }}
        >
          {showForm ? "Cancel" : "+ Add New Team"}
        </button>
      </div>

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">Add New Team</h5>

            <form onSubmit={handleAddTeam}>
              <div className="mb-3">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter team name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Enter team description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <button type="submit" className="btn btn-success">
                Create Team
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading teams...</p>
      ) : teams.length === 0 ? (
        <div className="alert alert-info">
          No teams found. Click Add New Team to create your first team.
        </div>
      ) : (
        <div className="row g-3">
          {teams.map((team) => (
            <div className="col-12 col-md-6 col-xl-4" key={team._id}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{team.name}</h5>

                  <p className="card-text text-muted">
                    {team.description || "No description available."}
                  </p>

                  <small className="text-muted">
                    Created:{" "}
                    {new Date(team.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  </div>
);
};

export default Teams;
