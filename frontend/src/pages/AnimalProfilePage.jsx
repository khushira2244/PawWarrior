import { getDogImagePath } from "../utils/imagePath";
import {
  buildWhatsAppVetLink,
  buildPhoneLink,
} from "../utils/contactLinks";
import "./AnimalProfilePage.css";
import { useNavigate, useParams } from "react-router-dom";
import AppBrandHeader from "../components/layout/AppBrandHeader";
import {
  getAnimalById,
  getCareLogsByAnimal,
  getCasesByAnimal,
  getCareFundsByAnimal,
  getVetAdviceByAnimal,
  getAgentRunsByAnimal,
  getNearbyVets,
  runGeminiMission,
} from "../api/pawwarriorApi";

import "./AnimalProfilePage.css";
import { useEffect, useState } from "react";

const getAnimalLocation = (animal) => {
  return animal?.usualLocations?.[0] || animal?.location || null;
};

const getStatus = (animal) => {
  return animal?.mapStatus?.mapStatus || "orange";
};

function AnimalProfilePage() {
  const { animalId } = useParams();

  const [animal, setAnimal] = useState(null);
  const [careLogs, setCareLogs] = useState([]);
  const [cases, setCases] = useState([]);
  const [funds, setFunds] = useState([]);
  const [vetAdvice, setVetAdvice] = useState([]);
  const [agentRuns, setAgentRuns] = useState([]);
  const [nearbyVets, setNearbyVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const animalResponse = await getAnimalById(animalId);
      const currentAnimal = animalResponse.data;

      setAnimal(currentAnimal);

      const location = getAnimalLocation(currentAnimal);

      const [
        careLogsResponse,
        casesResponse,
        fundsResponse,
        vetAdviceResponse,
        agentRunsResponse,
        nearbyVetsResponse,
      ] = await Promise.allSettled([
        getCareLogsByAnimal(animalId),
        getCasesByAnimal(animalId),
        getCareFundsByAnimal(animalId),
        getVetAdviceByAnimal(animalId),
        getAgentRunsByAnimal(animalId),
        location
          ? getNearbyVets({
            lat: location.lat,
            lng: location.lng,
            radius: 3000,
          })
          : Promise.resolve({ data: [] }),
      ]);

      if (careLogsResponse.status === "fulfilled") {
        setCareLogs(careLogsResponse.value.data || []);
      }

      if (casesResponse.status === "fulfilled") {
        setCases(casesResponse.value.data || []);
      }

      if (fundsResponse.status === "fulfilled") {
        setFunds(fundsResponse.value.data || []);
      }

      if (vetAdviceResponse.status === "fulfilled") {
        setVetAdvice(vetAdviceResponse.value.data || []);
      }

      if (agentRunsResponse.status === "fulfilled") {
        setAgentRuns(agentRunsResponse.value.data || []);
      }

      if (nearbyVetsResponse.status === "fulfilled") {
        setNearbyVets(nearbyVetsResponse.value.data || []);
      }
    } catch (err) {
      setMessage(err.message || "Failed to load animal profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [animalId]);

  const runCareMission = async (actionType) => {
    if (!animal) return;

    const location = getAnimalLocation(animal);

    const actionText = {
      water_given: `I gave ${animal.name} clean water near ${location?.label || "the location"
        }.`,
      food_given: `I gave ${animal.name} food near ${location?.label || "the location"
        }.`,
      observed_only: `I only observed ${animal.name} today near ${location?.label || "the location"
        }.`,
      reported_problem: `I noticed a problem with ${animal.name} and want to report it.`,
    };

    try {
      setActionLoading(true);
      setMessage("");

      const response = await runGeminiMission({
        mission: actionText[actionType],
        userId: "demo_user_001",
        context: {
          animalId: animal.id,
          animalName: animal.name,
          location,
        },
      });

      if (response.mode === "confirmation_required") {
        setConfirmation(response.confirmationRequest);
        setMessage("Gemini needs your confirmation before saving this action.");
        return;
      }

      setMessage("Action completed.");
      await loadProfile();
    } catch (err) {
      setMessage(err.message || "Failed to run care mission");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmAction = async () => {
    if (!confirmation) return;

    try {
      setActionLoading(true);
      setMessage("");

      const response = await runGeminiMission(confirmation);

      if (response.success) {
        setMessage("Confirmed action saved successfully.");
        setConfirmation(null);
        await loadProfile();
      }
    } catch (err) {
      setMessage(err.message || "Failed to confirm action");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="dog-profile-page">
        <AppBrandHeader />
        <div className="dog-profile-state">Loading dog profile...</div>
      </section>
    );
  }

  if (!animal) {
    return (
      <section className="dog-profile-page">
        <AppBrandHeader />
        <div className="dog-profile-state">Dog not found.</div>
      </section>
    );
  }

  const location = getAnimalLocation(animal);
  const status = getStatus(animal);
  const needs = animal?.mapStatus?.primaryNeed || animal?.careTags || [];
  const latestRun = agentRuns?.[0];

  const selectedCase = cases?.[0];

  const DEMO_VET = {
    id: "vet_demo_001",
    doctorName: "Aman Kumar",
    name: "Aman Kumar",
    clinicName: "PawWarrior Demo Vet Guidance",
    area: "Remote demo guidance",
    phone: "919570143013",
    whatsappNumber: "919570143013",
    chatLink: "https://wa.me/919570143013",
    partnershipStatus: "demo_partner",
  };

  const selectedVet =
    nearbyVets?.find((vet) => vet.partnershipStatus === "demo_partner") ||
    DEMO_VET;

  const whatsappLink =
    buildWhatsAppVetLink({
      vet: selectedVet,
      animal,
      caseData: selectedCase,
    }) || selectedVet.chatLink;

  const phoneLink = buildPhoneLink(selectedVet) || "tel:+919570143013";

  return (
    <section className="dog-profile-page">
      <AppBrandHeader />

      <div className="dog-profile-grid">
        <article className="dog-main-card">
          <div className="dog-photo-wrap">
            <img
              src={getDogImagePath(animal.photos?.[0])}
              alt={animal.name}
              className="dog-photo"
              onError={(event) => {
                event.currentTarget.src = "/images/dog/Demo_dog.png";
              }}
            />

            <a
              className={`dog-status dog-status--${status}`}
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              title="Open vet guidance on WhatsApp"
            >
              {animal?.mapStatus?.statusLabel || "Vet Guidance Needed"}
            </a>
          </div>

          <div className="dog-main-info">
            <p className="dog-eyebrow">Community dog profile</p>

            <h1>{animal.name}</h1>

            <p>{location?.label || "Location not available"}</p>

            <div className="dog-chip-row">
              {(needs || []).slice(0, 5).map((need) => (
                <span key={need} className="dog-chip">
                  {String(need).replaceAll("_", " ")}
                </span>
              ))}
            </div>

            <section className="dog-action-card dog-action-card--inside">
              <h2>Care action</h2>

              <p>
                Log real care only after it happened. Gemini will ask confirmation
                before saving.
              </p>

              <div className="dog-action-grid">
                <button
                  onClick={() => runCareMission("water_given")}
                  disabled={actionLoading}
                >
                  Gave water
                </button>

                <button
                  onClick={() => runCareMission("food_given")}
                  disabled={actionLoading}
                >
                  Gave food
                </button>

                <button
                  onClick={() => runCareMission("observed_only")}
                  disabled={actionLoading}
                >
                  Observed
                </button>

                <button
                  onClick={() => runCareMission("reported_problem")}
                  disabled={actionLoading}
                >
                  Report problem
                </button>
              </div>

              {message && <p className="dog-message">{message}</p>}

              {confirmation && (
                <div className="dog-confirm-box">
                  <strong>Confirm action?</strong>

                  <p>{confirmation.toolName}</p>

                  <button onClick={confirmAction} disabled={actionLoading}>
                    Confirm and save
                  </button>

                  <button
                    onClick={() => setConfirmation(null)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </section>
          </div>
        </article>
      </div>

      <section className="dog-panel dog-recent-logs-panel">
        <h2>Recent care logs</h2>

        {careLogs?.length ? (
          careLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="dog-list-item">
              <strong>{log.actionType?.replaceAll("_", " ")}</strong>
              <span>{log.notes}</span>
            </div>
          ))
        ) : (
          <p>No care logs yet.</p>
        )}
      </section>

      <div className="dog-info-grid">
        <section className="dog-panel">
          <h2>Care memory</h2>

          <div className="dog-stat-row">
            <span>Food this week</span>
            <strong>{animal.foodCountThisWeek ?? 0}</strong>
          </div>

          <div className="dog-stat-row">
            <span>Water this week</span>
            <strong>{animal.waterCountThisWeek ?? 0}</strong>
          </div>

          <div className="dog-stat-row">
            <span>Seen by community</span>
            <strong>{animal.seenByCommunityCount ?? 0}</strong>
          </div>
        </section>

        <section className="dog-panel dog-vet-escalation">
          <h2>Vet guidance</h2>

          <p>
            PawWarrior prepares a safe case summary and connects the helper to vet
            guidance. It does not diagnose or suggest medicine by itself.
          </p>

          <div className="dog-list-item dog-vet-card">
            <strong>
              {selectedVet?.doctorName || selectedVet?.name || "Aman Kumar"}
            </strong>

            <span>
              {selectedVet?.clinicName || "PawWarrior Demo Vet Guidance"}
            </span>

            <span>{selectedVet?.area || "Remote demo guidance"}</span>

            <div className="vet-actions">
              <a href={whatsappLink} target="_blank" rel="noreferrer">
                WhatsApp Vet
              </a>

              <a href={phoneLink}>
                Call Vet
              </a>
            </div>
          </div>
        </section>

        <section className="dog-panel">
          <h2>Open cases</h2>

          {cases?.length ? (
            cases.slice(0, 3).map((item) => (
              <div key={item.id} className="dog-list-item">
                <strong>{item.title || item.caseType}</strong>
                <span>
                  {item.priority} · {item.status}
                </span>
              </div>
            ))
          ) : (
            <p>No open cases.</p>
          )}
        </section>

        <section className="dog-panel">
          <h2>Care fund</h2>

          {funds?.length ? (
            funds.slice(0, 2).map((fund) => (
              <div key={fund.id} className="dog-list-item">
                <strong>₹{fund.collectedAmount || 0} collected</strong>
                <span>Remaining ₹{fund.remainingAmount || 0}</span>
              </div>
            ))
          ) : (
            <p>No active care fund.</p>
          )}
        </section>
      </div>

      <section className="dog-panel dog-timeline-panel">
        <h2>Agent timeline</h2>

        {latestRun ? (
          <div className="agent-run">
            <div>
              <strong>{latestRun.trigger}</strong>
              <span>
                {latestRun.status} · {latestRun.mapFlag}
              </span>
            </div>

            <ol>
              {(latestRun.steps || []).map((step, index) => (
                <li key={`${step.agent}-${index}`}>
                  <strong>{step.agent}</strong>
                  <p>{step.result}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p>No agent runs yet.</p>
        )}
      </section>
    </section>
  );
}

export default AnimalProfilePage;