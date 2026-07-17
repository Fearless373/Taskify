const TYPE_LABELS = {
  assignment: "Assignment",
  project: "Project work",
  midsem: "Midsem exam",
  semester_exam: "End of semester exam",
  lecture: "Lecture",
};

export default function ActivityCard({ activity, onEdit, onDelete }) {
  const start = new Date(activity.startTime);

  return (
    <div className={`activity-card type-${activity.type}`}>
      <div className="activity-card-eyebrow">{TYPE_LABELS[activity.type] || activity.type}</div>
      <h3 className="activity-card-title">{activity.title}</h3>
      <p className="activity-card-course">{activity.course}</p>
      {activity.description && <p className="activity-card-desc">{activity.description}</p>}
      <div className="activity-card-time">
        {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
        {" · "}
        {start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
      </div>
      {(onEdit || onDelete) && (
        <div className="activity-card-actions">
          {onEdit && (
            <button className="link-btn" onClick={() => onEdit(activity)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="link-btn danger" onClick={() => onDelete(activity._id)}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
