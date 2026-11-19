import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const { isLoggedIn, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      if (isRegistering) {
        const name = formData.get("name");
        const role = formData.get("role") || "student";
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || `${isRegistering ? "Registration" : "Login"} failed`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <img
          className="login-logo"
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="CourseForge"
        />
        <p className="eye">COURSEFORGE</p>
        <h1>
          {isRegistering
            ? "Create your CourseForge account"
            : "Build Your Future with skills that move you forward"}
        </h1>
        <p className="muted">
          A focused learning space for practical courses that help you build your career.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegistering && (
            <label>
              Full Name
              <input
                type="text"
                name="name"
                placeholder="Jane Doe"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="student@courseforge.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="********"
              required
            />
          </label>

          {isRegistering && (
            <label>
              Role
              <select name="role" defaultValue="student">
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </label>
          )}

          {errorMessage && <p className="error">{errorMessage}</p>}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : isRegistering
              ? "Create Account"
              : "Enter CourseForge"}
          </button>
        </form>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <button
            type="button"
            className="secondary-button"
            style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage("");
            }}
          >
            {isRegistering
              ? "Already have an account? Sign in"
              : "Need an account? Register"}
          </button>
        </div>

        <p className="note">
          Demo mode: any email and password will sign you in offline. When connected to the live API, register a new account or sign in with registered credentials.
        </p>
      </section>
    </main>
  );
}

export default Login;
