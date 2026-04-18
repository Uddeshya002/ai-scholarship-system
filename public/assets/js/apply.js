import { apiFetch } from "./api.js";
import {
  badgeMarkup,
  escapeHtml,
  formatCurrency,
  formatDate,
  initProtectedPage,
  setAlert,
} from "./common.js";

const messageBox = document.getElementById("applyMessage");
const scholarshipSelect = document.getElementById("scholarshipId");
const previewContainer = document.getElementById("selectedScholarshipPreview");
const applicationForm = document.getElementById("applicationForm");
const queryScholarshipId = new URLSearchParams(window.location.search).get("scholarshipId");

let scholarshipList = [];

function renderScholarshipPreview(scholarship) {
  if (!scholarship) {
    previewContainer.innerHTML = `<div class="empty-state">Choose a scholarship to preview its details.</div>`;
    return;
  }

  previewContainer.innerHTML = `
    <article class="scholarship-card">
      <div class="section-head">
        <div>
          <h3>${escapeHtml(scholarship.name)}</h3>
          <p class="muted">${formatCurrency(scholarship.amount)}</p>
        </div>
        ${badgeMarkup(scholarship.status)}
      </div>
      <p>${escapeHtml(scholarship.description)}</p>
      <p class="muted"><strong>Eligibility:</strong> ${escapeHtml(scholarship.eligibilityCriteria)}</p>
      <div class="scholarship-meta">
        <span class="pill">${escapeHtml(scholarship.category || "Open")}</span>
        <span class="pill">Max Income: ${
          scholarship.maxIncome ? formatCurrency(scholarship.maxIncome) : "No limit"
        }</span>
        <span class="pill">Deadline: ${formatDate(scholarship.deadline)}</span>
      </div>
    </article>
  `;
}

function populateScholarships() {
  scholarshipSelect.innerHTML = scholarshipList
    .filter((scholarship) => scholarship.status === "open")
    .map(
      (scholarship) => `
        <option value="${scholarship.id}">
          ${scholarship.name} - ${formatCurrency(scholarship.amount)}
        </option>
      `
    )
    .join("");

  if (queryScholarshipId) {
    scholarshipSelect.value = queryScholarshipId;
  }

  const selected = scholarshipList.find((item) => String(item.id) === scholarshipSelect.value);
  renderScholarshipPreview(selected);
}

async function loadScholarships() {
  const response = await apiFetch("/student/scholarships");
  scholarshipList = response.scholarships;
  populateScholarships();
}

async function initPage() {
  try {
    await initProtectedPage({
      allowedRoles: ["student"],
      activePage: "apply",
      title: "Apply for Scholarship",
      subtitle: "Select a scholarship, upload your document, and submit the application form.",
    });

    await loadScholarships();

    scholarshipSelect.addEventListener("change", () => {
      const selected = scholarshipList.find((item) => String(item.id) === scholarshipSelect.value);
      renderScholarshipPreview(selected);
    });

    applicationForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(applicationForm);

      try {
        const response = await apiFetch("/student/applications", {
          method: "POST",
          body: formData,
        });

        setAlert(messageBox, response.message, "success");
        applicationForm.reset();
        setTimeout(() => {
          window.location.href = "applications.html";
        }, 900);
      } catch (error) {
        setAlert(messageBox, error.message, "error");
      }
    });
  } catch (error) {
    setAlert(messageBox, error.message, "error");
  }
}

initPage();

