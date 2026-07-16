import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/auth/signin", { studentId, password });
      loginSuccess(res.data.token, res.data.student);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not sign you in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-mark">SD</div>
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">Sign in to see what's due.</p>

        {error && <div className="auth-error">{error}</div>}

        <label>Student ID</label>
        <input value={studentId} onChange={(e) => setStudentId(e.target.value)} required placeholder="e.g. STU-2026-0142" />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <div className="auth-forgot">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="auth-footnote">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
