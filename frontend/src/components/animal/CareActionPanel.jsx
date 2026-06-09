function CareActionPanel({ animal, onCareAction }) {
  const actions = [
    {
      label: "I gave water",
      actionType: "water_given",
      mission: `I gave ${animal?.name || "this dog"} clean water near the location.`,
    },
    {
      label: "I gave food",
      actionType: "food_given",
      mission: `I gave ${animal?.name || "this dog"} food near the location.`,
    },
    {
      label: "Only observed",
      actionType: "observed_only",
      mission: `I only observed ${animal?.name || "this dog"} today.`,
    },
    {
      label: "Report problem",
      actionType: "reported_problem",
      mission: `I noticed a problem with ${animal?.name || "this dog"}.`,
    },
  ];

  return (
    <section className="panel">
      <h3>Care actions</h3>
      <div className="action-grid">
        {actions.map((item) => (
          <button
            key={item.actionType}
            className="action-button"
            onClick={() => onCareAction?.(item)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default CareActionPanel;