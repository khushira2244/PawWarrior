# PawWarrior

**PawWarrior** is a **Gemini-powered, MongoDB-backed multi-agent community animal care system** built for the **Google Cloud Rapid Agent Hackathon**.

It helps people scan real street/community dogs, identify or create animal profiles, check care history, track food and water support, request vet guidance, and coordinate nearby helpers through an **action-oriented agent workflow**.

PawWarrior is **not a chatbot**. It is designed to help people take **responsible real-world action**.

---

## Live Demo

* **Frontend:** https://pawwarriorai.netlify.app
* **Backend API:** https://pawwarrior-api-457006001927.asia-south1.run.app
* **Demo Video:** ADD_VIDEO_LINK_HERE

For judge/private demo access, please contact: **[khushira2244@gmail.com](mailto:khushira2244@gmail.com)**

### Suggested Demo Flow

1. Open the live frontend.
2. Start from the landing page.
3. Open the map page and view nearby dog markers.
4. Click a dog marker to open an existing dog profile.
5. Log a care action such as food, water, or observation.
6. Use the scan flow to capture a dog photo, attach GPS location, and create a new dog profile.
7. Review vet guidance, nearby vet support, and the AgentRun timeline.

---

## Current MVP Scope

PawWarrior is designed as a community animal care platform, but the current working MVP focuses on **street dogs**.

We chose a dog-first MVP because we had real field images, locations, care logs, vet cases, and map data to validate the full workflow end to end.

The same architecture can later expand to cats, cows, injured animals, abandoned pets, and other community animals.

---

## Project Overview

PawWarrior turns scattered animal help into a coordinated care system.

With PawWarrior, a person can:

* discover nearby community dogs on a map
* open an existing dog profile
* check care status and history
* log food, water, or observation support
* report visible issues
* request vet guidance
* help create or contribute to a transparent care case
* coordinate with community volunteers and helpers

---

## Product Story

### 1) Existing Dog Discovery and Care Flow

A user opens PawWarrior, sees nearby dogs on a map, and opens an existing dog profile to understand what support is needed.

<img width="1408" height="768" alt="Existing dog discovery and care flow" src="https://github.com/user-attachments/assets/2680c559-599f-44f4-90e3-636ead886443" />

This flow helps users quickly answer:

* Which dogs are around me?
* Which dogs need food or water?
* Which dogs need follow-up?
* Which dogs may need vet guidance?
* What action should I take now?

---

### 2) New Dog Red-Flag Care Workflow

When a user finds a new dog in need, PawWarrior creates a red-flag care case, requests vet guidance, and opens a transparent care ledger for community support.

<img width="1408" height="768" alt="New dog red-flag care workflow" src="https://github.com/user-attachments/assets/4eb8e926-1aae-4ecb-822c-ceaa6e44721c" />

This workflow helps turn a real-world sighting into:

* a dog profile
* a care case
* safe vet-guided next steps
* community contribution opportunities
* transparent support tracking

---

## Problem

Street and community dogs often receive irregular care. Some dogs are fed or given water multiple times, while others are missed for days. When a dog has a visible issue, people may not know whether to observe, give food/water, request vet help, or raise a community alert.

There is usually no shared record of:

* where the dog is usually seen
* when food or water was last given
* whether the dog has a visible issue
* who helped recently
* whether vet or NGO guidance is needed
* whether the dog has not been seen for 15–30 days
* which areas have care gaps

PawWarrior turns scattered animal help into a structured community care workflow.

---

## Solution

PawWarrior allows a person to scan a dog and choose their level of responsibility:

* I gave water
* I gave food
* I only observed / reported
* I noticed a problem
* I want to sponsor support
* I want to request vet guidance
* I want to mark the dog as not found

Every action becomes part of the dog’s **living profile**.

The system builds memory over time using:

* dog profiles
* map locations
* care logs
* helper actions
* vet listings
* case threads
* transparent care support records
* safety rules

---

