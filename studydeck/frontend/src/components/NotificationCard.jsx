export default function NotificationCard({ notification, onEdit, onDelete }) {
  const trigger = new Date(notification.triggerAt);
  const isCustom = notification.source === "custom";

  return (
    <div className={`notification-card ${notification.isRead ? "read" : ""}`}>
      <div className="notification-card-top">
        <span className={`notification-badge ${isCustom ? "custom" : "auto"}`}>
          {isCustom ? "Your reminder" : "Auto reminder"}
        </span>
        <span className="notification-time">
          {trigger.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          {" · "}
          {trigger.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <h4 className="notification-title">{notification.title}</h4>
      {notification.message && <p className="notification-message">{notification.message}</p>}
      {isCustom && (onEdit || onDelete) && (
        <div className="notification-actions">
          {onEdit && (
            <button className="link-btn" onClick={() => onEdit(notification)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="link-btn danger" onClick={() => onDelete(notification._id)}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
