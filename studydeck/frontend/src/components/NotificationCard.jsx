import { useRef, useState } from "react";

const SWIPE_DISMISS_THRESHOLD = 90; // px dragged left before a swipe counts as "delete"

export default function NotificationCard({ notification, onEdit, onDelete }) {
  const trigger = new Date(notification.triggerAt);
  const isCustom = notification.source === "custom";

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  function handleTouchStart(e) {
    startX.current = e.touches[0].clientX;
    setDragging(true);
  }

  function handleTouchMove(e) {
    if (!dragging) return;
    const delta = e.touches[0].clientX - startX.current;
    // Only allow dragging left (negative), and clamp how far it can go
    setDragX(Math.max(delta, -140));
  }

  function handleTouchEnd() {
    setDragging(false);
    if (dragX <= -SWIPE_DISMISS_THRESHOLD) {
      onDelete?.(notification._id);
    }
    setDragX(0);
  }

  return (
    <div className="notification-swipe-wrapper">
      <div className="notification-swipe-delete-hint">Release to clear</div>
      <div
        className={`notification-card ${notification.isRead ? "read" : ""}`}
        style={{ transform: `translateX(${dragX}px)`, transition: dragging ? "none" : "transform 0.2s ease" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
        <div className="notification-actions">
          {isCustom && onEdit && (
            <button className="link-btn" onClick={() => onEdit(notification)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="link-btn danger" onClick={() => onDelete(notification._id)}>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
