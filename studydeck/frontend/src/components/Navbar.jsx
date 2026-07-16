import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  if (!student) return null;

  function handleLogout() {
    logout();
    navigate("/signin");
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-mark">SD</span>
        <span className="navbar-title">StudyDeck</span>
      </div>
      <nav className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
        <NavLink to="/expired" className={({ isActive }) => (isActive ? "active" : "")}>
          Expired
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => (isActive ? "active" : "")}>
          Notifications
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
          Profile
        </NavLink>
      </nav>
      <button className="navbar-logout" onClick={handleLogout}>
        Sign out
      </button>
    </header>
  );
}
