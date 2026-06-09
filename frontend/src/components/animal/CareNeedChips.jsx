function CareNeedChips({ needs = [] }) {
  if (!needs?.length) {
    return <p className="muted-text">No urgent care needs listed.</p>;
  }

  return (
    <div className="chip-row">
      {needs.map((need) => (
        <span key={need} className="care-chip">
          {need.replaceAll("_", " ")}
        </span>
      ))}
    </div>
  );
}

export default CareNeedChips;