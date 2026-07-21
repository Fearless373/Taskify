import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !id) {
      setStatus("error");
      setMessage("This verification link is missing information.");
      return;
    }

    api
      .post("/auth/verify-email", { id, token })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Your email has been verified.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "This verification link is invalid or has expired.");
      });
  }, [token, id]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-mark">SD</div>
        <h1 className="auth-heading">Email verification</h1>

        {status === "verifying" && <p className="auth-subheading">Verifying your email...</p>}
        {status === "success" && <div className="auth-success">{message}</div>}
        {status === "error" && <div className="auth-error">{message}</div>}

        <p className="auth-footnote">
          <Link to="/signin">Go to sign in</Link>
        </p>
      </div>
    </div>
  );
}
