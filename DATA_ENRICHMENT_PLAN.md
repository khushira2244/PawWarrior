# PawWarrior Data Enrichment Plan

This document defines the first target for PawWarrior: building a rich demo dataset that makes the multi-agent system visible and useful.

The hackathon focuses on agents, so PawWarrior must not behave like a simple image chatbot. The agents need context, memory, tools, and history.

---

## Goal

Create an enriched dataset so PawWarrior agents can reason over:

- real dog profiles
- real dog photos
- real dog map locations
- food and water care history
- missing / not-found status
- human helper roles
- real vet listings
- case threads
- pledge/support records
- safety and care rules
- educational references

The goal is to make the system show real agentic behaviour:

```txt
Scan dog
→ match profile
→ check care memory
→ detect care gap
→ classify visible risk
→ create community task
→ recommend vet/NGO guidance if needed
→ update dog profile and community memory
Target Dataset Size

For the first strong demo:

Dogs / animal profiles: 20–30
Human/helper profiles: 50
Vet profiles: 10–15
Care logs: 150–250
Case threads: 20–30
Pledge/support records: 30–50
Care/safety rules: 20–30
Condition references: 10–20
Data Source Types
1. Real Dog Data

Collected manually from known community dogs.

For each dog:

nickname
photos
location pin
landmark
colour
size
unique marks
usual behaviour
current condition
food/water need
last seen time
missing status
2. Real Vet Data

Collected from Google Maps or public listings around dog locations.

For each vet:

clinic name
area
public location
approximate distance from dog zone
emergency support field
low-cost guidance field
availability field
status: public listing / not officially partnered yet

Important: real vet profiles should not be marked as official partners unless they have been contacted and agreed.

3. Demo Human Profiles

Generated for demo purposes.

Human roles:

reporter
observer
care helper
sponsor
area steward
NGO/shelter volunteer
admin/moderator
4. Care Logs

Generated from real-like scenarios.

Care log types:

water_given
food_given
observed_only
problem_reported
vet_guidance_requested
money_pledged
followup_photo_uploaded
not_found_reported
transport_help_offered
5. Case Threads

Structured discussion records for dogs needing follow-up.

Examples:

mild skin issue case
summer water care case
not-seen-recently case
high-urgency vet escalation case
food irregularity case
6. Care and Safety Rules

Public veterinary references are used only for safe first-response classification and educational grounding.

PawWarrior does not diagnose or prescribe medicine.

Rules include:

no medicine dosage
no injections
no random human medicine
no aggressive bathing/scrubbing
escalate bleeding, pus, maggots, severe weakness, breathing trouble
provide educational reference only
request vet/NGO guidance for medical concerns
Three-Day Data Collection Plan
Day 1: Real Dog Profiles

Target:

5–7 real dog profiles

For each dog:

open Google Maps
stand near the dog’s usual area
long press to drop a pin
copy/share location
save latitude/longitude or landmark
take 2–3 photos
record condition and care need

Dog photos:

1. front photo
2. side photo
3. unique mark photo, if possible
Day 2: More Dogs + Vet Listings

Target:

10–15 total real dog profiles
10–15 vet profiles

Search on Google Maps:

veterinary clinic near me
pet clinic near me
animal hospital near me
government veterinary hospital near me
animal welfare NGO near me

Save each vet as a public listing.

Day 3: Agent-Visible Memory

Target:

150+ care logs
20+ case threads
30+ pledge/support records
condition references
missing/not-found scenarios

Create rich history for each dog:

last food update
last water update
seen count
issue reports
follow-up photos
missing/not-found reports
sponsor/pledge records
Dog Profile Schema
{
  "id": "dog_001",
  "name": "Brownie",
  "species": "dog",
  "relationship": "known_community_dog",
  "breed": {
    "aiEstimate": "indie-type / mixed breed",
    "communityLabel": "Indie",
    "verifiedBreed": null,
    "confidence": "low",
    "status": "unverified"
  },
  "identityFeatures": {
    "color": "brown and white",
    "size": "medium",
    "uniqueMarks": ["white patch on face", "black tail tip"]
  },
  "usualLocations": [
    {
      "label": "Tea shop corner",
      "area": "Local area",
      "lat": 17.000000,
      "lng": 78.000000
    }
  ],
  "normalBehaviour": "friendly with known people",
  "currentCondition": "thin_but_active",
  "careTags": ["summer_care_needed", "needs_water", "food_irregular"],
  "lastSeenAt": "2026-05-08T18:00:00",
  "missingStatus": "active",
  "foodCountThisWeek": 3,
  "waterCountThisWeek": 2,
  "createdBy": "user_001"
}
Vet Profile Schema
{
  "id": "vet_001",
  "clinicName": "Public Clinic Name",
  "doctorName": "Unknown / Public Listing",
  "area": "Local Area",
  "location": {
    "lat": 17.000000,
    "lng": 78.000000
  },
  "distanceFromDogZoneKm": 2.4,
  "availableForGuidance": true,
  "emergencySupport": false,
  "lowCostGuidance": true,
  "guidanceFeeEstimate": 10,
  "streetAnimalSupport": "unknown",
  "source": "Google Maps public listing",
  "partnershipStatus": "not_contacted_yet"
}
Human Profile Schema
{
  "id": "user_001",
  "name": "Demo Helper 1",
  "role": "care_helper",
  "area": "Local Area",
  "canHelpWith": ["water", "food", "observation"],
  "availability": "evening",
  "careScore": 40,
  "actionsCompleted": 6,
  "verified": false
}
Care Log Schema
{
  "id": "log_001",
  "animalId": "dog_001",
  "userId": "user_001",
  "actionType": "water_given",
  "notes": "Gave water near tea shop.",
  "photoProof": true,
  "location": {
    "lat": 17.000000,
    "lng": 78.000000
  },
  "createdAt": "2026-05-08T15:40:00"
}
Condition Reference Schema
{
  "conditionTag": "possible_skin_issue",
  "title": "Understanding common dog skin problems",
  "type": "youtube",
  "url": "https://youtube.com/...",
  "sourceType": "vet_clinic_or_education",
  "usageNote": "Educational reference only. Confirm treatment with a vet before applying anything."
}
Missing / Not-Found Logic
No update for 15 days → not_seen_recently
2+ not-found reports → possibly_missing
No update for 30 days → missing_watch
Seen again → active

This allows PawWarrior to produce map-level and municipality-level insights.

Demo Scenarios
Scenario 1: Normal Dog, Summer Care

Dog: Brownie
Status: no serious issue
Care history: water missing today, food irregular this week
Agent output: summer care needed, give water if possible

Scenario 2: Mild Skin Issue

Dog: Chotu
Status: possible skin issue
Care history: observed by 2 people
Agent output: needs vet guidance, no medicine suggested

Scenario 3: Serious Case

Dog: Sheru
Status: visible wound / severe weakness
Agent output: high urgency, vet escalation created

Scenario 4: Community Coordination

Dog: Moti
Status: no emergency
Care tag: food irregular
Agent output: nearby helpers found, food task created

Scenario 5: Missing Watch

Dog: Kali
Status: not seen for 18 days
Agent output: not-seen-recently tag, confirmation task created

Success Criteria

The data enrichment phase is complete when:

at least 10 real dog profiles exist
at least 10 real vet profiles exist
50 demo human profiles exist
150+ care logs exist
agents can produce different outputs for different dog histories
map can show dog status markers
at least 5 demo scenarios are ready