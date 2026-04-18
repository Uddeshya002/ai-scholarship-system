import { apiFetch } from "./api.js";
import { SECURITY_QUESTIONS } from "./constants.js";
import { initProtectedPage, setAlert } from "./common.js";

const messageBox = document.getElementById("settingsMessage");
const passwordForm = document.getElementById("passwordForm");
const securityForm = document.getElementById("securityQuestionForm");

function populateSecurityQuestions() {
  document.getElementById("settingsSecurityQuestion").innerHTML = SECURITY_QUESTIONS.map(
    (question) => `<option value="${question}">${question}</option>`
  ).join("");
}

async function initPage() {
  try {
    await initProtectedPage({
      allowedRoles: ["student", "admin"],
      activePage: "settings",
      title: "Settings and More",
      subtitle: "Change your password, refresh the security question, and keep recovery options updated.",
    });

    populateSecurityQuestions();

    const profile = await apiFetch("/profile");
    document.getElementById(
      "currentSecurityQuestion"
    ).textContent = `Current question: ${profile.profile.securityQuestion}`;

    passwordForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(passwordForm);

      try {
        const response = await apiFetch("/profile/password", {
          method: "PUT",
          body: Object.fromEntries(formData.entries()),
        });

        setAlert(messageBox, response.message, "success");
        passwordForm.reset();
      } catch (error) {
        setAlert(messageBox, error.message, "error");
      }
    });

    securityForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(securityForm);

      try {
        const response = await apiFetch("/profile/security-question", {
          method: "PUT",
          body: Object.fromEntries(formData.entries()),
        });

        setAlert(messageBox, response.message, "success");
        document.getElementById(
          "currentSecurityQuestion"
        ).textContent = `Current question: ${formData.get("securityQuestion")}`;
        securityForm.reset();
      } catch (error) {
        setAlert(messageBox, error.message, "error");
      }
    });
  } catch (error) {
    setAlert(messageBox, error.message, "error");
  }
}

initPage();
