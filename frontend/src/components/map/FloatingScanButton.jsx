import { useNavigate } from "react-router-dom";

function FloatingScanButton() {
  const navigate = useNavigate();

  return (
    <button className="floating-scan-button" onClick={() => navigate("/scan")}>
      + Scan New Dog
    </button>
  );
}

export default FloatingScanButton;