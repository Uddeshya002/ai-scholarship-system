import { apiFetch, clearSession, getSession, saveSession } from "./api.js";

const navByRole = {
  student: [
    { key: "dashboard", href: "dashboard.html", label: "Dashboard" },
    { key: "scholarships", href: "scholarships.html", label: "Scholarships" },
    { key: "apply", href: "apply.html", label: "Apply" },
    { key: "applications", href: "applications.html", label: "My Applications" },
    { key: "profile", href: "profile.html", label: "Profile" },
    { key: "settings", href: "settings.html", label: "Settings" },
  ],
  admin: [
    { key: "admin", href: "admin.html", label: "Admin Panel" },
    { key: "scholarships", href: "scholarships.html", label: "Scholarships" },
    { key: "profile", href: "profile.html", label: "Profile" },
    { key: "settings", href: "settings.html", label: "Settings" },
  ],
};

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function badgeMarkup(value) {
  const label = String(value || "not-started").replaceAll("_", " ");
  const className = label.toLowerCase().replace(/\s+/g, "-");
  return `<span class="badge ${className}">${escapeHtml(label)}</span>`;
}

export function setAlert(element, message, type = "info") {
  if (!element) return;

  if (!message) {
    element.hidden = true;
    element.textContent = "";
    element.className = "alert";
    return;
  }

  element.hidden = false;
  element.className = `alert ${type}`;
  element.textContent = message;
}

export function renderEmptyState(container, message) {
  container.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

export function redirectForRole(role) {
  window.location.href = role === "admin" ? "admin.html" : "dashboard.html";
}

function renderSidebar(user, activePage) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const navItems = navByRole[user.role] || [];

  sidebar.innerHTML = `
    <div class="brand-block">
      <div class="brand-mark">SH</div>
      <div>
        <h2>ScholarHub</h2>
        <p class="muted">Scholarship management workspace</p>
      </div>
    </div>
    <nav>
      ${navItems
        .map(
          (item) => `
          <a class="nav-link ${item.key === activePage ? "active" : ""}" href="${item.href}">
            <span>${item.label}</span>
          </a>
        `
        )
        .join("")}
    </nav>
    <div class="sidebar-footer">
      <div>
        <strong>${escapeHtml(user.fullName || user.firstName || "User")}</strong>
        <p class="muted">${escapeHtml(user.email)}</p>
      </div>
      <button class="btn ghost" id="logoutButton" type="button">Logout</button>
    </div>
  `;

  document.getElementById("logoutButton")?.addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });
}

function renderHeader(user, title, subtitle) {
  const header = document.getElementById("pageHeader");
  if (!header) return;

  header.className = "topbar";
  header.innerHTML = `
    <div>
      <h1>${escapeHtml(title)}</h1>
      <p class="muted">${escapeHtml(subtitle)}</p>
    </div>
    <div class="user-chip">
      <div>
        <strong>${escapeHtml(user.fullName || user.firstName || "User")}</strong>
        <p class="muted">${escapeHtml(user.role)}</p>
      </div>
      ${badgeMarkup(user.role)}
    </div>
  `;
}

export async function initProtectedPage({ allowedRoles, activePage, title, subtitle }) {
  const session = getSession();

  if (!session?.token) {
    window.location.href = "index.html";
    return null;
  }

  if (allowedRoles?.length && session.user?.role && !allowedRoles.includes(session.user.role)) {
    redirectForRole(session.user.role);
    return null;
  }

  const data = await apiFetch("/auth/me");
  saveSession({ token: session.token, user: data.user });

  if (allowedRoles?.length && !allowedRoles.includes(data.user.role)) {
    redirectForRole(data.user.role);
    return null;
  }

  renderSidebar(data.user, activePage);
  renderHeader(data.user, title, subtitle);

  return data.user;
}

