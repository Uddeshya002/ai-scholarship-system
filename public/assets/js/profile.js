import { apiFetch, getSession, saveSession } from "./api.js";
import { badgeMarkup, initProtectedPage, setAlert } from "./common.js";

const messageBox = document.getElementById("profileMessage");
const form = document.getElementById("profileForm");

function toggleRoleFields(role) {
  document.querySelectorAll(".student-only").forEach((element) => {
    element.classList.toggle("hidden", role !== "student");
  });
  document.querySelectorAll(".admin-only").forEach((element) => {
    element.classList.toggle("hidden", role !== "admin");
  });
}

function fillProfile(profile) {
  toggleRoleFields(profile.role);

  if (profile.role === "student") {
    document.getElementById("firstName").value = profile.firstName || "";
    document.getElementById("lastName").value = profile.lastName || "";
    document.getElementById("dob").value = profile.dob ? profile.dob.slice(0, 10) : "";
    document.getElementById("rollNo").value = profile.rollNo || "";
    document.getElementById("gender").value = profile.gender || "";
    document.getElementById("category").value = profile.category || "";
    document.getElementById("annualIncome").value = profile.annualIncome || "";
    document.getElementById("addressLine").value = profile.addressLine || "";
    document.getElementById("city").value = profile.city || "";
    document.getElementById("state").value = profile.state || "";
    document.getElementById("postalCode").value = profile.postalCode || "";
    document.getElementById("verificationBadge").innerHTML = badgeMarkup(
      profile.isVerified ? "verified" : "unverified"
    );
  } else {
    document.getElementById("fullName").value = profile.fullName || "";
    document.getElementById("verificationBadge").innerHTML = badgeMarkup("admin");
  }

  document.getElementById("email").value = profile.email || "";
  document.getElementById("phone").value = profile.phone || "";
}

async function initPage() {
  try {
    const user = await initProtectedPage({
      allowedRoles: ["student", "admin"],
      activePage: "profile",
      title: "Profile Page",
      subtitle: "View and edit account details, contact information, address, and academic records.",
    });

    const response = await apiFetch("/profile");
    fillProfile(response.profile);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const body = Object.fromEntries(formData.entries());

      try {
        const result = await apiFetch("/profile", {
          method: "PUT",
          body,
        });

        const session = getSession();
        saveSession({
          token: session.token,
          user: {
            ...session.user,
            fullName:
              user.role === "admin"
                ? body.fullName
                : `${body.firstName || ""} ${body.lastName || ""}`.trim(),
            firstName: body.firstName || session.user.firstName,
            lastName: body.lastName || session.user.lastName,
            email: body.email,
            phone: body.phone,
          },
        });

        setAlert(messageBox, result.message, "success");
      } catch (error) {
        setAlert(messageBox, error.message, "error");
      }
    });
  } catch (error) {
    setAlert(messageBox, error.message, "error");
  }
}

initPage();

