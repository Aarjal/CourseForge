import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const { isLoggedIn, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      setErrorMessage(
        err.message || `${isRegistering ? "Registration" : "Login"} failed`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-card-wrapper">
        {/* Left Side: Brand Showcase & Value Proposition */}
        <section className="login-hero-panel">
          <div className="hero-brand">
            <img
              className="login-logo-img"
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="CourseForge"
            />
            <span className="hero-brand-name">CourseForge</span>
          </div>

          <div className="hero-content">
            <span className="hero-pill">Modern Tech Education</span>
            <h2>Master in-demand skills with real-world practice</h2>
            <p className="hero-subtitle">
              Learn practical engineering and design skills through hands-on
              chapters, downloadable course notes, and graded assessments.
            </p>

            <ul className="hero-highlights">
              <li>
                <span className="highlight-icon">🚀</span>
                <div>
                  <strong>Project-based Curriculum</strong>
                  <p>Step-by-step video lessons and source code materials</p>
                </div>
              </li>
              <li>
                <span className="highlight-icon">📝</span>
                <div>
                  <strong>Instant Assessment Engine</strong>
                  <p>Test knowledge with server-scored quizzes and feedback</p>
                </div>
              </li>
              <li>
                <span className="highlight-icon">🎓</span>
                <div>
                  <strong>Official Certificates</strong>
                  <p>Earn verified credentials upon complete course mastery</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="hero-footer">
            <span className="nepal-badge">🇳🇵 Crafted for ambitious builders</span>
          </div>
        </section>

        {/* Right Side: Modern Authentication Form */}
        <section className="login-form-panel">
          <div className="form-header">
            <p className="eye">COURSEFORGE</p>
            <h1>{isRegistering ? "Create your account" : "Welcome back"}</h1>
            <p className="muted">
              {isRegistering
                ? "Join CourseForge to start learning or teaching practical skills."
                : "Sign in with your email to continue your learning journey."}
            </p>
          </div>

          {/* Auth Tab Switcher */}
          <div className="auth-tab-bar">
            <button
              type="button"
              className={`auth-tab-btn ${!isRegistering ? "active" : ""}`}
              onClick={() => {
                setIsRegistering(false);
                setErrorMessage("");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${isRegistering ? "active" : ""}`}
              onClick={() => {
                setIsRegistering(true);
                setErrorMessage("");
              }}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="auth-error-alert" role="alert">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="modern-auth-form">
            {isRegistering && (
              <div className="input-group">
                <label htmlFor="auth-name">Full Name</label>
                <div className="input-field-wrap">
                  <input
                    id="auth-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Aarjal Acharya"
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="auth-email">Email Address</label>
              <div className="input-field-wrap">
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  placeholder="student@courseforge.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="auth-password">Password</label>
              <div className="input-field-wrap password-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••••••"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div className="input-group">
                <label htmlFor="auth-role">Account Type</label>
                <div className="input-field-wrap">
                  <select id="auth-role" name="role" defaultValue="student">
                    <option value="student">Student (Learn & take assessments)</option>
                    <option value="instructor">Instructor (Create & manage courses)</option>
                  </select>
                </div>
              </div>
            )}

            <button
              className="primary-button auth-submit-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Please wait..."
                : isRegistering
                ? "Create Account"
                : "Enter CourseForge"}
            </button>
          </form>

          <div className="auth-form-footer">
            <p className="muted">
              {isRegistering ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setIsRegistering(false);
                      setErrorMessage("");
                    }}
                  >
                    Sign in here
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMessage("");
                    }}
                  >
                    Create an account
                  </button>
                </>
              )}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
