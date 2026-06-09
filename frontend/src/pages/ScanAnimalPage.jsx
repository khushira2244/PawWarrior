import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppBrandHeader from "../components/layout/AppBrandHeader";
import { runGeminiMission, uploadAnimalPhoto } from "../api/pawwarriorApi";
import "./ScanAnimalPage.css";

const DEMO_LOCATION = {
  lat: 17.4646,
  lng: 78.3551,
  label: "Teapical, Masjid Banda, Kondapur",
  area: "Kondapur",
  city: "Hyderabad",
  state: "Telangana",
  country: "India",
};

function ScanAnimalPage() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const scanLocation = routeLocation.state?.scanLocation || DEMO_LOCATION;

  const [form, setForm] = useState({
    color: "",
    size: "",
    uniqueMarks: "",
    condition: "",
    initialAction: "observed_only",
  });

  const [scanImageFile, setScanImageFile] = useState(null);
  const [scanImagePreview, setScanImagePreview] = useState(
    "/images/dog/Demo_dog.jpg"
  );
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [nearbyResult, setNearbyResult] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [createdResult, setCreatedResult] = useState(null);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageCapture = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setScanImageFile(file);
    setScanImagePreview(URL.createObjectURL(file));
    setUploadedPhotoUrl("");
  };

  const checkNearbyProfiles = async () => {
    try {
      setLoading(true);
      setMessage("");
      setConfirmation(null);
      setCreatedResult(null);

      const response = await runGeminiMission({
        mission:
          "I found a dog near this location. Check whether it may already be registered before creating a new profile.",
        userId: "demo_user_001",
        context: {
          location: scanLocation,
        },
      });

      setNearbyResult(response);
      setMessage("Nearby profile check completed.");
    } catch (err) {
      setMessage(err.message || "Failed to check nearby profiles.");
    } finally {
      setLoading(false);
    }
  };

  const createNewDogProposal = async () => {
    try {
      setLoading(true);
      setMessage("");
      setConfirmation(null);
      setCreatedResult(null);

      const uniqueMarks = form.uniqueMarks
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      let photoUrl = uploadedPhotoUrl;

      if (scanImageFile && !photoUrl) {
        setMessage("Uploading dog photo...");

        const uploadResponse = await uploadAnimalPhoto(scanImageFile);
        photoUrl = uploadResponse?.data?.photoUrl;

        if (photoUrl) {
          setUploadedPhotoUrl(photoUrl);
        }
      }

      const response = await runGeminiMission({
        mission:
          "I reviewed nearby profiles and none match. Create a new profile for this dog.",
        userId: "demo_user_001",
        context: {
          noMatchConfirmed: true,
          location: scanLocation,
          photoUrl,
          identityFeatures: {
            color: form.color,
            size: form.size,
            uniqueMarks,
          },
          condition: form.condition,
          initialAction: form.initialAction,
        },
      });

      if (response.mode === "confirmation_required") {
        setConfirmation(response.confirmationRequest);
        setMessage("Gemini prepared a new dog profile. Confirm to create it.");
        return;
      }

      setCreatedResult(response);
      setMessage("New dog flow completed.");
    } catch (err) {
      setMessage(err.message || "Failed to prepare new dog creation.");
    } finally {
      setLoading(false);
    }
  };

  const confirmCreateDog = async () => {
    if (!confirmation) return;

    try {
      setLoading(true);
      setMessage("");

      const response = await runGeminiMission(confirmation);

      console.log("CREATE DOG RESPONSE:", response);

      setCreatedResult(response);
      setConfirmation(null);

      const newAnimalId =
        response?.execution?.result?.data?.animal?.id ||
        response?.execution?.result?.data?.newAnimal?.id ||
        response?.execution?.result?.data?.createdAnimal?.id ||
        response?.execution?.result?.data?.createdAnimalProfile?.id ||
        response?.execution?.result?.data?.animalProfile?.id ||
        response?.execution?.result?.data?.data?.animal?.id ||
        response?.data?.animal?.id ||
        response?.animal?.id;

      setMessage("New dog profile created successfully.");

      if (newAnimalId) {
        navigate(`/animals/${newAnimalId}`);
      }
    } catch (err) {
      setMessage(err.message || "Failed to confirm dog creation.");
    } finally {
      setLoading(false);
    }
  };

  const possibleMatches =
    nearbyResult?.execution?.result?.data?.possibleMatches ||
    nearbyResult?.execution?.result?.data?.nearbyAnimals ||
    nearbyResult?.execution?.result?.data ||
    [];

  return (
    <section className="scan-page">
      <AppBrandHeader />

      <div className="scan-layout">
        <article className="scan-preview-card">
          <p className="scan-eyebrow">New animal scan</p>

          <h1>Scan a dog near you</h1>

          <p>
            Add visible details. Gemini checks nearby profiles first, then asks
            for confirmation before creating a new profile.
          </p>

          <div className="scan-image-box">
            <img
              src={scanImagePreview}
              alt="Captured dog scan"
              onError={(event) => {
                event.currentTarget.src = "/images/dog/Demo_dog.jpg";
              }}
            />

            <label className="scan-camera-button">
              Open Camera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
              />
            </label>
          </div>

          <div className="scan-location-box">
            <strong>Scan location</strong>
            <span>
              {scanLocation.label || "Current GPS location"} ·{" "}
              {Number(scanLocation.lat).toFixed(5)},{" "}
              {Number(scanLocation.lng).toFixed(5)}
            </span>
          </div>
        </article>

        <aside className="scan-form-card">
          <h2>Dog details</h2>

          <label>
            Color
            <input
              value={form.color}
              onChange={(event) => updateField("color", event.target.value)}
              placeholder="Example: brown and white"
            />
          </label>

          <label>
            Size
            <select
              value={form.size}
              onChange={(event) => updateField("size", event.target.value)}
            >
              <option value="">Select size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>

          <label>
            Unique marks
            <input
              value={form.uniqueMarks}
              onChange={(event) =>
                updateField("uniqueMarks", event.target.value)
              }
              placeholder="Example: white chest patch, black tail tip"
            />
          </label>

          <label>
            Condition observed
            <textarea
              value={form.condition}
              onChange={(event) => updateField("condition", event.target.value)}
              placeholder="Example: looks weak, thin, skin patch, normal..."
              rows={4}
            />
          </label>

          <label>
            What did you do?
            <select
              value={form.initialAction}
              onChange={(event) =>
                updateField("initialAction", event.target.value)
              }
            >
              <option value="observed_only">Only observed</option>
              <option value="water_given">Gave water</option>
              <option value="food_given">Gave food</option>
              <option value="reported_problem">Reported problem</option>
            </select>
          </label>

          <div className="scan-button-row">
            <button onClick={checkNearbyProfiles} disabled={loading}>
              {loading ? "Checking..." : "Check nearby profiles"}
            </button>

            <button onClick={createNewDogProposal} disabled={loading}>
              {loading ? "Preparing..." : "None match, create new"}
            </button>
          </div>

          {message && <p className="scan-message">{message}</p>}

          {confirmation && (
            <div className="scan-inline-confirm">
              <h3>Confirm new dog profile</h3>

              <p>
                Gemini selected <strong>{confirmation.toolName}</strong>. This
                will create a dog profile, initial log, follow-up case, vet
                suggestion, and AgentRun timeline.
              </p>

              <div className="scan-button-row">
                <button onClick={confirmCreateDog} disabled={loading}>
                  {loading ? "Creating..." : "Confirm and create"}
                </button>

                <button onClick={() => setConfirmation(null)} disabled={loading}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {nearbyResult && (
        <section className="scan-result-card">
          <h2>Nearby profile check</h2>

          <p>
            If one of these looks like the same dog, open that profile. If not,
            create a new profile after confirmation.
          </p>

          <div className="scan-match-grid">
            {Array.isArray(possibleMatches) && possibleMatches.length > 0 ? (
              possibleMatches.slice(0, 6).map((item) => {
                const animal = item.animal || item;
                const animalId = animal.id || item.animalId;

                return (
                  <button
                    key={animalId}
                    className="scan-match-card"
                    onClick={() => animalId && navigate(`/animals/${animalId}`)}
                  >
                    <strong>{animal.name || animalId}</strong>

                    <span>
                      {animal?.usualLocations?.[0]?.label ||
                        animal?.location?.label ||
                        "Nearby profile"}
                    </span>
                  </button>
                );
              })
            ) : (
              <p>No clear nearby matches shown.</p>
            )}
          </div>
        </section>
      )}

      {createdResult && (
        <section className="scan-result-card">
          <h2>Creation result</h2>
          <pre>{JSON.stringify(createdResult, null, 2)}</pre>
        </section>
      )}
    </section>
  );
}

export default ScanAnimalPage;