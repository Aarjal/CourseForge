import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

function NotFound() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="app-shell">
      {isLoggedIn && <Navbar />}
      <main className="main-content">
        <section className="empty-state" style={{ marginTop: "4rem" }}>
          <p className="eye">404 ERROR</p>
          <h1>Page Not Found</h1>
          <p className="muted">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link className="primary-button" to="/" style={{ display: "inline-block", marginTop: "1rem" }}>
            Return to Dashboard
          </Link>
        </section>
      </main>
    </div>
  );
}

export default NotFound;