## Key Features

* **Dog-first field map:** Shows nearby dogs with status-based markers.
* **Mobile scan flow:** Opens phone/tablet camera, captures a dog photo, attaches GPS location, and creates a new profile after confirmation.
* **Scan-and-match:** Checks nearby profiles before creating a new dog record to reduce duplicate profiles.
* **MongoDB care memory:** Stores animal profiles, locations, care logs, cases, vets, funds, and agent runs.
* **Gemini orchestration:** Converts natural-language care missions into backend agent actions.
* **Human confirmation:** Important write actions require confirmation before saving to MongoDB.
* **Vet guidance:** Shows vet escalation and supports WhatsApp/call guidance for a demo vet contact.
* **Agent timeline:** Records what each agent did, which tool was used, and what follow-up is needed.
* **Transparent support foundation:** Care fund and support ledger structure is prepared for future proof-based support tracking.

---

## Core Flow

<img width="1278" height="832" alt="Gemini_Generated_Image_lukaowlukaowluka" src="https://github.com/user-attachments/assets/41938bf8-d4f3-453c-9f38-78deebfc66f6" />


```txt
User scans dog
        ↓
Scan & Match Agent checks if this is a known dog
        ↓
Health Risk Agent checks visible issues
        ↓
Care Memory Agent checks food / water / history
        ↓
Care Planner Agent suggests safe next action
        ↓
Safety Agent blocks unsafe medical claims
        ↓
Community Agent creates food / water / observer / vet tasks
        ↓
Vet Escalation Agent activates when needed
        ↓
Dog profile, care logs, helper score, and map status are updated
```

---

## Architecture

<img width="1147" height="912" alt="Gemini_Generated_Image_zebgl9zebgl9zebg" src="https://github.com/user-attachments/assets/9337da87-28d4-43d8-a910-2b95a1e2458c" />

```txt
User / Helper
   ↓
React + Vite Frontend
Netlify
   ↓
Node.js + Express Backend
Google Cloud Run
   ↓
Gemini Orchestrator
Tool selection + safety confirmation
   ↓
MongoDB Atlas
Animal memory, care logs, cases, vets, funds, agent runs
   ↓
Google Cloud Storage
Uploaded animal scan photos
```

### Main Backend Areas

* `/api/animals` — animal profiles and nearby animal discovery
* `/api/care-logs` — food, water, observation, and problem logs
* `/api/cases` — follow-up and vet escalation cases
* `/api/vets` — nearby vet guidance options
* `/api/care-funds` — transparent care support records
* `/api/agents/run/*` — direct backend agent actions
* `/api/google-agent/mission` — Gemini-powered orchestration endpoint
* `/api/uploads/animal-photo` — animal scan photo upload to Google Cloud Storage

---

## Built With




* **Frontend:** React, Vite, JavaScript, CSS
* **Map:** Leaflet, OpenStreetMap
* **Backend:** Node.js, Express
* **AI:** Gemini / Google Cloud agent workflow
* **Database:** MongoDB Atlas
* **Storage:** Google Cloud Storage
* **Deployment:** Google Cloud Run, Netlify
* **Tools:** Postman, VS Code, GitHub

---

## Agent Workflow



PawWarrior uses a multi-agent workflow instead of a single chatbot response.

### Core Agents

* **Map Discovery Agent** — finds nearby dogs and care status.
* **Scan & Match Agent** — checks if a scanned dog already exists.
* **Care Memory Agent** — reads food, water, observation, case, and vet history.
* **Vet Escalation Agent** — activates when vet or NGO guidance may be needed.
* **Safety Confirmation Agent** — asks for human confirmation before important write actions.
* **Action Report Agent** — creates an AgentRun timeline for auditability.

<img width="1058" height="975" alt="Gemini_Generated_Image_kwnr9vkwnr9vkwnr" src="https://github.com/user-attachments/assets/7d185739-0bb5-4bd2-8919-f87576d48682" />


## Agent Features



