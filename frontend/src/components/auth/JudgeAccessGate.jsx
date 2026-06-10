import { useState } from "react";
import { Link } from "react-router-dom";
import "./JudgeAccessGate.css";

const ACCESS_STORAGE_KEY = "pawwarrior_judge_access";

const JudgeAccessGate = ({ children }) => {
  const [accessGranted, setAccessGranted] = useState(() => {
    return localStorage.getItem(ACCESS_STORAGE_KEY) === "granted";
  });

  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");

  const expectedCode = import.meta.env.VITE_DEMO_ACCESS_CODE || "paw-judge-2026";

  const handleSubmit = (event) => {
    event.preventDefault();

    if (accessCode.trim() === expectedCode) {
      localStorage.setItem(ACCESS_STORAGE_KEY, "granted");
      setAccessGranted(true);
      setError("");
      return;
    }

    setError("Invalid access code. Please check the demo code and try again.");
  };

  if (accessGranted) {
    return children;
  }

  return (
    <main className="judge-access-page">
      <section className="judge-access-card">
        <div className="judge-access-badge">Judge Demo</div>

        <h1>PawWarrior AI Demo Access</h1>

        <p>
          This live demo is shared for hackathon judging. Enter the access code
          to test the map, scan, dog profile, Gemini agent flow, and care
          timeline.
        </p>

        <form className="judge-access-form" onSubmit={handleSubmit}>
          <label htmlFor="judge-access-code">Demo access code</label>

          <input
            id="judge-access-code"
            type="password"
            value={accessCode}
            onChange={(event) => {
              setAccessCode(event.target.value);
              setError("");
            }}
            placeholder="Enter access code"
            autoComplete="off"
          />

          {error && <p className="judge-access-error">{error}</p>}

          <button type="submit">Enter Demo</button>
        </form>

        <Link className="judge-access-back" to="/">
          Back to Landing
        </Link>
      </section>
    </main>
  );
};

export default JudgeAccessGate;