import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: "bi-grid" },
    { name: "Projects", path: "/projects", icon: "bi-kanban" },
    { name: "Team", path: "/teams", icon: "bi-people" },
    { name: "Reports", path: "/reports", icon: "bi-bar-chart" },
    { name: "Tasks", path: "/tasks", icon: "bi-list-task" },
  ];

  return (
    <aside className="workasana-sidebar bg-light border-end p-3 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center">
        <Link
          to="/dashboard"
          className="text-decoration-none fs-3 fw-bold"
          style={{ color: "#6955ed" }}
        >
          workasana
        </Link>

        <button
          className="btn btn-outline-secondary d-md-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"}`}></i>
        </button>
      </div>

      <div className={`workasana-menu ${menuOpen ? "show" : ""}`}>
        <nav className="nav flex-column gap-2 mt-4">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`nav-link rounded ${
                location.pathname === link.path ||
                (link.path === "/tasks" &&
                  location.pathname.startsWith("/tasks"))
                  ? "bg-primary-subtle text-primary fw-bold"
                  : "text-secondary"
              }`}
            >
              <i className={`bi ${link.icon} me-2`}></i>
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="mt-md-auto pt-4">
          <div className="user-info p-3 rounded mb-3">
            <div className="fw-bold text-dark">
              {user?.name || "User"}
            </div>
            <small className="text-muted text-break">
              {user?.email || user?.emailId || "Email not available"}
            </small>
          </div>

          <button
            className="btn btn-outline-danger btn-sm w-100"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Navbar;