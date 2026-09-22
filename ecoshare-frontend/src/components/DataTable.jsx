import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function DataTable({ items = [] }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <div>
          <h4>No donations available</h4>
          <p>No food donations match the selected filter right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-shell">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Donation</th>
              <th>Donor</th>
              <th>Quantity</th>
              <th>Expires</th>
              <th>AI Match</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((food) => (
              <tr key={food._id}>
                <td className="feed-name">{food.foodName}</td>
                <td>{food.donorName}</td>
                <td>{food.quantity} servings</td>
                <td>{new Date(food.expiryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                <td>
                  {food.recommendation?.confidenceScore ? (
                    <span className="score-pill">{food.recommendation.confidenceScore}%</span>
                  ) : (
                    <span className="score-pill score-pill--muted">Verified</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${food.isEmergency ? "status-badge--danger" : food.status === "Claimed" ? "status-badge--primary" : "status-badge--success"}`}>
                    {food.isEmergency ? "Emergency" : food.status}
                  </span>
                </td>
                <td className="text-right">
                  <Link to={`/donations/${food._id}`} className="table-link">
                    View <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
