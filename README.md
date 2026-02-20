# Landowner Intake Application

## Overview

Ben sent me this working prototype of a Landowner Intake Application. The front-end looks great and works flawlessly, but some attention ought to be paid to the aesthetics and marketing. It should match our brand colors, use our logo, language, etc.

However, the back-end, moreso, needs work. I, Jackson, have taken it upon myself to resolve most of the misalignments before passing it along to Harrison for direct integration into the product. Specifically, the schemata, API import (which should be Terra rather than generic Gemini), and other subtleties must be reworked.

In all, this repository contains the frontend React prototype for the Operational Intake Framework, which itself encapsulates the brunt of the intake work that a landowner will undergo. This application is designed to capture the "story" of a farm through a guided, sequential workflow, enabling program planners to clarify what land use programs (regenerative ag, carbon markets, habitat restoration, recreation, among others) are most prudent for their operations.

The application captures elaborate, granular agricultural data across several domains:

- Operational Foundation (Crops, Rotation)
- Natural Asset Stewardship (Soil, Water, Grassland, Timber)
- Nutrient Intelligence & Input Cycles (Precision Ag)
- Special Concerns (Livestock, Marketing, Strategy)

## Tech Stack

- **Frontend:** React (TypeScript)
- **Build Tool:** Vite
- **Styling/Icons:** Tailwind CSS / Lucide React
- **AI Integration:** Internal Terra API (formerly standard LLM ingestion via Gemini)

## 🚨 Urgent Action Items

To ensure one-to-one data fidelity with our SQL database, NLP mapping, and PORs, the following structural changes MUST be implemented:

- **Strict Title_Snake_Case:** The `types.ts` file has been completely rewritten. All data payload keys must remain in `Title_Snake_Case`. This concords with Notion's ingestion and management of our relational database. Do not revert to `camelCase` for convenience nor for adhering to React/TypeScript's case conventions. `App.tsx` state and generic handlers must be updated to reference these exact keys.
- **Phraseology in Open-Ended Questions:** The manner in which we ask qualitative questions requiring typed user input is inconsistent and, as such, presents the risk that we harvest inconsistent, semantically-biased data. For example, "Pain points" presents a far more visceral, negatively-connoted image than does "Challenges," which is more neutral; other questions are structured in a pro-and-con format. These ought to be standardized along one unified trajectory. I think it most prudent to make these open-ended questions variations of, "What challenges have you faced using/implementing X practice?"
- **Enforce the Tag Dictionary:** Hardcoded UI array options in `App.tsx` currently do not match our database Taxonomy. The backend expects strict nomenclature (e.g., `"No_Till"`, `"Strip_Till"`). Ensure the `value` passed into the React state exactly matches the official Tag Dictionary to the extent possible. Some values did not have a one-to-one match. In such cases, the `Title_Snake_Case` formatting has been retained and appropriate names have been chosen for when I eventually create buckets to hold this data beyond the preliminary JSON the tool creates to store the values. The MVP is to keep this "JSONed" semi-structured data (listed in appropriately and concisely named variables) and thereafter extract the data for holding in discrete buckets elsewhere, which will help us enhance deliverables and complete enrollment applications via autofill, among other useful applications.
- **Terra AI Integration:** Remove the `@google/genai` dependency and refactor `services/geminiService.ts`. The `handleAIReview` function must send the `Intake_Form_Data` payload to our internal **Terra API** rather than standard Gemini. I am less familiar with this part, nor do I have access to the Google Cloud server containing the details thereof, so please defer to the competent authorities (probably Cary) to help you here.

## Local Development Setup

**Prerequisites:** Node.js installed on your machine.

1. Clone the repository and navigate to the project directory.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
