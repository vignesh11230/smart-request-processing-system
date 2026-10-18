# Smart Request Processing System

## Overview
Smart Request Processing System is a prototype that accepts a customer message, uses an AI backend to classify the request type and urgency, selects a branch-specific workflow, and displays the actions and generated outputs for an operations team.

## Technology
- React and Vite — user interface
- Node.js and Express — backend API
- Gemini API — AI classification and generated text
- JSON file storage (`data/requests.json`) — request history

## Workflow
1. The user enters a customer message or chooses a sample request.
2. The React frontend sends the message as JSON to `POST /api/process`.
3. The backend uses the AI service to classify the request and prepare workflow information.
4. The selected workflow branch returns its steps, assigned team, status flags, and any generated draft outputs.
5. The frontend displays the classification, urgency, workflow execution plan, and branch-specific results.
6. Processed requests are saved in JSON and can be viewed from Request History through `GET /api/requests`.

## Request branches

### 1. Complaint — typically High urgency
Example input: “I was charged twice for my order. Please resolve this immediately.”

Workflow actions may include acknowledging the complaint, routing or escalating it to a senior customer-support handler, preparing a follow-up flag, and creating a case-log preview. Outputs can include an acknowledgement draft, follow-up details, and case information.

### 2. General Enquiry — typically Low urgency
Example input: “What are your business hours?”

The workflow prepares a response to the enquiry and records a resolved-status or case-log preview as configured by the backend. The generated response is shown for review.

### 3. Service Request — typically Medium urgency
Example input: “My washing machine is broken and needs repair.”

The workflow extracts service details, identifies a relevant team, prepares a confirmation draft, and shows service-level review information.

The AI determines the classification and urgency for each submitted message, so the results should be checked rather than assumed from the examples.

## Setup and run

### Prerequisites
- Node.js and npm
- A Gemini API key

### Backend
1. Open a terminal in the project root.
2. Install the backend dependencies using the package file in the root folder:
   ```bash
   npm install
   ```
3. Create or update `.env` in the project root with the environment variable name expected by `server.js`, for example:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   Keep the real key private. Do not commit `.env` to GitHub.
4. Start the backend using the script defined in the root `package.json` (commonly `npm start` or `node server.js`).

The backend is expected to listen on port `5000`, and the frontend calls:
- `POST http://localhost:5000/api/process`
- `GET http://localhost:5000/api/requests`

### Frontend
1. Open a second terminal.
2. Change to the frontend folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Important implementation note
This is an assessment prototype. It prepares workflow steps, drafts, routing information, and follow-up/SLA flags for display. Unless an external integration has been implemented and configured, it does **not** actually send customer messages, notify teams, schedule reminders, or run real SLA timers. The case log is a JSON-file prototype, not a production database.

## Assessment demonstration
Process one example from each branch:
1. Complaint: duplicate payment.
2. General enquiry: business hours.
3. Service request: broken appliance.

For each result, show the request type, urgency, workflow steps, assigned team, generated outputs, and saved Request History entry. Include screenshots of the results in the submission package.
