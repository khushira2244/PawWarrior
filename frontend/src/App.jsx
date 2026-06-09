import { Routes, Route } from "react-router-dom";

import PageShell from "./components/layout/PageShell";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
import AnimalProfilePage from "./pages/AnimalProfilePage";
import ScanAnimalPage from "./pages/ScanAnimalPage";
import GeminiMissionPage from "./pages/GeminiMissionPage";

function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/animals/:animalId" element={<AnimalProfilePage />} />
        <Route path="/scan" element={<ScanAnimalPage />} />
        <Route path="/mission" element={<GeminiMissionPage />} />
      </Routes>
    </PageShell>
  );
}

export default App;