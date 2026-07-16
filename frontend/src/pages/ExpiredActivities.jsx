import { useEffect, useState } from "react";
import api from "../api/axios";
import ActivityCard from "../components/ActivityCard";

export default function ExpiredActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/activities/expired")
      .then((res) => setActivities(res.data.activities))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Expired</h1>
          <p className="page-subtitle">Assignments, project work, and midsems whose time has passed.</p>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && activities.length === 0 && <div className="empty-state">Nothing expired. You're on top of things.</div>}

      <div className="activity-grid">
        {activities.map((activity) => (
          <ActivityCard key={activity._id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
