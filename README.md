# PawWarrior

**PawWarrior** is a **Gemini-powered, MongoDB-backed multi-agent community animal care system** built for the **Google Cloud Rapid Agent Hackathon**.

It helps people scan real street/community dogs, identify or create animal profiles, check care history, track food and water support, request vet guidance, and coordinate nearby helpers through an **action-oriented agent workflow**.

PawWarrior is **not a chatbot**. It is designed to help people take **responsible real-world action**.

---

## Project Overview

PawWarrior turns scattered animal help into a coordinated care system.

With PawWarrior, a person can:

- discover nearby community dogs on a map
- open an existing dog profile
- check care status and history
- log food, water, or observation support
- report visible issues
- request vet guidance
- help create or contribute to a transparent care case
- coordinate with community volunteers and helpers

---

## Product Story

### 1) Existing Dog Discovery and Care Flow

A user opens PawWarrior, sees nearby dogs on a map, and opens an existing dog profile to understand what support is needed.
<img width="1408" height="768" alt="Gemini_Generated_Image_404mir404mir404m" src="https://github.com/user-attachments/assets/2680c559-599f-44f4-90e3-636ead886443" />


This flow helps users quickly answer:

- Which dogs are around me?
- Which dogs need food or water?
- Which dogs need follow-up?
- Which dogs may need vet guidance?
- What action should I take now?

---

### 2) New Dog Red-Flag Care Workflow

When a user finds a new dog in need, PawWarrior creates a red-flag care case, requests vet guidance, and opens a transparent care ledger for community support.
<img width="1408" height="768" alt="Gemini_Generated_Image_aoe5dcaoe5dcaoe5" src="https://github.com/user-attachments/assets/4eb8e926-1aae-4ecb-822c-ceaa6e44721c" />


This workflow helps turn a real-world sighting into:

- a dog profile
- a care case
- safe vet-guided next steps
- community contribution opportunities
- transparent support tracking

---

## Problem

Street and community dogs often receive irregular care. Some dogs are fed or given water multiple times, while others are missed for days. When a dog has a visible issue, people may not know whether to observe, give food/water, request vet help, or raise a community alert.

There is usually no shared record of:

- where the dog is usually seen
- when food or water was last given
- whether the dog has a visible issue
- who helped recently
- whether vet or NGO guidance is needed
- whether the dog has not been seen for 15–30 days
- which areas have care gaps

PawWarrior turns scattered animal help into a structured community care workflow.

---

## Solution

PawWarrior allows a person to scan a dog and choose their level of responsibility:

- I gave water
- I gave food
- I only observed / reported
- I noticed a problem
- I want to sponsor support
- I want to request vet guidance
- I want to mark the dog as not found

Every action becomes part of the dog’s **living profile**.

The system builds memory over time using:

- dog profiles
- map locations
- care logs
- helper actions
- vet listings
- case threads
- transparent care support records
- safety rules

---

## Core Flow

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
