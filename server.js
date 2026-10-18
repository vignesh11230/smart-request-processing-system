require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in your .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Store request history in a JSON file beside server.js.
const DATA_DIRECTORY = path.join(__dirname, "data");
const REQUESTS_FILE = path.join(DATA_DIRECTORY, "requests.json");

async function ensureRequestsFile() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await fs.access(REQUESTS_FILE);
  } catch {
    await fs.writeFile(REQUESTS_FILE, "[]\n", "utf8");
  }
}

async function readRequests() {
  await ensureRequestsFile();

  const contents = await fs.readFile(REQUESTS_FILE, "utf8");

  try {
    const requests = JSON.parse(contents);
    if (!Array.isArray(requests)) {
      throw new Error("Request history must be a JSON array.");
    }
    return requests;
  } catch (error) {
    throw new Error(`Could not read data/requests.json: ${error.message}`);
  }
}

async function saveRequest(record) {
  const requests = await readRequests();
  requests.unshift(record);
  await fs.writeFile(
    REQUESTS_FILE,
    `${JSON.stringify(requests, null, 2)}\n`,
    "utf8"
  );
}

// Ask Gemini to classify the incoming request.
async function analyzeWithGemini(message) {
  const response = await ai.models.generateContent({
    // Keep the model name that was in your original code.
    model: "gemini-3.8-flash",
    contents: `
You are a customer request classification assistant.

Analyze this customer message:
${JSON.stringify(message)}

Choose exactly one type:
- complaint
- service_request
- general_enquiry

Choose urgency:
- High for complaints involving duplicate charges, refunds,
  serious issues, or urgent problems.
- Medium for repair and technical service requests.
- Low for ordinary questions and general enquiries.

Recommend at least two practical actions.

Return only JSON matching the required schema.
`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          type: {
            type: "STRING",
            enum: [
              "complaint",
              "service_request",
              "general_enquiry",
            ],
          },
          urgency: {
            type: "STRING",
            enum: ["High", "Medium", "Low"],
          },
          actions: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: ["type", "urgency", "actions"],
      },
    },
  });

  const result = JSON.parse(response.text);

  const validTypes = [
    "complaint",
    "service_request",
    "general_enquiry",
  ];
  const validUrgencies = ["High", "Medium", "Low"];

  if (
    !validTypes.includes(result.type) ||
    !validUrgencies.includes(result.urgency) ||
    !Array.isArray(result.actions) ||
    result.actions.length < 2 ||
    !result.actions.every(
      (action) =>
        typeof action === "string" && action.trim().length > 0
    )
  ) {
    throw new Error("Gemini returned an invalid response.");
  }

  return result;
}

// Create a different workflow for each request type.
// These are workflow records and drafts, not real external actions.
function createWorkflow(message, classification) {
  const { type, urgency, actions } = classification;

  if (type === "complaint") {
    return {
      branch: "Complaint Remediation",
      status: "Escalation required",
      steps: [
        "Complaint classified and recorded",
        "Customer acknowledgement draft prepared",
        "Case flagged for senior support review",
        "High-priority follow-up flag created",
      ],
      outputs: {
        acknowledgementDraft:
          `We are sorry to hear about your experience. We have received your complaint: "${message}". Our support team needs to review this issue and follow up with you.`,
        routedTeam: "Senior Customer Support",
        priority: urgency,
        followUp: {
          required: true,
          target: "Within 2 hours",
          status: "Flag created; reminder not scheduled",
        },
        caseLog: {
          type,
          urgency,
          status: "Open - Escalation required",
        },
      },
      actions,
    };
  }

  if (type === "general_enquiry") {
    return {
      branch: "General Enquiry Remediation",
      status: "Response draft prepared",
      steps: [
        "Enquiry classified",
        "General enquiry response draft prepared",
        "Request marked for response review",
        "Processing status recorded",
      ],
      outputs: {
        responseDraft:
          `Thank you for your enquiry: "${message}". We have received your question. The relevant team should review it and confirm an accurate answer.`,
        routedTeam: "Customer Support",
        resolutionStatus: "Awaiting response review",
        caseLog: {
          type,
          urgency,
          status: "Response draft prepared",
        },
      },
      actions,
    };
  }

  // service_request branch
  const missingDetails = [];

  if (!/\b\d{5,}\b/.test(message)) {
    missingDetails.push("Order or reference number, if applicable");
  }

  if (
    !/\b(repair|broken|damaged|not working|install|installation)\b/i.test(
      message
    )
  ) {
    missingDetails.push("Specific service or issue details");
  }

  return {
    branch: "Service Request Remediation",
    status: "Routed for service review",
    steps: [
      "Service request classified",
      "Required information checked",
      "Request routed to the service team",
      "Confirmation draft and SLA review flag created",
    ],
    outputs: {
      extractedDetails: {
        originalRequest: message,
        missingDetails,
      },
      routedTeam: "Technical Service Team",
      confirmationDraft:
        `We have received your service request: "${message}". Our service team will review the details and confirm the next steps.`,
      sla: {
        reviewRequired: true,
        status: "SLA review flag created; timer not running",
      },
      caseLog: {
        type,
        urgency,
        status: "Open - Service review required",
      },
    },
    actions,
  };
}

// Health-check endpoint
app.get("/", (req, res) => {
  res.send("Smart Request Processing System is running!");
});

// Retrieve saved request history.
// Optional: /api/requests?limit=10
app.get("/api/requests", async (req, res) => {
  try {
    const requests = await readRequests();
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : requests.length;

    return res.json({
      count: requests.length,
      requests: requests.slice(0, limit),
    });
  } catch (error) {
    console.error("Request history read error:", error.message);
    return res.status(500).json({
      error: "Unable to read saved request history.",
    });
  }
});

// Process, classify, create a workflow, and save each customer request.
app.post("/api/process", async (req, res) => {
  const message = req.body?.message;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "Please provide a valid message.",
    });
  }

  if (message.trim().length > 5000) {
    return res.status(400).json({
      error: "Message must be 5000 characters or fewer.",
    });
  }

  try {
    const cleanMessage = message.trim();

    // Step 1: Gemini classifies the request.
    const classification = await analyzeWithGemini(cleanMessage);

    // Step 2: Backend selects the matching remediation branch.
    const workflow = createWorkflow(cleanMessage, classification);

    // Step 3: Create a persistent request record.
    const record = {
      id: randomUUID(),
      message: cleanMessage,
      type: classification.type,
      urgency: classification.urgency,
      actions: classification.actions,
      workflow,
      createdAt: new Date().toISOString(),
    };

    // Step 4: Save before reporting success to the frontend.
    await saveRequest(record);

    // Preserve the response fields expected by the existing UI.
    return res.status(201).json(record);
  } catch (error) {
    console.error("Request processing error:", error);
    console.error("Underlying cause:", error.cause);

    return res.status(500).json({
      error:
        "Unable to process or save the request. Check the backend terminal and data/requests.json.",
    });
  }
});

// Ensure storage exists, then start the backend.
async function startServer() {
  try {
    await ensureRequestsFile();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Request history: ${REQUESTS_FILE}`);
    });
  } catch (error) {
    console.error("Could not initialize request storage:", error.message);
    process.exit(1);
  }
}

startServer();
