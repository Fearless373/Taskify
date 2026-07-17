import { useEffect, useState } from "react";
import api from "../api/axios";
import ActivityCard from "../components/ActivityCard";

const emptyForm = { title: "", description: "", course: "", type: "assignment", startTime: "", endTime: "" };

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);
    try {
      const res = await api.get("/activities");
      setActivities(res.data.activities);
    } catch (err) {
      setError("Could not load activities");
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(activity) {
    setForm({
      title: activity.title,
      description: activity.description || "",
      course: activity.course,
      type: activity.type,
      startTime: toLocalInput(activity.startTime),
      endTime: activity.endTime ? toLocalInput(activity.endTime) : "",
    });
    setEditingId(activity._id);
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
        await api.put(`/activities/${editingId}`, form);
      } else {
        await api.post("/activities", form);
      }
      setShowForm(false);
      loadActivities();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save activity");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this activity?")) return;
    await api.delete(`/activities/${id}`);
    loadActivities();
  }

  const grouped = groupByType(activities);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>What's due</h1>
          <p className="page-subtitle">Upcoming assignments, project work, midsems, and lectures.</p>
        </div>
        <button className="btn-primary" onClick={openCreateForm}>
          + Add activity
        </button>
      </div>

      {loading && <p>Loading activities...</p>}
      {!loading && activities.length === 0 && (
        <div className="empty-state">Nothing scheduled yet. Add your first activity to start tracking deadlines.</div>
      )}

      {Object.entries(grouped).map(([type, items]) =>
        items.length ? (
          <section key={type} className="activity-section">
            <h2 className="section-label">{sectionLabel(type)}</h2>
            <div className="activity-grid">
              {items.map((activity) => (
                <ActivityCard key={activity._id} activity={activity} onEdit={openEditForm} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        ) : null
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editingId ? "Edit activity" : "New activity"}</h2>
            {error && <div className="auth-error">{error}</div>}

            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="assignment">Assignment</option>
              <option value="project">Project work</option>
              <option value="midsem">Midsem exam</option>
              <option value="semester_exam">End of semester exam</option>
              <option value="lecture">Lecture</option>
            </select>

            <label>Course</label>
            <input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required />

            <label>Description (optional)</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />

            <label>Start date & time</label>
            <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />

            <label>End date & time (optional)</label>
            <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? "Save changes" : "Add activity"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function groupByType(activities) {
  return {
    lecture: activities.filter((a) => a.type === "lecture"),
    assignment: activities.filter((a) => a.type === "assignment"),
    project: activities.filter((a) => a.type === "project"),
    midsem: activities.filter((a) => a.type === "midsem"),
    semester_exam: activities.filter((a) => a.type === "semester_exam"),
  };
}

function sectionLabel(type) {
  const map = {
    lecture: "Incoming lectures",
    assignment: "Assignments",
    project: "Project work",
    midsem: "Midsem exams",
    semester_exam: "End of semester exams",
  };
  return map[type] || type;
}
