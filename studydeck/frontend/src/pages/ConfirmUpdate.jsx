import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ConfirmUpdate() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("id");
  const { refreshStudent } = useAuth();

  const [status, setStatus] = useState("confirming"); // confirming | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !id) {
      setStatus("error");
      setMessage("This confirmation link is missing information.");
      return;
    }

    api
      .post("/profile/confirm", { id, token })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Your profile has been updated.");
        refreshStudent();
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "This confirmation link is invalid or has expired.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-mark">SD</div>
        <h1 className="auth-heading">Confirm profile update</h1>

        {status === "confirming" && <p className="auth-subheading">Confirming your changes...</p>}
        {status === "success" && <div className="auth-success">{message}</div>}
        {status === "error" && <div className="auth-error">{message}</div>}

        <p className="auth-footnote">
          <Link to="/profile">Go to profile</Link>
        </p>
      </div>
    </div>
  );
}
