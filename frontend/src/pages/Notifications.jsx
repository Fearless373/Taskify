import { useEffect, useState } from "react";
import api from "../api/axios";
import NotificationCard from "../components/NotificationCard";

const emptyForm = { title: "", message: "", triggerAt: "" };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(notification) {
    setForm({
      title: notification.title,
      message: notification.message || "",
      triggerAt: toLocalInput(notification.triggerAt),
    });
    setEditingId(notification._id);
    setShowForm(true);
  }

  function toLocalInput(dateStr) {
    const d = new Date(dateStr);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/notifications/${editingId}`, form);
      } else {
        await api.post("/notifications", form);
      }
      setShowForm(false);
      loadNotifications();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save notification");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this reminder?")) return;
    await api.delete(`/notifications/${id}`);
    loadNotifications();
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-subtitle">Automatic deadline reminders and your own custom ones.</p>
        </div>
        <button className="btn-primary" onClick={openCreateForm}>
          + New reminder
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && notifications.length === 0 && (
        <div className="empty-state">No notifications yet. Reminders appear here as deadlines approach.</div>
      )}

      <div className="notification-list">
        {notifications.map((n) => (
          <NotificationCard key={n._id} notification={n} onEdit={openEditForm} onDelete={handleDelete} />
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editingId ? "Edit reminder" : "New reminder"}</h2>
            {error && <div className="auth-error">{error}</div>}

            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

            <label>Message (optional)</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} />

            <label>Remind me at</label>
            <input type="datetime-local" value={form.triggerAt} onChange={(e) => setForm({ ...form, triggerAt: e.target.value })} required />

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? "Save changes" : "Create reminder"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
