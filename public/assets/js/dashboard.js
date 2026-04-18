import { apiFetch } from "./api.js";
import {
  badgeMarkup,
  escapeHtml,
  formatCurrency,
  formatDate,
  initProtectedPage,
  renderEmptyState,
  setAlert,
} from "./common.js";

const messageBox = document.getElementById("dashboardMessage");

function renderSummary(summary) {
  const cards = [
    ["Total Scholarships Available", summary.totalScholarshipsAvailable],
    ["Applications Submitted", summary.applicationsSubmitted],
    ["Approved Applications", summary.approvedApplications],
    ["Pending Applications", summary.pendingApplications],
  ];

  document.getElementById("summaryCards").innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <span class="muted">${label}</span>
          <span class="value">${value}</span>
          <p class="muted">Updated from the latest database records.</p>
        </article>
      `
    )
    .join("");
}

function renderRecentApplications(applications) {
  const container = document.getElementById("recentApplications");

  if (!applications.length) {
    renderEmptyState(container, "No applications yet. Start by applying for a scholarship.");
    return;
  }

  container.innerHTML = `
    <div class="mini-list">
      ${applications
        .map(
          (application) => `
            <article class="list-card">
              <div class="section-head">
                <div>
                  <strong>${escapeHtml(application.scholarshipName)}</strong>
                  <p class="muted">${escapeHtml(application.applicationNo)}</p>
                </div>
                ${badgeMarkup(application.status)}
              </div>
              <p class="muted">Submitted on ${formatDate(application.submittedAt)}</p>
              <p class="muted">Payment: ${application.paymentStatus}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderHighlights(scholarships) {
  const container = document.getElementById("highlightedScholarships");

  if (!scholarships.length) {
    renderEmptyState(container, "No open scholarships are available right now.");
    return;
  }

  container.innerHTML = scholarships
    .map(
      (scholarship) => `
        <article class="scholarship-card">
          <div class="section-head">
            <div>
              <h3>${escapeHtml(scholarship.name)}</h3>
              <p class="muted">${formatCurrency(scholarship.amount)}</p>
            </div>
            ${badgeMarkup(scholarship.status)}
          </div>
          <p>${escapeHtml(scholarship.description)}</p>
          <div class="scholarship-meta">
            <span class="pill">${escapeHtml(scholarship.category || "Open")}</span>
            <span class="pill">Deadline: ${formatDate(scholarship.deadline)}</span>
          </div>
          <a class="btn secondary small" href="apply.html?scholarshipId=${scholarship.id}">Apply</a>
        </article>
      `
    )
    .join("");
}

async function loadDashboard() {
  try {
    await initProtectedPage({
      allowedRoles: ["student"],
      activePage: "dashboard",
      title: "Student Dashboard",
      subtitle: "Check scholarship availability, track applications, and move quickly through your workflow.",
    });

    const response = await apiFetch("/student/dashboard");
    renderSummary(response.summary);
    renderRecentApplications(response.recentApplications);
    renderHighlights(response.highlightedScholarships);
  } catch (error) {
    setAlert(messageBox, error.message, "error");
  }
}

loadDashboard();

