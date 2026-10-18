# Smart Request Processing System using LLM

An AI-powered customer request processing system that uses a Large Language Model (LLM) to classify customer messages, determine urgency, recommend actions, and generate workflow-based remediation outputs.

## 🚀 Live Project

- **Live Website:** https://smart-request-processing-system.vercel.app/
- **Backend API:** https://smart-request-processing-system.onrender.com
- **GitHub Repository:** https://github.com/vignesh11230/smart-request-processing-system

## 📊 Project Presentation & Demo

- **Project Presentation:** [View Presentation on Google Drive](https://drive.google.com/file/d/1uX-hsuClbATnvoZviWpxV7RceP-gqiQX/view?usp=sharing)
- **Project Demo Video:** [Watch Demo Video on Google Drive](https://drive.google.com/file/d/1--ozVvTAL95iaC8sAy-aSPx3os-GZiRH/view?usp=sharing)

> Make sure both Google Drive files are shared with **Anyone with the link — Viewer** so interviewers can access them.

---

## 📌 Project Overview

Customer support teams receive different types of requests, including complaints, general enquiries, and service requests. Manually reviewing and routing these requests can take time.

The Smart Request Processing System uses Gemini AI to analyze customer messages, classify requests, determine urgency, recommend practical actions, and select the appropriate workflow branch.

The application displays the classification results, recommended actions, workflow status, and generated response drafts through an interactive web interface.

## 🎯 Project Objectives

- Automate customer request classification using an LLM.
- Identify request urgency.
- Recommend practical actions based on the request.
- Route requests into appropriate workflow branches.
- Generate relevant response drafts and remediation details.
- Display processing results through a user-friendly interface.
- Maintain a request history for reviewing submitted requests.

## ✨ Key Features

- **AI-Powered Classification:** Classifies incoming messages into three request types.
- **Urgency Detection:** Assigns High, Medium, or Low urgency.
- **Recommended Actions:** Generates practical next steps for each request.
- **Workflow Automation Logic:** Selects a workflow branch according to the classification.
- **Response Draft Generation:** Prepares acknowledgement, enquiry, and service confirmation drafts.
- **Request History:** Saves processed request records in JSON file storage and retrieves them through the backend.
- **Interactive UI:** Allows users to submit requests and view processing results.
- **REST API Integration:** Connects the React frontend to the Express backend.
- **Cloud Deployment:** Frontend hosted on Vercel and backend hosted on Render.

## 🧠 Request Classification

| Request Type | Example Message | Typical Urgency | Workflow |
|---|---|---|---|
| Complaint | I was charged twice for my order. | High | Complaint Remediation |
| General Enquiry | What are your business hours? | Low | General Enquiry Remediation |
| Service Request | My device is broken and needs repair. | Medium | Service Request Remediation |

The actual classification and urgency depend on the customer message and the model's output.

## 🔀 Workflow Branches

### 1. Complaint Remediation

- Classifies and records the complaint.
- Prepares a customer acknowledgement draft.
- Flags the case for senior support review.
- Creates a high-priority follow-up flag.

**Assigned team:** Senior Customer Support

### 2. General Enquiry Remediation

- Classifies the enquiry.
- Prepares a response draft.
- Marks the request for response review.
- Records the processing status.

**Assigned team:** Customer Support

### 3. Service Request Remediation

- Classifies the service request.
- Checks for missing reference numbers or service details.
- Routes the request for service review.
- Prepares a confirmation draft and SLA review flag.

**Assigned team:** Technical Service Team

> The application generates workflow records, response drafts, and review flags. It does not automatically send customer messages, schedule reminders, or execute external support actions.

## ⚙️ System Workflow

1. The user enters a customer message in the React interface.
2. The frontend sends the request to the Express backend.
3. The backend validates the message.
4. Gemini AI classifies the request and determines urgency.
5. The backend validates the AI response.
6. The system selects the matching workflow branch.
7. Recommended actions and workflow outputs are generated.
8. The request record is saved to JSON file storage.
9. The frontend displays the results and provides access to request history.

## 🛠️ Technology Stack

### Frontend
- React
- JavaScript
- Vite
- HTML
- CSS

### Backend
- Node.js
- Express.js
- REST APIs
- CORS
- JSON file storage

### AI Integration
- Google Gemini API
- `@google/genai`
- Structured JSON responses

### Tools and Deployment
- Visual Studio Code
- Git and GitHub
- Vercel — frontend hosting
- Render — backend hosting

## 📂 Project Structure

```text
smart-request-processing-system/
│
├── server.js
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
│
├── data/
│   └── requests.json
│
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── App.css
        ├── index.css
        ├── main.jsx
        └── assets/
```

The actual repository may contain additional configuration and component files.

## 💻 Run the Project Locally

### Prerequisites

- Node.js and npm
- Git
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/vignesh11230/smart-request-processing-system.git
cd smart-request-processing-system
```

### 2. Configure the backend

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder with your own Gemini API key. Never upload the actual key to GitHub.

Install dependencies and start the backend:

```bash
npm install
npm start
```

The backend should run locally at:

`http://localhost:5000`

### 3. Configure the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

`http://localhost:5173`

## 🔌 API Endpoints

### Health Check

**GET /**

Checks whether the backend server is running.

Live endpoint:

https://smart-request-processing-system.onrender.com/

### Process a Customer Request

**POST /api/process**

Processes a customer message using Gemini AI and generates the matching workflow.

Example request:

```json
{
  "message": "I was charged twice for my order. Please help me get a refund."
}
```

The API returns a processed request record containing the classification, urgency, recommended actions, workflow details, and creation timestamp.

### Retrieve Request History

**GET /api/requests**

Retrieves saved request records.

Optional query parameter:

`/api/requests?limit=10`

This requests up to ten recent records.

## 🧪 Testing Scenarios

### Scenario 1 — Complaint

**Input:**

`I was charged twice for my order. Please help me get a refund.`

**Expected typical result:**
- Type: Complaint
- Urgency: High
- Workflow: Complaint Remediation
- Assigned team: Senior Customer Support

### Scenario 2 — General Enquiry

**Input:**

`Can you tell me your business hours?`

**Expected typical result:**
- Type: General Enquiry
- Urgency: Low
- Workflow: General Enquiry Remediation
- Assigned team: Customer Support

### Scenario 3 — Service Request

**Input:**

`My device is broken and needs repair.`

**Expected typical result:**
- Type: Service Request
- Urgency: Medium
- Workflow: Service Request Remediation
- Assigned team: Technical Service Team

After submitting a request, review the displayed classification, actions, workflow output, and request history.

## 🔐 Environment Variables and Security

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Authenticates the backend with the Gemini API |
| `VITE_API_URL` | Specifies the backend URL used by the frontend |

Security practices:

- Keep the Gemini API key on the backend.
- Never commit `.env` files containing secrets.
- Configure production environment variables in Render and Vercel.
- Do not expose the Gemini API key through a variable prefixed with `VITE_`.

## ⚠️ Limitations

- AI classifications may occasionally be incorrect.
- Generated response drafts require human review before sending.
- Workflow flags represent simulated processing steps, not real external actions.
- Request history currently uses JSON file storage rather than a managed database.
- Data on a temporary hosting filesystem may not persist across service restarts or redeployments.

## 🔮 Future Enhancements

- Integrate PostgreSQL or another persistent database.
- Add user authentication and role-based access.
- Add request search, filtering, and analytics.
- Integrate real customer support and notification systems.
- Add human approval and audit tracking for workflow execution.

## 👨‍💻 Author

**Vignesh**

Computer Science and Engineering

### Connect with Me

- **GitHub:** https://github.com/vignesh11230
- **LinkedIn:** https://www.linkedin.com/in/vignesh-m-9b30542b7/
- **LeetCode:** https://leetcode.com/u/vigneshmahesh10102003/

---

Thank you for exploring the Smart Request Processing System!
