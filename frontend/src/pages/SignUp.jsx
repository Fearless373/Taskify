import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  fullName: "",
  studentId: "",
  phoneNumber: "",
  course: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignUp() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password and confirmation do not match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/auth/signup", form);
      loginSuccess(res.data.token, res.data.student);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-mark">SD</div>
        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">Track every deadline in one place.</p>

        {error && <div className="auth-error">{error}</div>}

        <label>Full name</label>
        <input value={form.fullName} onChange={update("fullName")} required placeholder="e.g. Amara Okafor" />

        <label>Student ID</label>
        <input value={form.studentId} onChange={update("studentId")} required placeholder="e.g. STU-2026-0142" />

        <label>Phone number</label>
        <input value={form.phoneNumber} onChange={update("phoneNumber")} required placeholder="e.g. +234 801 234 5678" />

        <label>Course of study</label>
        <input value={form.course} onChange={update("course")} required placeholder="e.g. BSc Computer Science" />

        <label>Email address</label>
        <input type="email" value={form.email} onChange={update("email")} required placeholder="you@school.edu" />

        <label>Password</label>
        <input type="password" value={form.password} onChange={update("password")} required minLength={8} placeholder="At least 8 characters" />

        <label>Confirm password</label>
        <input type="password" value={form.confirmPassword} onChange={update("confirmPassword")} required minLength={8} />

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>

        <p className="auth-footnote">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
