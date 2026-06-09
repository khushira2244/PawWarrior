const statusLabels = {
  green: "Stable",
  yellow: "Food / water needed",
  orange: "Follow-up needed",
  red: "Vet guidance needed",
};

function StatusBadge({ status = "orange" }) {
  const safeStatus = status || "orange";

  return (
    <span className={`status-badge status-badge--${safeStatus}`}>
      {statusLabels[safeStatus] || safeStatus}
    </span>
  );
}

export default StatusBadge;