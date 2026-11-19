import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

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

      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>

        <NavLink
          to="/courses"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Browse courses
        </NavLink>

        <NavLink
          to="/admin"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Admin
        </NavLink>

        <button onClick={handleLogout} type="button">
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
