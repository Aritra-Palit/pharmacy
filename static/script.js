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
    if (response.ok) {
      const data = await response.json();
      alert("✅ Login successful");
      localStorage.setItem("loggedInName", data.name);
      localStorage.setItem("loggedInEmpId", data.employeeId);
      localStorage.setItem("loggedInUsername", username);
      localStorage.setItem("loggedInEmpType", data.EmpType);
      if (data.EmpType == "Employee") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } else {
      alert("❌ Invalid login");
    }
  });
});
