export const getStatusFromAnimal = (animal) => {
  return animal?.mapStatus?.mapStatus || "orange";
};

export const getStatusLabel = (status) => {
  const labels = {
    green: "Stable",
    yellow: "Food / water needed",
    orange: "Follow-up needed",
    red: "Vet guidance needed",
  };

  return labels[status] || "Follow-up needed";
};