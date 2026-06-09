import { useNavigate } from "react-router-dom";

function MapDogMarker({ animal, index = 0 }) {
  const navigate = useNavigate();

  const status = animal?.mapStatus?.mapStatus || "orange";

  const markerStyle = {
    left: `${18 + (index % 4) * 18}%`,
    top: `${22 + (index % 5) * 12}%`,
  };

  return (
    <button
      className={`map-marker map-marker--${status}`}
      style={markerStyle}
      onClick={() => navigate(`/animals/${animal.id}`)}
      title={animal.name}
    >
      🐕
      <span>{animal.name}</span>
    </button>
  );
}

export default MapDogMarker;