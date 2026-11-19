import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState("");

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      login(email, password);
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setLoginError(err.message || "Login failed");
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
        <h1>Build Your Future with skills that move you forward</h1>
        <p className="muted">
          A focused learning space for practical courses that help you build your career.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
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
          {loginError && <p className="error">{loginError}</p>}

          <button className="primary-button" type="submit">
            Enter CourseForge
          </button>
        </form>

        <p className="note">
          Demo mode: any email and password will sign you in. Use an email containing &quot;admin&quot; to test instructor flow.
        </p>
      </section>
    </main>
  );
}

export default Login;
