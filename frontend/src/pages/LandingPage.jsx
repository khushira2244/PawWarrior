import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

// ─── IMAGE IMPORTS ────────────────────────────────────────────────────────────
import imgUnevenCare from "/images/landing/Unevencare.png";
import imgNoKnowledge from "/images/landing/Noknowledge.png";
import imgConfusedActions from "/images/landing/Confusedactions.png";
import imgCommunity from "/images/landing/Community.png";
import imgGeminiBond from "/images/landing/geminibond.png";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const STORIES = [
  { img: imgUnevenCare, num: "01", name: "Jhon", story: "Feeds the same dog every day without knowing others are starving nearby.", q: "Which animals were missed today?" },
  { img: imgConfusedActions, num: "02", name: "Astor", story: "Spots a dog with an empty bowl but someone may have already fed it.", q: "Was this animal fed or watered today?" },
  { img: imgNoKnowledge, num: "03", name: "Arjun", story: "Finds an injured dog on the street but has no idea who to contact.", q: "Is there a vet or volunteer nearby?" },
  { img: imgCommunity, num: "04", name: "Eva", story: "Wants to help but animals and helpers in the same city never find each other.", q: "How do I know who needs help right now?" },
];

const HW_CARDS = [
  {
    num: "01", heading: "Create the profile of animals", tag: "Scan & Register",
    desc: "Scan any street animal and register it instantly. Gemini checks nearby profiles to avoid duplicates and creates a new animal record with location and safety summary.",
    boldWord: "Gemini checks nearby profiles",
    icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="3" /></svg>,
  },
  {
    num: "02", heading: "Track food, water and vet wherever you go", tag: "Care Memory",
    desc: "Log food, water, observations, or vet visits in seconds. Every action builds a shared care timeline so no volunteer duplicates effort or misses a day.",
    boldWord: "Every action builds a shared care timeline",
    icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  },
  {
    num: "03", heading: "Find the vet and raise fund for nearby animals", tag: "Vet & Fund",
    desc: "When an animal needs medical help, raise a vet request and a community fund directly from the profile. Nearby vets and donors get notified.",
    boldWord: "raise a vet request and a community fund",
    icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  },
  {
    num: "04", heading: "Connect with nearby volunteers and coordinate help", tag: "Community",
    desc: "See who else is caring for animals in your area. Share tasks, send alerts, and build a local care network so no animal falls through the gap again.",
    boldWord: "Share tasks, send alerts, and build a local care network",
    icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
];

const TECH_BADGES = [
  { label: "Gemini Reasoning", color: "#4ade80" },
  { label: "MongoDB Atlas (MCP)", color: "#6aaf78" },
  { label: "Google Cloud Agent Builder", color: "#34d399" },
  { label: "Vertex AI", color: "#a7f3d0" },
];

const PIPE_NODES = ["Scan", "Match", "Read Care Memory", "Check Risk", "Verify Safety", "Create Action"];

const AGENTS = [
  {
    num: "Agent 01", name: "Scan & Match Agent", stroke: "#4ade80",
    desc: <>Checks whether the scanned animal already exists in MongoDB using <strong className="text-accent-soft">location, identity, and visual marks</strong>.</>,
    pills: [{ l: "MongoDB Atlas", c: "#6aaf78" }, { l: "Gemini Vision", c: "#4ade80" }],
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="3" /></svg>,
  },
  {
    num: "Agent 02", name: "Care Memory Agent", stroke: "#34d399",
    desc: <>Reads <strong className="text-accent-soft">food, water, observation, case, and support history</strong> from MongoDB so the system knows what already happened.</>,
    pills: [{ l: "MongoDB MCP", c: "#6aaf78" }, { l: "Care Timeline", c: "#4ade80" }],
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  },
  {
    num: "Agent 03", name: "Health Risk Agent", stroke: "#f59e0b",
    desc: <>Uses Gemini to identify <strong className="text-accent-soft">weakness, injury, skin issues, or urgent care needs</strong> — without giving a medical diagnosis.</>,
    pills: [{ l: "Gemini Reasoning", c: "#4ade80" }, { l: "Risk Scoring", c: "#f59e0b" }],
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  },
  {
    num: "Agent 04", name: "Safety Verification Agent", stroke: "#60a5fa",
    desc: <>Blocks unsafe medical claims. Keeps guidance limited to <strong className="text-accent-soft">safe actions — water, observation, follow-up, vet support</strong>.</>,
    pills: [{ l: "Safety Rules", c: "#60a5fa" }, { l: "Gemini Guard", c: "#4ade80" }],
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  },
  {
    num: "Agent 05", name: "Vet Escalation Agent", stroke: "#f87171",
    desc: <>Finds <strong className="text-accent-soft">nearby vets, prepares a vet-ready summary</strong>, and creates a community support request when risk is serious.</>,
    pills: [{ l: "Vet Request", c: "#f87171" }, { l: "MongoDB", c: "#6aaf78" }],
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  },
  {
    num: "Agent 06", name: "Action Report Agent", stroke: "#4ade80", highlight: true,
    desc: <>Returns a clear final result — <strong className="text-accent-soft">what was found, what was logged</strong>, and what still needs community support.</>,
    pills: [{ l: "Agent Timeline", c: "#4ade80" }, { l: "Saved to MongoDB", c: "#6aaf78" }],
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M9 12l2 2 4-4" /><rect x="3" y="4" width="18" height="16" rx="2" /></svg>,
  },
];

const OUTCOMES = [
  { dot: "#4ade80", label: "What was found", val: "Animal identity & location match" },
  { dot: "#34d399", label: "What was done", val: "Care history read & logged" },
  { dot: "#60a5fa", label: "What is safe", val: "Verified action recommended" },
  { dot: "#f87171", label: "What needs help", val: "Community task created" },
];

const IMP_COLS = [
  { icon: "🧑‍🤝‍🧑", title: "For Humans", text: <>Volunteers, feeders, and rescuers finally have a <strong className="text-accent-soft">shared system</strong> — no confusion, no wasted effort, no dangerous advice.</> },
  { icon: "🤖", title: "For AI", text: <>Gemini agents <strong className="text-accent-soft">reason, remember, and act</strong> — not just answer. Every workflow is multi-step, safe, and grounded in real care memory.</> },
  { icon: "🐾", title: "For Animals", text: <>Every street animal gets a <strong className="text-accent-soft">profile, a care history, and a community</strong> watching over them — not just one person who happens to pass by.</> },
];

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav() {
  const navigate = useNavigate();
  const goToMap = () => navigate("/map");

  return (
    <nav className="pw-nav">
      <div className="pw-nav-logo">
        <div className="pw-nav-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round">
            <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
            <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5" />
            <path d="M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z" />
          </svg>
        </div>
        <div>
          <div className="pw-nav-logo-name">Paw<span className="accent">Warrior</span></div>
          <div className="pw-nav-logo-sub">Powered by Gemini</div>
        </div>
      </div>
      <div className="pw-nav-right">
        {["How It Works", "Agents", "Community"].map((l) => (
          <span key={l} className="pw-nav-link">{l}</span>
        ))}
        <button className="pw-btn-primary pw-nav-btn" onClick={goToMap}>
          Open Map →
        </button>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pw-hero">
      <h1 className="pw-hero-h1">
        Community care for<br />
        <span className="accent">every animal</span>
      </h1>
      <p className="pw-hero-sub">
        <strong className="text-bright">Gemini-powered community animal care system</strong>{" "}
        for street and community animals.
      </p>
      <p className="pw-hero-desc">
        Find nearby animals, scan new ones, log real care, request vet guidance, and coordinate
        helpers through an action-based agent workflow.
      </p>
      <button
        className="pw-btn-primary"
        onClick={() =>
          window.open("https://youtube.com/shorts/u6A6avJG_cs", "_blank")
        }
      >
        Watch Demo Video
      </button>
    </section>
  );
}

// ─── PROBLEM CAROUSEL ─────────────────────────────────────────────────────────
function Problem() {
  const [cur, setCur] = useState(0);
  const [prog, setProg] = useState(0);
  const timerRef = useRef(null);
  const total = STORIES.length;
  const dur = 4000;

  const goTo = (n) => {
    setCur(((n % total) + total) % total);
    setProg(0);
  };

  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProg((p) => {
        const next = p + 100 / (dur / 50);
        if (next >= 100) {
          setCur((c) => (c + 1) % total);
          return 0;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [cur]);

  const slide = STORIES[cur];

  return (
    <section className="pw-section">
      <div className="pw-eyebrow">The Problem</div>
      <h2 className="pw-section-title">
        Community animals fall through <span className="accent">the gaps</span>
      </h2>
      <p className="pw-section-sub">
        <strong className="text-bright">PawWarrior solves this by creating a shared care memory for every animal</strong>
        {" "}— so every volunteer, feeder, and rescuer can act on the same picture.
      </p>

      <div className="pw-progress-track">
        <div className="pw-progress-bar" style={{ width: `${prog}%` }} />
      </div>

      <div className="pw-carousel">
        <div className="pw-slide-img">
          <img src={slide.img} alt={slide.name} className="pw-slide-img-el" />
        </div>
        <div className="pw-slide-body">
          <div className="pw-slide-num">Story {slide.num} / 04</div>
          <div className="pw-slide-name">{slide.name}</div>
          <p className="pw-slide-story">{slide.story}</p>
          <div className="pw-slide-q">
            <div className="pw-slide-q-icon">?</div>
            <p className="pw-slide-q-text">{slide.q}</p>
          </div>
        </div>
      </div>

      <div className="pw-carousel-controls">
        <div className="pw-dots">
          {STORIES.map((_, i) => (
            <div
              key={i}
              onClick={() => goTo(i)}
              className={`pw-dot${i === cur ? " pw-dot--active" : ""}`}
            />
          ))}
        </div>
        <div className="pw-arrows">
          <button className="pw-arrow-btn" onClick={() => goTo(cur - 1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="pw-arrow-btn" onClick={() => goTo(cur + 1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section className="pw-section">
      <div className="pw-eyebrow">How It Works</div>
      <h2 className="pw-section-title">
        Everything you need to <span className="accent">care for community animals</span>
      </h2>
      <p className="pw-section-sub">
        From scanning a new animal to coordinating a full community response — PawWarrior guides every step.
      </p>
      <div className="pw-cards-grid">
        {HW_CARDS.map((c) => (
          <div key={c.num} className="pw-card">
            <div className="pw-card-top">
              <div className="pw-card-icon">{c.icon}</div>
              <div>
                <div className="pw-card-num">{c.num}</div>
                <div className="pw-card-heading">{c.heading}</div>
              </div>
            </div>
            <div className="pw-divider" />
            <p className="pw-card-desc">
              {c.desc.split(c.boldWord).map((part, i) =>
                i === 0
                  ? <span key={i}>{part}<strong className="text-accent-soft">{c.boldWord}</strong></span>
                  : <span key={i}>{part}</span>
              )}
            </p>
            <div className="pw-card-tag">
              <div className="pw-tag-dot" />
              <span>{c.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── AGENTS ───────────────────────────────────────────────────────────────────
function Agents() {
  return (
    <section className="pw-section">
      <div className="pw-eyebrow">Multi-Agent Care Workflow</div>
      <h2 className="pw-section-title">
         A <span className="accent">Gemini-powered agent system</span>
      </h2>
      <p className="pw-section-sub">
        PawWarrior checks memory, location, visible condition, recent care history, and safety rules
        before suggesting the next action.{" "}
        <strong className="text-bright">Every step is handled by a specialist agent.</strong>
      </p>

      <div className="pw-tech-row">
        {TECH_BADGES.map((b) => (
          <div key={b.label} className="pw-tech-badge">
            <span className="pw-tech-dot" style={{ background: b.color }} />
            <span>{b.label}</span>
          </div>
        ))}
      </div>

      <div className="pw-pipeline-label">Intelligent workflow</div>
      <div className="pw-pipeline">
        {PIPE_NODES.map((n) => (
          <div key={n} className="pw-pipeline-step">
            <div className="pw-pipe-node">{n}</div>
            <span className="pw-pipe-arrow">→</span>
          </div>
        ))}
        <div className="pw-pipe-node pw-pipe-node--final">Save Agent Timeline</div>
      </div>

      <div className="pw-agents-grid">
        {AGENTS.map((a) => (
          <div key={a.num} className={`pw-agent-card${a.highlight ? " pw-agent-card--highlight" : ""}`}>
            <div className="pw-agent-head">
              <div className={`pw-agent-icon${a.highlight ? " pw-agent-icon--highlight" : ""}`}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={a.stroke} strokeWidth="1.8" strokeLinecap="round">
                  {a.icon.props.children}
                </svg>
              </div>
              <div>
                <div className="pw-agent-num">{a.num}</div>
                <div className="pw-agent-name">{a.name}</div>
              </div>
            </div>
            <div className="pw-divider" />
            <p className="pw-agent-desc">{a.desc}</p>
            <div className="pw-pills">
              {a.pills.map((p) => (
                <span key={p.l} className="pw-pill" style={{ color: p.c }}>{p.l}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pw-outcome">
        {OUTCOMES.map((o) => (
          <div key={o.label} className="pw-outcome-item">
            <span className="pw-outcome-dot" style={{ background: o.dot }} />
            <div className="pw-outcome-label">{o.label}</div>
            <div className="pw-outcome-val">{o.val}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── IMPACT ───────────────────────────────────────────────────────────────────
function Impact() {
  const navigate = useNavigate();
  const goToMap = () => navigate("/map");

  return (
    <section className="pw-section pw-section--last">
      <div className="pw-eyebrow">Impact</div>
      <h2 className="pw-section-title">
        PawWarrior turns scattered help into{" "}
        <span className="accent">coordinated community care</span>
      </h2>
      <p className="pw-section-sub">
        <strong className="text-bright">Every scan, food log, vet request, and observation</strong> becomes
        part of a transparent animal profile — helping volunteers act faster and more responsibly.
      </p>
      <p className="pw-impact-tagline">
        No more guessing. No more duplicate feeding. No more animals missed.
      </p>

      <div className="pw-bridge-img">
        <img src={imgGeminiBond} alt="Gemini connects humans and animals" />
      </div>

      <div className="pw-impact-cols">
        {IMP_COLS.map((c) => (
          <div key={c.title} className="pw-impact-col">
            <div className="pw-impact-icon">{c.icon}</div>
            <div className="pw-impact-title">{c.title}</div>
            <p className="pw-impact-text">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="pw-cta-box">
        <h3 className="pw-cta-title">
          Start protecting your<br />
          <span className="accent">community animals today</span>
        </h3>
        <p className="pw-cta-sub">
          PawWarrior turns scattered animal help into coordinated community care. Every action
          helps volunteers act faster and more responsibly.
        </p>
        <button className="pw-btn-primary" onClick={goToMap}>
          Open Map
        </button>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="pw-footer">
      <span className="pw-footer-brand">PawWarrior.AI</span>
      <span className="pw-footer-right">Powered by Gemini · MongoDB · Google Cloud</span>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function PawWarriorLanding() {
  return (
    <div className="pw-root">
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Agents />
      <Impact />
      <Footer />
    </div>
  );
}