PawWarrior uses a multi-agent workflow instead of a single chatbot response.

The system coordinates map discovery, scan matching, care memory, safety checks, vet escalation, and action reporting so helpers can take responsible real-world action.

### Core Agents

* **Map Discovery Agent**
  Finds nearby dogs and shows their care status, location, urgency marker, and profile access on the map.

* **Scan & Match Agent**
  Checks whether a scanned dog already exists near the user’s GPS location before creating a new profile. This helps reduce duplicate dog records.

* **Health Risk Agent**
  Reads visible issue signals and user-reported concerns to decide whether the dog needs observation, follow-up, or vet escalation.

* **Care Memory Agent**
  Reads MongoDB-backed food, water, observation, care log, case, vet, and support history.

* **Care Planner Agent**
  Suggests the next safe action based on current scan context, past care history, and known care gaps.

* **Safety Confirmation Agent**
  Keeps humans in control by asking for confirmation before sensitive write actions are saved.

* **Vet Escalation Agent**
  Activates when a case may need veterinary support, NGO guidance, follow-up, WhatsApp/call support, or urgent attention.

* **Action Report Agent**
  Builds a visible AgentRun timeline showing what happened, which tool was used, and what should happen next.

### Why this matters

PawWarrior does not only generate advice. It connects AI reasoning with real care actions:

* create or match dog profiles
* log food, water, and observation support
* create follow-up cases
* request vet guidance
* store care memory in MongoDB
* upload scan photos to Google Cloud Storage
* update map status and urgency
* preserve a transparent agent timeline

Together, these agents turn scattered community help into a coordinated care workflow.


---

## Human-in-the-Loop Safety

PawWarrior does not automatically write sensitive records without confirmation.

Examples of confirmation-required actions:

* creating a new dog profile
* logging food or water support
* reporting a visible issue
* requesting vet guidance
* contributing to a care fund

This keeps the workflow safe, transparent, and human-controlled.

---

## Safety Note

PawWarrior does not diagnose animals and does not provide medicine or dosage advice.

The system is designed to support:

* safe observation
* care logging
* vet escalation
* community coordination
* transparent action history

Important write actions use human confirmation before saving records.

---

## Future Roadmap

* Expand from dog-first MVP to all community animals.
* Add helper profiles so volunteers can build trusted care history.
* Add vet/NGO dashboards for structured case review.
* Add verified care support with proof-based fund release.
* Add stronger image matching to reduce duplicate animal profiles.
* Add community groups, task assignment, alerts, and care discussions.
* Add vet-reviewed safe food, water, hydration, and first-response guidance.
* Build a PawWarrior social layer where animals have memory and helpers coordinate responsibly.

---

## Local Setup

### 1. Clone the repository

```bash
git clone ADD_REPO_LINK_HERE
cd PawWarrior
```

### 2. Backend setup

```bash
cd backend
npm install
npm run dev
```

Backend environment variables:

```env
PORT=8080
MONGODB_URI=your_mongodb_atlas_uri
GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id
GOOGLE_CLOUD_LOCATION=global
GEMINI_MODEL=gemini-2.5-flash
GCS_BUCKET_NAME=your_google_cloud_storage_bucket
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend environment variables:

```env
VITE_API_BASE_URL=http://localhost:8080
```

For deployed frontend:

```env
VITE_API_BASE_URL=https://pawwarrior-api-457006001927.asia-south1.run.app
```

---

## Deployment

* **Frontend:** Netlify
* **Backend:** Google Cloud Run
* **Database:** MongoDB Atlas
* **Image Storage:** Google Cloud Storage

---

## Status

PawWarrior is a working dog-first MVP built for the Google Cloud Rapid Agent Hackathon.

The live demo includes:

* map-based dog discovery
* dog profile pages
* care action logging
* scan-new-dog flow with image and GPS
* vet guidance workflow
* Gemini orchestration
* MongoDB-backed memory
* AgentRun timeline
