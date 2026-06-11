export const buildWhatsAppVetLink = ({ vet, animal, caseData }) => {
  const phone = vet?.whatsappNumber || vet?.phone || "";

  if (!phone) return "";

  const location = animal?.usualLocations?.[0] || animal?.location || {};

  const message = `
Hello ${vet?.doctorName || "Doctor"},
PawWarrior vet guidance is requested.

Animal: ${animal?.name || animal?.id || "Community Dog"}
Animal ID: ${animal?.id || ""}
Status: ${animal?.currentCondition || "follow-up needed"}
Location: ${location.label || "Current scan location"}
Case: ${caseData?.title || caseData?.caseType || "Vet guidance needed"}

Please guide safe food, water, handling, and follow-up steps.
PawWarrior does not diagnose or suggest medicine without vet guidance.
`.trim();

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const buildPhoneLink = (vet) => {
  const phone = vet?.phone || vet?.whatsappNumber || "";

  if (!phone) return "";

  return `tel:+${phone}`;
};