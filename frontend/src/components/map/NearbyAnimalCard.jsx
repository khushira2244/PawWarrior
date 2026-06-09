import { useNavigate } from "react-router-dom";
import AnimalImage from "../animal/AnimalImage";
import StatusBadge from "../animal/StatusBadge";
import CareNeedChips from "../animal/CareNeedChips";

function NearbyAnimalCard({ animal }) {
  const navigate = useNavigate();

  const status = animal?.mapStatus?.mapStatus || "orange";
  const needs = animal?.mapStatus?.primaryNeed || [];

  return (
    <article className="nearby-card" onClick={() => navigate(`/animals/${animal.id}`)}>
      <AnimalImage animal={animal} className="nearby-card__image" />

      <div className="nearby-card__content">
        <div className="nearby-card__top">
          <h3>{animal.name}</h3>
          <StatusBadge status={status} />
        </div>

        <p className="nearby-card__location">
          {animal.usualLocations?.[0]?.label || "Location not available"}
        </p>

        <CareNeedChips needs={needs} />
      </div>
    </article>
  );
}

export default NearbyAnimalCard;