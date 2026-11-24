import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const isInstructorOrAdmin = user?.role === "instructor" || user?.role === "admin";

  return (
    <header className="top">
      <Link className="wordmark" to="/">
        <img
          className="site-logo"
          src={`${import.meta.env.BASE_URL}favicon.png`}
          alt="CourseForge logo"
        />
        <span className="site-name">CourseForge</span>
      </Link>

      <button
        className="mobile-nav-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        type="button"
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      <nav className={mobileOpen ? "nav-menu open" : "nav-menu"}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen(false)}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/courses"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen(false)}
        >
          Browse Courses
        </NavLink>

        <NavLink
          to="/admin"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen(false)}
        >
          {isInstructorOrAdmin ? "Instructor Center" : "Admin"}
        </NavLink>

        {user && (
          <div className="nav-user-badge" title={user.email}>
            <span className="user-avatar">{initial}</span>
            <span className="user-name">{user.name?.split(" ")[0] || "Student"}</span>
            <span className="user-role-tag">{user.role || "student"}</span>
          </div>
        )}

        <button className="nav-logout-btn" onClick={handleLogout} type="button">
          Sign Out
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
