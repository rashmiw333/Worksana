import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: "bi-grid" },
    { name: "Projects", path: "/projects", icon: "bi-kanban" },
    { name: "Team", path: "/teams", icon: "bi-people" },
    { name: "Reports", path: "/reports", icon: "bi-bar-chart" },
  ];

  return (
    <aside
      className="bg-light border-end p-4 d-flex flex-column"
      style={{ width: "230px", minHeight: "100vh" }}
    >
      <Link
        to="/dashboard"
        className="text-decoration-none fs-3 fw-bold mb-5"
        style={{ color: "#6955ed" }}
      >
        workasana
      </Link>

      <div className="nav flex-column gap-3">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${
              location.pathname === link.path
                ? "text-primary fw-bold"
                : "text-secondary"
            }`}
          >
            <i className={`bi ${link.icon} me-2`}></i>
            {link.name}
          </Link>
        ))}
      </div>

      <div className="mt-auto">
        <p className="text-muted small mb-2">
          {user?.name || user?.email || "Welcome"}
        </p>

        <button
          className="btn btn-outline-danger btn-sm w-100"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Navbar;