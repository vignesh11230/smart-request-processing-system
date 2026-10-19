
import { useState } from "react";
import "./App.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; 
const samples = [
  {
    label: "Customer complaint",
    icon: "!",
    message:
      "I was charged twice for my order. Please resolve this immediately.",
  },
  {
    label: "General enquiry",
    icon: "?",
    message: "What are your business hours?",
  },
  {
    label: "Service request",
    icon: "⚙",
    message: "My washing machine is broken and needs repair.",
  },
];

const formatType = (type = "") =>
  type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function DetailCard({ title, children }) {
  return (
    <article className="detail-card">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestHistory, setRequestHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [activeResultTab, setActiveResultTab] = useState("details");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [statusExpanded, setStatusExpanded] = useState(false);

  async function loadRequestHistory() {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const response = await fetch(`${API_URL}/api/requests`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load request history.");
      }

      setRequestHistory(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      setHistoryError(
        err.message || "Could not connect to the request history API."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  function toggleHistory() {
    const shouldOpen = !historyOpen;
    setHistoryOpen(shouldOpen);
    if (shouldOpen) loadRequestHistory();
  }

  async function processRequest(text = message) {
    const cleanMessage = text.trim();

    if (!cleanMessage) {
      setError("Please enter a customer request.");
      return;
    }

    setMessage(cleanMessage);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request processing failed.");
      }

      if (!data.workflow) {
        throw new Error(
          "Workflow data is missing. Save server.js and restart the backend."
        );
      }

      setResult(data);
      setActiveResultTab("details");
      setStatusExpanded(false);
      if (historyOpen) await loadRequestHistory();
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Check that server.js is running."
      );
    } finally {
      setLoading(false);
    }
  }

  const workflow = result?.workflow;
  const outputs = workflow?.outputs;

  function reset() {
    setMessage("");
    setResult(null);
    setError("");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">✧</span>
          <div>
            <strong>Smart Request</strong>
            <span>AI PROCESSING SYSTEM</span>
          </div>
        </div>

        <div className="topbar-right">
          <span className="system-status">
            <i className="status-dot" />
            AI processing system
          </span>
          <button className="secondary-button" onClick={reset}>
            ↻ New analysis
          </button>
        </div>
      </header>

      <section className="hero">
        <span className="eyebrow">SMART REQUEST WORKSPACE</span>
        <h1>
          Transform your challenges
          <br />
          <span>into actionable intelligence.</span>
        </h1>
        <p>
          AI-driven classification. Branch-specific workflows. Actionable next
          steps.
        </p>
      </section>

      <section className="request-card">
        <div className="section-heading">
          <span className="heading-icon">✎</span>
          <div>
            <h2>Analyze a request</h2>
            <p>
              Enter a customer request to classify it and prepare its processing
              workflow.
            </p>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            processRequest();
          }}
        >
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Enter the customer's message..."
            maxLength={5000}
            rows={5}
            disabled={loading}
          />

          <div className="input-footer">
            <span>{message.length} / 5000 characters</span>
            <button
              className="primary-button"
              type="submit"
              disabled={loading || !message.trim()}
            >
              {loading ? "Processing..." : "✦ Process request →"}
            </button>
          </div>
        </form>

        <div className="sample-heading">QUICK TEST EXAMPLES</div>
        <p className="sample-help">Choose an example to fill the message box, then click Process request.</p>

        <div className="sample-grid">
          {samples.map((sample) => (
            <button
              className="sample-card"
              key={sample.label}
              type="button"
              disabled={loading}
              onClick={() => {
                setMessage(sample.message);
                setError("");
              }}
            >
              <span className="sample-icon">{sample.icon}</span>
              <span className="sample-content">
                <strong>{sample.label}</strong>
                <small>{sample.message}</small>
              </span>
              <span className="sample-arrow">→</span>
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <section className="feedback-card">
          <span className="spinner" />
          <div>
            <h2>Processing your request</h2>
            <p>Classifying the message and preparing the workflow...</p>
          </div>
        </section>
      )}

      {error && !loading && (
        <section className="feedback-card error-card" role="alert">
          <span className="feedback-icon">!</span>
          <div>
            <h2>We couldn't process that request</h2>
            <p>{error}</p>
          </div>
        </section>
      )}

      {result && workflow && !loading && (
        <section className="results-section">
          <div className="results-heading">
            <div>
              <span className="eyebrow">PROCESSING RESULT</span>
              <h2>Request workflow</h2>
            </div>
            <span className="complete-pill">
              <i className="status-dot" />
              Analysis complete
            </span>
          </div>

          <div className="summary-grid">
            <article className="summary-card">
              <span className="card-label">⌘ &nbsp; REQUEST TYPE</span>
              <h2>{formatType(result.type)}</h2>
              <p>Category identified by the AI classifier.</p>
              <div className="card-bottom">● Workflow branch selected</div>
            </article>

            <article
              className={`summary-card urgency-card urgency-${(
                result.urgency || "low"
              ).toLowerCase()}`}
            >
              <span className="card-label">◉ &nbsp; URGENCY LEVEL</span>
              <h2>
                <i className="urgency-dot" />
                {result.urgency}
              </h2>
              <p>Priority level assigned to this request.</p>
              <div className="card-bottom">● AI-assessed urgency</div>
            </article>
          </div>

          <article className="detail-card execution-card">
            <div className="execution-heading">
              <span className="heading-icon success-icon">✓</span>
              <div>
                <h3>Workflow execution plan</h3>
                <p>Branch-specific steps prepared by the backend.</p>
              </div>
              <span className="step-count">
                {(workflow.steps || []).length} steps
              </span>
            </div>

            {(workflow.steps || result.actions || []).map((step, index) => (
              <div className="workflow-step" key={`${index}-${step}`}>
                <span className="step-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
                <span className="step-check">✓</span>
              </div>
            ))}

            <p className="workflow-note">
              These steps are prepared workflow actions. External actions are
              not performed automatically.
            </p>
          </article>

          <section className="result-tabs-card">
            <div className="result-tabs-row">
              <div className="result-tabs" role="tablist" aria-label="Workflow result details">
              <button
                type="button"
                role="tab"
                aria-selected={activeResultTab === "details"}
                className={activeResultTab === "details" ? "result-tab active" : "result-tab"}
                onClick={() => setActiveResultTab("details")}
              >
                Branch details
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeResultTab === "outputs"}
                className={activeResultTab === "outputs" ? "result-tab active" : "result-tab"}
                onClick={() => setActiveResultTab("outputs")}
              >
                Generated outputs
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeResultTab === "review"}
                className={activeResultTab === "review" ? "result-tab active" : "result-tab"}
                onClick={() => setActiveResultTab("review")}
              >
                Review & actions
              </button>
              </div>
              <button
                type="button"
                className="secondary-button review-history-button"
                onClick={toggleHistory}
              >
                {historyOpen ? "Hide history" : "↺ History"}
              </button>
            </div>

            {activeResultTab === "details" && (
              <div className="result-tab-panel" role="tabpanel">
                <div className="branch-overview-grid">
                  <article className="branch-info-card">
                    <span className="mini-label">SELECTED WORKFLOW</span>
                    <h3>{workflow.branch || formatType(result.type)}</h3>
                    <p>The request has been assigned to its matching remediation branch.</p>
                  </article>
                  <article className="branch-info-card team-info-card">
                    <span className="mini-label">ASSIGNED TEAM</span>
                    <h3>{outputs?.routedTeam || "Not specified"}</h3>
                    <p>Team identified for the next handling step.</p>
                  </article>
                </div>
                <article className="status-interactive-card">
                  <div className="status-card-main">
                    <div className={`status-symbol ${/escalat|red flag|high|urgent|open/i.test(String(workflow.status || "")) ? "status-symbol-alert" : /review|pending|medium/i.test(String(workflow.status || "")) ? "status-symbol-pending" : ""}`}><i className={`inline-status-dot ${/escalat|red flag|high|urgent|open/i.test(String(workflow.status || "")) ? "dot-red" : /review|pending|medium/i.test(String(workflow.status || "")) ? "dot-orange" : "dot-green"}`} /></div>
                    <div className="status-copy">
                      <span className="mini-label">WORKFLOW STATUS</span>
                      <h3>{workflow.status || "Status not specified"}</h3>
                      <p>Current status returned by the workflow.</p>
                    </div>
                    <button type="button" className="status-details-button" aria-expanded={statusExpanded} onClick={() => setStatusExpanded((open) => !open)}>
                      {statusExpanded ? "Hide details" : "View details"} <span>{statusExpanded ? "−" : "+"}</span>
                    </button>
                  </div>
                  {statusExpanded && <div className="status-expanded-content"><strong>What this means</strong><p>This is a workflow status indicator, not proof that an external notification or follow-up was sent. Any required next steps are listed in the workflow plan and review section.</p></div>}
                </article>
                {outputs?.extractedDetails && (
                  <DetailCard title="Extracted service details">
                    <p className="workflow-note"><strong>Customer request:</strong> {outputs.extractedDetails.originalRequest}</p>
                    <strong>Missing details</strong>
                    {outputs.extractedDetails.missingDetails?.length ? (
                      <ul className="details-list">
                        {outputs.extractedDetails.missingDetails.map((detail) => <li key={detail}>{detail}</li>)}
                      </ul>
                    ) : <p className="workflow-note">No missing details identified.</p>}
                  </DetailCard>
                )}
              </div>
            )}

            {activeResultTab === "outputs" && (
              <div className="result-tab-panel" role="tabpanel">
                {outputs?.acknowledgementDraft && <DetailCard title="Customer acknowledgement draft"><p className="draft-text">{outputs.acknowledgementDraft}</p><p className="workflow-note">Draft only — no message was sent.</p></DetailCard>}
                {outputs?.responseDraft && <DetailCard title="General enquiry response draft"><p className="draft-text">{outputs.responseDraft}</p><p className="workflow-note">Review the answer before sending it to the customer.</p></DetailCard>}
                {outputs?.confirmationDraft && <DetailCard title="Service confirmation draft"><p className="draft-text">{outputs.confirmationDraft}</p><p className="workflow-note">Draft only — no confirmation was sent.</p></DetailCard>}
                {!outputs?.acknowledgementDraft && !outputs?.responseDraft && !outputs?.confirmationDraft && <p className="workflow-note">No customer message draft was generated for this request.</p>}
              </div>
            )}

            {activeResultTab === "review" && (
              <div className="result-tab-panel" role="tabpanel">
                <div className="review-grid">
                  {outputs?.followUp && <DetailCard title="Complaint follow-up"><div className="review-status-row"><span>Follow-up required</span><span className={outputs.followUp.required ? "state-pill state-warning" : "state-pill state-neutral"}>{outputs.followUp.required ? "Required" : "Not required"}</span></div><div className="review-meta"><span>Target</span><strong>{outputs.followUp.target}</strong></div><div className="review-meta"><span>Status</span><strong className="inline-status"><i className={`inline-status-dot ${/red flag|escalat|open|high|urgent/i.test(String(outputs.followUp.status || "")) ? "dot-red" : /not scheduled|pending|review|medium/i.test(String(outputs.followUp.status || "")) ? "dot-orange" : "dot-green"}`} />{outputs.followUp.status}</strong></div></DetailCard>}
                  {outputs?.sla && <DetailCard title="Service SLA review"><div className="review-status-row"><span>Review required</span><span className={outputs.sla.reviewRequired ? "state-pill state-warning" : "state-pill state-neutral"}>{outputs.sla.reviewRequired ? "Required" : "Not required"}</span></div><div className="review-meta"><span>Status</span><strong className="inline-status"><i className={`inline-status-dot ${/breach|overdue|high|urgent|open/i.test(String(outputs.sla.status || "")) ? "dot-red" : /pending|review|medium|not scheduled/i.test(String(outputs.sla.status || "")) ? "dot-orange" : "dot-green"}`} />{outputs.sla.status}</strong></div></DetailCard>}
                  {outputs?.resolutionStatus && <DetailCard title="Resolution status"><p className="draft-text">{outputs.resolutionStatus}</p></DetailCard>}
                  {outputs?.caseLog && <DetailCard title="Case log preview"><div className="review-meta"><span>Type</span><strong>{formatType(outputs.caseLog.type)}</strong></div><div className="review-meta"><span>Urgency</span><strong className={`inline-urgency urgency-text-${String(outputs.caseLog.urgency || "low").toLowerCase()}`}><i className="inline-urgency-dot" />{outputs.caseLog.urgency}</strong></div><div className="review-meta"><span>Status</span><strong className="inline-status"><i className={`inline-status-dot ${/escalat|red flag|high|urgent|open/i.test(String(outputs.caseLog.status || "")) ? "dot-red" : /review|pending|medium|not scheduled/i.test(String(outputs.caseLog.status || "")) ? "dot-orange" : "dot-green"}`} />{outputs.caseLog.status}</strong></div><p className="workflow-note">Preview only — not saved to a database.</p></DetailCard>}
                  {result.actions?.length > 0 && <DetailCard title="AI-recommended actions"><ul className="details-list">{result.actions.map((action, index) => <li key={`${index}-${action}`}>{action}</li>)}</ul></DetailCard>}
                </div>
                {!outputs?.followUp && !outputs?.sla && !outputs?.resolutionStatus && !outputs?.caseLog && !result.actions?.length && <p className="workflow-note">No additional review flags were generated for this request.</p>}
              </div>
            )}
          </section>

          <article className="analyzed-message">
            <span className="message-label">ANALYZED MESSAGE</span>
            <p>{result.message || message}</p>
          </article>
        </section>
      )}

      {!result && !loading && !error && (
        <section className="empty-state">
          <div className="empty-graphic">
            <span className="orbit orbit-one" />
            <span className="orbit orbit-two" />
            <span className="empty-center">✧</span>
          </div>
          <strong>Your workflow will appear here</strong>
          <p>
            Submit a request to see its classification, routing, draft
            response, and follow-up flags.
          </p>
        </section>
      )}

      {historyOpen && <section className="request-card history-section" aria-labelledby="request-history-title">
        <div className="section-heading">
          <span className="heading-icon">↺</span>
          <div style={{ flex: 1 }}>
            <h2 id="request-history-title">Request history</h2>
            <p>Previously processed requests saved in requests.json.</p>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={loadRequestHistory}
            disabled={historyLoading}
          >
            {historyLoading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {historyError && (
          <p className="workflow-note" role="alert">{historyError}</p>
        )}

        {!historyError && !historyLoading && requestHistory.length === 0 && (
          <p className="workflow-note">No saved requests yet. Process a request above to see it here.</p>
        )}

        {requestHistory.length > 0 && (
          <div style={{ display: "grid", gap: "12px" }}>
            {requestHistory.map((item) => (
              <article
                key={item.id}
                className="detail-card"
                style={{ margin: 0 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0 }}>{formatType(item.type)}</h3>
                  <span className="complete-pill">
                    {item.urgency || "Urgency not set"} urgency
                  </span>
                </div>
                <p className="draft-text" style={{ marginTop: "12px" }}>
                  {item.message}
                </p>
                <p className="workflow-note">
                  <strong>Assigned team:</strong>{" "}
                  {item.workflow?.outputs?.routedTeam || "Not specified"}
                </p>
                <p className="workflow-note">
                  <strong>Status:</strong>{" "}
                  {item.workflow?.status ||
                    item.workflow?.outputs?.caseLog?.status ||
                    "Not specified"}
                </p>
                <p className="workflow-note">
                  <strong>Saved:</strong>{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "Date not available"}
                </p>
                <p className="workflow-note">
                  <strong>Request ID:</strong> {item.id}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>}

      <footer className="app-footer">
        <span>SMART REQUEST PROCESSING SYSTEM</span>
        <span className="footer-credit">
          <i className="status-dot" />
          Powered by your Gemini backend
        </span>
      </footer>
    </main>
  );
}

export default App;
