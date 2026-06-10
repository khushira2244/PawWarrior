import { Routes, Route } from "react-router-dom";

import PageShell from "./components/layout/PageShell";
import JudgeAccessGate from "./components/auth/JudgeAccessGate";

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

        <Route
          path="/map"
          element={
            <JudgeAccessGate>
              <MapPage />
            </JudgeAccessGate>
          }
        />

        <Route
          path="/animals/:animalId"
          element={
            <JudgeAccessGate>
              <AnimalProfilePage />
            </JudgeAccessGate>
          }
        />

        <Route
          path="/scan"
          element={
            <JudgeAccessGate>
              <ScanAnimalPage />
            </JudgeAccessGate>
          }
        />

        <Route
          path="/mission"
          element={
            <JudgeAccessGate>
              <GeminiMissionPage />
            </JudgeAccessGate>
          }
        />
      </Routes>
    </PageShell>
  );
}

export default App;