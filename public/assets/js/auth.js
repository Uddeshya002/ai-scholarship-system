import { apiFetch } from "./api.js";

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const data = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    securityQuestion: formData.get("securityQuestion"),
    securityAnswer: formData.get("securityAnswer"),
  };

  try {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: data,
    });

    alert(res.message);
  } catch (err) {
    alert(err.message);
  }
});