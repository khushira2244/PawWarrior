import { NavLink } from "react-router-dom";

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/map">🗺️ Map</NavLink>
      <NavLink to="/scan">📷 Scan</NavLink>
      <NavLink to="/mission">✨ AI</NavLink>
    </nav>
  );
}

export default BottomNav;