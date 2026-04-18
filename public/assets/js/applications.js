import { apiFetch } from "./api.js";
import {
  badgeMarkup,
  formatCurrency,
  formatDate,
  initProtectedPage,
  renderEmptyState,
  setAlert,
} from "./common.js";

const messageBox = document.getElementById("applicationsMessage");

function renderSummary(applications) {
  const counts = {
    pending: applications.filter((item) => item.status === "pending").length,
    approved: applications.filter((item) => item.status === "approved").length,
    rejected: applications.filter((item) => item.status === "rejected").length,
    paid: applications.filter((item) => item.status === "paid").length,
  };

  document.getElementById("applicationSummary").innerHTML = [
    ["Pending", counts.pending],
    ["Approved", counts.approved],
    ["Rejected", counts.rejected],
    ["Paid", counts.paid],
  ]
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <span class="muted">${label}</span>
          <span class="value">${value}</span>
          <p class="muted">Applications in ${label.toLowerCase()} state.</p>
        </article>
      `
    )
    .join("");
}

function renderTable(applications) {
  const tbody = document.getElementById("applicationsTableBody");

  if (!applications.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No applications submitted yet.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = applications
    .map(
      (application) => `
        <tr>
          <td>${application.applicationNo}</td>
          <td>${application.scholarshipName}</td>
          <td>${badgeMarkup(application.status)}</td>
          <td>${badgeMarkup(application.paymentStatus)}</td>
          <td>${formatCurrency(application.amount)}</td>
          <td>${formatDate(application.submittedAt)}</td>
          <td><a class="link-button" href="${application.documentPath}" target="_blank">Open</a></td>
        </tr>
      `
    )
    .join("");
}

async function initPage() {
  try {
    await initProtectedPage({
      allowedRoles: ["student"],
      activePage: "applications",
      title: "My Applications",
      subtitle: "Track pending, approved, rejected, and paid scholarship applications in one table.",
    });

    const response = await apiFetch("/student/applications");
    renderSummary(response.applications);
    renderTable(response.applications);
  } catch (error) {
    setAlert(messageBox, error.message, "error");
  }
}

initPage();

