import { apiFetch } from "./api.js";
import { SCHOLARSHIP_CATEGORIES } from "./constants.js";
import {
  badgeMarkup,
  escapeHtml,
  formatCurrency,
  formatDate,
  initProtectedPage,
  renderEmptyState,
  setAlert,
} from "./common.js";

const messageBox = document.getElementById("adminMessage");
const scholarshipForm = document.getElementById("scholarshipForm");

function populateCategories() {
  document.getElementById("adminCategory").innerHTML = SCHOLARSHIP_CATEGORIES.filter(
    (item) => item !== "All Categories"
  )
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");
}

function renderSummary(summary) {
  document.getElementById("adminSummary").innerHTML = [
    ["Pending Applications", summary.pendingApplications],
    ["Approved Applications", summary.approvedApplications],
    ["Unverified Students", summary.unverifiedStudents],
    ["Open Scholarships", summary.openScholarships],
  ]
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <span class="muted">${label}</span>
          <span class="value">${value}</span>
          <p class="muted">Live data from the admin dashboard.</p>
        </article>
      `
    )
    .join("");
}

function renderRecentApplications(applications) {
  const container = document.getElementById("recentAdminApplications");

  if (!applications.length) {
    renderEmptyState(container, "No applications are available yet.");
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
                  <strong>${escapeHtml(application.studentName)}</strong>
                  <p class="muted">${escapeHtml(application.scholarshipName)}</p>
                </div>
                ${badgeMarkup(application.status)}
              </div>
              <p class="muted">${escapeHtml(application.applicationNo)} • ${formatDate(
                application.submittedAt
              )}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderStudents(students) {
  const tbody = document.getElementById("studentsTableBody");

  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No students have registered yet.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = students
    .map(
      (student) => `
        <tr>
          <td>${escapeHtml(student.fullName)}</td>
          <td>${escapeHtml(student.email)}</td>
          <td>${escapeHtml(student.rollNo || "-")}</td>
          <td>${formatCurrency(student.annualIncome)}</td>
          <td>${escapeHtml(student.city || "-")}</td>
          <td>${badgeMarkup(student.isVerified ? "verified" : "unverified")}</td>
          <td>
            <button
              class="btn secondary small verify-button"
              data-id="${student.id}"
              data-verified="${student.isVerified}"
              type="button"
            >
              ${student.isVerified ? "Mark Unverified" : "Verify"}
            </button>
          </td>
        </tr>
      `
    )
    .join("");

  document.querySelectorAll(".verify-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const isVerified = button.dataset.verified !== "true";

      try {
        await apiFetch(`/admin/students/${id}/verify`, {
          method: "PATCH",
          body: { isVerified },
        });
        await loadAdminData();
      } catch (error) {
        setAlert(messageBox, error.message, "error");
      }
    });
  });
}

function renderApplications(applications) {
  const tbody = document.getElementById("adminApplicationsTableBody");

  if (!applications.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No applications available.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = applications
    .map(
      (application) => `
        <tr>
          <td>
            <strong>${escapeHtml(application.applicationNo)}</strong>
            <p class="muted">${formatDate(application.submittedAt)}</p>
          </td>
          <td>
            ${escapeHtml(application.studentName)}
            <p class="muted">${escapeHtml(application.studentEmail)}</p>
          </td>
          <td>${escapeHtml(application.scholarshipName)}</td>
          <td>${badgeMarkup(application.status)}</td>
          <td>${badgeMarkup(application.paymentStatus)}</td>
          <td><a class="link-button" href="${application.documentPath}" target="_blank">Open</a></td>
          <td>
            <div class="table-actions">
              <button class="btn secondary small status-button" data-id="${application.id}" data-status="approved" type="button">Approve</button>
              <button class="btn ghost small status-button" data-id="${application.id}" data-status="rejected" type="button">Reject</button>
              <button class="btn primary small status-button" data-id="${application.id}" data-status="paid" type="button">Mark Paid</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  document.querySelectorAll(".status-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const status = button.dataset.status;
      const notes = window.prompt(`Optional remarks for ${status} action:`, "");

      if (notes === null) return;

      try {
        await apiFetch(`/admin/applications/${id}/status`, {
          method: "PATCH",
          body: { status, notes },
        });
        await loadAdminData();
      } catch (error) {
        setAlert(messageBox, error.message, "error");
      }
    });
  });
}

async function loadAdminData() {
  const [dashboard, students, applications] = await Promise.all([
    apiFetch("/admin/dashboard"),
    apiFetch("/admin/students"),
    apiFetch("/admin/applications"),
  ]);

  renderSummary(dashboard.summary);
  renderRecentApplications(dashboard.recentApplications);
  renderStudents(students.students);
  renderApplications(applications.applications);
}

async function initPage() {
  try {
    populateCategories();

    await initProtectedPage({
      allowedRoles: ["admin"],
      activePage: "admin",
      title: "Admin Dashboard",
      subtitle: "Review applications, verify students, create scholarships, and update payment progress.",
    });

    await loadAdminData();

    scholarshipForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(scholarshipForm);

      try {
        const response = await apiFetch("/admin/scholarships", {
          method: "POST",
          body: Object.fromEntries(formData.entries()),
        });

        setAlert(messageBox, response.message, "success");
        scholarshipForm.reset();
        populateCategories();
        await loadAdminData();
      } catch (error) {
        setAlert(messageBox, error.message, "error");
      }
    });
  } catch (error) {
    setAlert(messageBox, error.message, "error");
  }
}

initPage();
