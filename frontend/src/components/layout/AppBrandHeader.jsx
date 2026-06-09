import { Link } from "react-router-dom";

function AppBrandHeader() {
  return (
    <header className="app-brand-header">
      <Link to="/map" className="app-brand-header__logo">
        PawWarrior <span>AI</span>
      </Link>

      <p className="app-brand-header__powered">
        Powered by Gemini
      </p>
    </header>
  );
}

export default AppBrandHeader;