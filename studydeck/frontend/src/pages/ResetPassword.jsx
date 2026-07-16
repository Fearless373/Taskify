import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token || !id) {
      setError("This reset link is missing information. Please request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and confirmation do not match");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { id, token, password, confirmPassword });
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "This reset link is invalid or has expired");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-mark">SD</div>
        <h1 className="auth-heading">Set a new password</h1>
        <p className="auth-subheading">Reset links expire 1 hour after they're sent.</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">Password reset. Redirecting to sign in...</div>}

        <label>New password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />

        <label>Confirm new password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />

        <button type="submit" className="btn-primary" disabled={submitting || success}>
          {submitting ? "Resetting..." : "Reset password"}
        </button>

        <p className="auth-footnote">
          <Link to="/signin">Back to sign in</Link>
        </p>
      </form>
    </div>
  );
}
