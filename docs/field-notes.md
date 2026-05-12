# PawWarrior Field Notes

## Collection Date

2026-05-12

## Field Collector

field_collector_001

## Purpose

This field dataset was created for the PawWarrior Google Cloud Rapid Agent Hackathon project.

The goal is to build a real dog-memory dataset so PawWarrior agents can reason over animal identity, location, care gaps, food/water history, health concern tags, environmental risks, and community follow-up tasks.

PawWarrior does not diagnose or prescribe medicine. Medical concerns are tagged for vet/NGO guidance only.

---

## Areas Covered

### Area 1: Teapical, near Masjid Banda

Location:

```txt
Kondapur, Hyderabad, Telangana, India
Lat: 17.4646
Lng: 78.3551

Dogs recorded:

dog_001 → Kaalu
dog_002 → Sheru
dog_003 → Raja
Area 2: DLF Road / DLF Road Eateries

Location:

Gachibowli / Kondapur, Hyderabad, Telangana, India
Lat: 17.4474
Lng: 78.3582

Dogs recorded:

dog_004 → Sona
dog_006 → Rocky
Area 3: Tech Mahindra / Aparna Celestia / Financial District

Location:

Financial District / Nanakramguda, Hyderabad, Telangana, India
Lat: 17.4194
Lng: 78.3421

Dogs recorded:

dog_005 → Bholu
dog_007 → Moti
Dogs Collected
1. Kaalu
ID: dog_001
Image: images/dogs/dog_001_kaalu_front.jpg
Location: Teapical, near Masjid Banda, Kondapur
Condition: mild issue
Main concern: possible skin condition / patchy hair loss
Action completed: food given
Next care need: clean water, follow-up photo, vet/NGO guidance
2. Sheru
ID: dog_002
Image: images/dogs/dog_002_sheru.jpg
Location: Teapical, near Masjid Banda, Kondapur
Condition: thin but active
Main concern: underfed / water not updated
Action completed: food given
Next care need: clean water and observation
3. Raja
ID: dog_003
Image: images/dogs/dog_003_raja.jpg
Location: Teapical, near Masjid Banda, Kondapur
Condition: serious issue
Main concern: very thin, low-energy, refused food
Action completed: food offered but refused
Next care need: water check, follow-up observation, vet/NGO guidance
4. Sona
ID: dog_004
Image: images/dogs/dog_004_sona.jpg
Location: DLF Road Eateries, Gachibowli / Kondapur
Condition: mild issue
Main concern: unsafe water source, construction/roadwork displacement, mild itching
Action completed: observed only
Next care need: clean water, food support, follow-up observation
5. Bholu
ID: dog_005
Image: images/dogs/dog_005_bholu.jpg
Location: Near Tech Mahindra / Aparna Celestia
Condition: serious issue
Main concern: underweight, very lethargic, heat exposure risk
Action completed: observed only
Next care need: clean water, food support, urgent follow-up, vet/NGO guidance
6. Rocky
ID: dog_006
Image: images/dogs/dog_006_rocky.jpg
Location: DLF Road, Gachibowli / Kondapur
Condition: thin but active
Main concern: high traffic area, follow-up observation needed
Action completed: two meals given and water given once
Next care need: observation and traffic-risk follow-up
7. Moti
ID: dog_007
Image: images/dogs/dog_007_moti.jpg
Location: Near Tech Mahindra, Financial District
Condition: serious issue
Main concern: severe malnutrition, visible ribs, no stable water access
Action completed: observed only
Next care need: food support, clean water, urgent follow-up, vet/NGO guidance
Field Summary
Total dogs recorded: 7
Food given: 3 dogs
Water given: 1 dog
Food offered but refused: 1 dog
Observed only: 3 dogs
Open follow-up cases: 6
High-priority cases: 3
Medium-priority cases: 2
Low-to-medium cases: 1
Action Summary
Food Given
Kaalu
Sheru
Rocky
Water Given
Rocky
Food Offered But Refused
Raja
Needs Vet / NGO Guidance
Kaalu
Raja
Bholu
Moti
Needs Clean Water Support
Kaalu
Sheru
Raja
Sona
Bholu
Moti
Environment Risk
Sona → unsafe water + construction displacement
Bholu → heat exposure risk
Rocky → high traffic area
Moti → no stable water access
Agent Demo Value

This field dataset supports multiple PawWarrior agent behaviours:

Scan & Match Agent:
Can identify known dog profiles from stored image/name/location data.

Health Risk Agent:
Can classify visible concern levels without diagnosis.

Trajectory-Aware Care Agent:
Can compare food/water gaps and follow-up needs.

Care Planner Agent:
Can recommend safe actions like water, food, observation, or follow-up photo.

Community Coordination Agent:
Can create tasks for helpers and area stewards.

Vet Escalation Agent:
Can activate for high-priority cases.

Safety & Verification Agent:
Can block unsafe medicine or diagnosis claims.
Safety Note

PawWarrior is an AI-assisted community care coordination system.

It does not:

diagnose disease
prescribe medicine
suggest dosage
recommend injections
replace veterinarians

It only helps with:

safe care logging
food/water coordination
observation
case creation
vet/NGO guidance routing
community follow-up

After this, your **today data files** are done:

```txt
data/animals.json
data/careLogs.json
data/cases.json
docs/field-notes.md