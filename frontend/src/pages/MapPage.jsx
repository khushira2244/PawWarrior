import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";

import { getAnimals, getNearbyAnimals } from "../api/pawwarriorApi";
import "./MapPage.css";
import AppBrandHeader from "../components/layout/AppBrandHeader";

const FALLBACK_LOCATION = {
  lat: 17.4646,
  lng: 78.3551,
  label: "Teapical, Masjid Banda, Kondapur",
  area: "Kondapur",
  city: "Hyderabad",
  state: "Telangana",
  country: "India",
};

const getAnimalLocation = (animal) => {
  const location = animal?.usualLocations?.[0] || animal?.location;

  if (!location?.lat || !location?.lng) return null;

  return {
    lat: Number(location.lat),
    lng: Number(location.lng),
    label: location.label || "Known animal location",
    area: location.area || "",
  };
};

const getMarkerStatus = (animal) => {
  return animal?.mapStatus?.mapStatus || "orange";
};

const createDogMarkerIcon = (animal) => {
  const status = getMarkerStatus(animal);

  return L.divIcon({
    className: "",
    html: `
      <div class="pw-dog-pin pw-dog-pin--${status}">
        <span class="pw-dog-pin__head">🐾</span>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });
};

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location?.lat || !location?.lng) return;

    map.setView([location.lat, location.lng], 15);
  }, [location, map]);

  return null;
}

function getBrowserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        ...FALLBACK_LOCATION,
        label: "Demo location: Teapical, Masjid Banda, Kondapur",
        source: "fallback",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Your current location",
          area: "",
          city: "",
          state: "",
          country: "India",
          source: "gps",
        });
      },
      () => {
        resolve({
          ...FALLBACK_LOCATION,
          label: "Demo location: Teapical, Masjid Banda, Kondapur",
          source: "fallback",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
}

function MapPage() {
  const navigate = useNavigate();

  const [animals, setAnimals] = useState([]);
  const [userLocation, setUserLocation] = useState(FALLBACK_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const goToScan = () => {
    navigate("/scan", {
      state: {
        scanLocation: userLocation,
      },
    });
  };

  useEffect(() => {
    const loadAnimals = async () => {
      try {
        setLoading(true);
        setError("");

        const currentLocation = await getBrowserLocation();
        setUserLocation(currentLocation);

        let response;

        try {
          response = await getNearbyAnimals({
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            radius: 3000,
          });
        } catch {
          response = await getAnimals();
        }

        const animalsWithLocation = (response.data || []).filter((animal) =>
          getAnimalLocation(animal)
        );

        setAnimals(animalsWithLocation);
      } catch (err) {
        setError(err.message || "Failed to load map animals");
      } finally {
        setLoading(false);
      }
    };

    loadAnimals();
  }, []);

  return (
    <section className="pw-map-page">
      <AppBrandHeader />

      {loading && <div className="pw-map-state">Loading nearby dogs...</div>}

      {error && <div className="pw-map-state pw-map-state--error">{error}</div>}

      {!loading && !error && (
        <div className="pw-map-layout">
          <div className="pw-map-card">
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={15}
              scrollWheelZoom
              className="pw-leaflet-map"
            >
              <RecenterMap location={userLocation} />

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <CircleMarker
                center={[userLocation.lat, userLocation.lng]}
                radius={10}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#2563eb",
                  fillOpacity: 0.9,
                }}
              >
                <Popup>
                  <strong>
                    {userLocation.source === "gps"
                      ? "Your GPS location"
                      : "Demo location"}
                  </strong>
                  <br />
                  {userLocation.label}
                </Popup>
              </CircleMarker>

              {animals.map((animal) => {
                const location = getAnimalLocation(animal);
                const needs = animal?.mapStatus?.primaryNeed || [];

                return (
                  <Marker
                    key={animal.id}
                    position={[location.lat, location.lng]}
                    icon={createDogMarkerIcon(animal)}
                    eventHandlers={{
                      click: () => navigate(`/animals/${animal.id}`),
                    }}
                  >
                    <Popup>
                      <strong>{animal.name}</strong>
                      <br />
                      {location.label}
                      <br />
                      {animal?.mapStatus?.statusLabel || "Follow-up needed"}
                      <br />
                      {needs.slice(0, 3).join(", ")}
                      <br />
                      <button
                        className="pw-map-popup-button"
                        onClick={() => navigate(`/animals/${animal.id}`)}
                      >
                        Open Profile
                      </button>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            <div className="pw-map-legend">
              <span>
                <b className="pw-dot pw-dot--green" /> Stable
              </span>
              <span>
                <b className="pw-dot pw-dot--yellow" /> Needs care
              </span>
              <span>
                <b className="pw-dot pw-dot--orange" /> Follow-up
              </span>
              <span>
                <b className="pw-dot pw-dot--red" /> Vet
              </span>
            </div>
          </div>

          <aside className="pw-map-action-panel">
            <div className="pw-map-action-panel__content">
              <div className="pw-map-action-panel__top">
                <h2>Scan animal</h2>

                <p>
                  Spot a dog in need? Scan it and let Gemini check nearby
                  profiles.
                </p>

                <div className="pw-map-action-panel__image">
                  <div className="pw-scanner-icon">
                    <span className="pw-scanner-icon__corner pw-scanner-icon__corner--tl" />
                    <span className="pw-scanner-icon__corner pw-scanner-icon__corner--tr" />
                    <span className="pw-scanner-icon__corner pw-scanner-icon__corner--bl" />
                    <span className="pw-scanner-icon__corner pw-scanner-icon__corner--br" />

                    <span className="pw-scanner-icon__phone">
                      <span className="pw-scanner-icon__screen">🐕</span>
                    </span>

                    <span className="pw-scanner-icon__line" />
                  </div>
                </div>
              </div>

              <div className="pw-map-action-panel__buttons">
                <button className="pw-map-scan-button" onClick={goToScan}>
                  Scan New Dog
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export default MapPage;