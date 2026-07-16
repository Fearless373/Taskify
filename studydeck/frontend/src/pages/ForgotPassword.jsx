import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // "sent" | "error" | null
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await api.post("/auth/forgot-password", { email });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-mark">SD</div>
        <h1 className="auth-heading">Reset your password</h1>
        <p className="auth-subheading">We'll email you a link that's valid for 1 hour.</p>

        {status === "sent" && (
          <div className="auth-success">
            If that email is registered, a reset link is on its way. Check your inbox.
          </div>
        )}
        {status === "error" && <div className="auth-error">Something went wrong. Please try again.</div>}

        <label>Email address</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@school.edu" />

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Sending link..." : "Send reset link"}
        </button>

        <p className="auth-footnote">
          <Link to="/signin">Back to sign in</Link>
        </p>
      </form>
    </div>
  );
}
