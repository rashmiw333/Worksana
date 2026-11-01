
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">
          Workasana
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#workasanaNavbar"
          aria-controls="workasanaNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="workasanaNavbar">
          <div className="navbar-nav me-auto">
            <Link className="nav-link" to="/dashboard">
              Dashboard
            </Link>

            <Link className="nav-link" to="/tasks">
              Tasks
            </Link>

            <Link className="nav-link" to="/teams">
              Teams
            </Link>

            <Link className="nav-link" to="/reports">
              Reports
            </Link>

            <Link className="nav-link" to="/projects">
              Projects
            </Link>
          </div>

          <span className="navbar-text text-white me-3">
            {user?.name || user?.email || "Welcome"}
          </span>

          <button
            className="btn btn-outline-light btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
