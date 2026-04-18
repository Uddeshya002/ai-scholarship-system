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

const messageBox = document.getElementById("scholarshipMessage");
const cardsContainer = document.getElementById("scholarshipCards");
const filterForm = document.getElementById("filterForm");

function populateCategories() {
  document.getElementById("filterCategory").innerHTML = SCHOLARSHIP_CATEGORIES.map((category) => {
    const value = category === "All Categories" ? "" : category;
    return `<option value="${value}">${category}</option>`;
  }).join("");
}

function renderScholarships(user, scholarships) {
  if (!scholarships.length) {
    renderEmptyState(cardsContainer, "No scholarships matched your current search and filter values.");
    return;
  }

  cardsContainer.innerHTML = scholarships
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
          <p class="muted"><strong>Eligibility:</strong> ${escapeHtml(
            scholarship.eligibilityCriteria
          )}</p>
          <div class="scholarship-meta">
            <span class="pill">${escapeHtml(scholarship.category || "Open")}</span>
            <span class="pill">Max Income: ${
              scholarship.maxIncome ? formatCurrency(scholarship.maxIncome) : "No limit"
            }</span>
            <span class="pill">Deadline: ${formatDate(scholarship.deadline)}</span>
          </div>
          ${
            user.role === "student"
              ? `<a class="btn primary small" href="apply.html?scholarshipId=${scholarship.id}">Apply Now</a>`
              : `<span class="pill">Admin view only</span>`
          }
        </article>
      `
    )
    .join("");
}

async function fetchScholarships(user) {
  const formData = new FormData(filterForm);
  const query = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    if (String(value).trim()) {
      query.set(key, value);
    }
  }

  const response = await apiFetch(`/student/scholarships?${query.toString()}`);
  renderScholarships(user, response.scholarships);
}

async function initPage() {
  try {
    populateCategories();

    const user = await initProtectedPage({
      allowedRoles: ["student", "admin"],
      activePage: "scholarships",
      title: "Scholarship Page",
      subtitle: "Browse scholarships with cards, search by keyword, and filter by income or category.",
    });

    await fetchScholarships(user);

    filterForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await fetchScholarships(user);
    });
  } catch (error) {
    setAlert(messageBox, error.message, "error");
  }
}

initPage();

