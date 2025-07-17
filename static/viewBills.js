const name = localStorage.getItem("loggedInName");
const empid = localStorage.getItem("loggedInEmpId");

if (!name || !empid) {
  window.location.href = "/";
}

const welcomeE2 = document.getElementById("Login");
if (welcomeE2) {
  welcomeE2.textContent = `${name}`;
}

// Logout handler
function logout() {
  localStorage.clear();
  window.location.href = "/";
}

fetch("/api/bills")
  .then(res => res.json())
  .then(data => {
    const tbody = document.querySelector("#billTable tbody");
    tbody.innerHTML = "";

    data.forEach(bill => {
        console.log(bill);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${bill.timestamp || "-"}</td>
        <td>${bill.user || "-"}</td>
        <td>${bill.customer || "-"}</td>
        <td>${bill.phone || "-"}</td>
        <td>${bill.address || "-"}</td>
        <td>₹${bill.total || 0}</td>
        <td>${bill.products.map(p => p.product).join(", ") || "-"}</td>
        <td>₹${bill.products.map(p => p.price).join(", ₹") || "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  });

document.getElementById("billSearch").addEventListener("input", function () {
  const search = this.value.toLowerCase();
  document.querySelectorAll("#billTable tbody tr").forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(search) ? "" : "none";
  });
});
