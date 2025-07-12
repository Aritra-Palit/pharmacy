document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch("/login", {
      method: "POST",
      body: formData
    });
