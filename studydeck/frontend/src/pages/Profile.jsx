import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MAX_IMAGE_DIMENSION = 400; // px, keeps the base64 payload small

export default function Profile() {
  const { student, refreshStudent } = useAuth();

  const [form, setForm] = useState({
    fullName: student?.fullName || "",
    course: student?.course || "",
    phoneNumber: student?.phoneNumber || "",
    email: student?.email || "",
  });
  const [picturePreview, setPicturePreview] = useState(student?.profilePicture || "");
  const [pictureChanged, setPictureChanged] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (!student) return null;

  async function handleResendVerification() {
    setResending(true);
    setStatus(null);
    try {
      const res = await api.post("/auth/resend-verification");
      setStatus({ type: "success", message: res.data.message });
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Could not resend verification email" });
    } finally {
      setResending(false);
    }
  }

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handlePictureSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Please choose an image file" });
      return;
    }

    resizeImage(file, MAX_IMAGE_DIMENSION)
      .then((dataUrl) => {
        setPicturePreview(dataUrl);
        setPictureChanged(true);
      })
      .catch(() => setStatus({ type: "error", message: "Could not process that image" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);

    const changes = {};
    if (form.fullName !== student.fullName) changes.fullName = form.fullName;
    if (form.course !== student.course) changes.course = form.course;
    if (form.phoneNumber !== student.phoneNumber) changes.phoneNumber = form.phoneNumber;
    if (form.email !== student.email) changes.email = form.email;
    if (pictureChanged) changes.profilePicture = picturePreview;

    if (Object.keys(changes).length === 0) {
      setStatus({ type: "error", message: "No changes to save" });
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post("/profile/update", changes);
      setStatus({ type: "success", message: res.data.message });
      setPictureChanged(false);
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Could not submit your update" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="page-subtitle">
            Update your details below. Any change is confirmed by email before it takes effect.
          </p>
        </div>
      </div>

      {!student.isEmailVerified && (
        <div className="verification-banner">
          <span>Your email address isn't verified yet.</span>
          <button className="link-btn" onClick={handleResendVerification} disabled={resending}>
            {resending ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      )}

      <form className="profile-card profile-form" onSubmit={handleSubmit}>
        {status && (
          <div className={status.type === "success" ? "auth-success" : "auth-error"}>{status.message}</div>
        )}

        <div className="profile-picture-row">
          <div className="profile-picture-preview">
            {picturePreview ? (
              <img src={picturePreview} alt="Profile" />
            ) : (
              <span className="profile-picture-initial">{student.fullName?.[0]?.toUpperCase() || "?"}</span>
            )}
          </div>
          <div>
            <label className="btn-secondary profile-picture-btn">
              Change photo
              <input type="file" accept="image/*" onChange={handlePictureSelect} hidden />
            </label>
            <p className="profile-picture-hint">JPG or PNG, resized automatically.</p>
          </div>
        </div>

        <label>Full name</label>
        <input value={form.fullName} onChange={updateField("fullName")} required />

        <label>Student ID</label>
        <input value={student.studentId} disabled />

        <label>Course</label>
        <input value={form.course} onChange={updateField("course")} required />

        <label>Phone number</label>
        <input value={form.phoneNumber} onChange={updateField("phoneNumber")} required />

        <label>Email address</label>
        <input type="email" value={form.email} onChange={updateField("email")} required />
        <p className="profile-field-hint">
          Changing email or phone requires confirming via a link sent to your email.
        </p>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Submitting..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

// Resizes an image file down to maxDimension on its longest side and returns a base64 data URL
function resizeImage(file, maxDimension) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
