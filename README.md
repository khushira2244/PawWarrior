# PawWarrior

**PawWarrior** is a multi-agent community animal care system built for the **Google Cloud Rapid Agent Hackathon**.

It helps people scan real street/community dogs, identify or create animal profiles, check care history, track food and water support, request vet guidance, and coordinate nearby helpers through an action-oriented agent workflow.

PawWarrior is not a chatbot. It is designed to help people take responsible real-world action.

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

Every action becomes part of the dog’s living profile.

The system builds memory over time using dog profiles, map locations, care logs, helper actions, vet listings, case threads, and safety rules.

---

## Core Flow

```txt
User scans dog
        ↓
Scan & Match Agent checks if this is a known dog
        ↓
Health Risk Agent checks visible issues
        ↓
Care Memory Agent checks food/water/history
        ↓
Care Planner Agent suggests safe next action
        ↓
Safety Agent blocks unsafe medical claims
        ↓
Community Agent creates food/water/observer/vet tasks
        ↓
Vet Escalation Agent activates when needed
        ↓
Dog profile, care logs, helper score, and map status are updated