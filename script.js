let usersSheet = [];

fetch('master.xlsx')
  .then(res => res.arrayBuffer())
  .then(data => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets["Usernames"];
    usersSheet = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    console.log("Loaded users:", usersSheet);
  });

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const match = usersSheet.find(user =>
  user.Username.trim().toLowerCase() === username.toLowerCase() &&
  String(user.Password).trim() === password
);


    if (match) {
      alert("✅ Login successful");
      window.location.href = "dashboard.html";
    } else {
      alert("❌ Invalid login");
    }
  });
});
