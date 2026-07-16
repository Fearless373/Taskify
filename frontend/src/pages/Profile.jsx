import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { student } = useAuth();
  if (!student) return null;

  const rows = [
    ["Full name", student.fullName],
    ["Student ID", student.studentId],
    ["Course", student.course],
    ["Email", student.email],
    ["Phone number", student.phoneNumber],
    ["Email verified", student.isEmailVerified ? "Yes" : "Not yet verified"],
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="page-subtitle">Your account details.</p>
        </div>
      </div>

      <div className="profile-card">
        {rows.map(([label, value]) => (
          <div className="profile-row" key={label}>
            <span className="profile-label">{label}</span>
            <span className="profile-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
