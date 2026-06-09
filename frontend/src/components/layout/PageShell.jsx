import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

function PageShell({ children }) {
  const location = useLocation();
  const isMapPage = location.pathname === "/map";

  return (
    <div className={isMapPage ? "app-shell app-shell--map" : "app-shell"}>
      {!isMapPage && <Navbar />}
      <main className={isMapPage ? "page-content page-content--map" : "page-content"}>
        {children}
      </main>
    </div>
  );
}

export default PageShell;