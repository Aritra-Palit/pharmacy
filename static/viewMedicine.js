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

document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#medicineTable tbody");
  const searchBar = document.getElementById("searchBar");

  let medicines = [];

  try {
    const res = await fetch("/medicines");
    medicines = await res.json();
    renderTable(medicines);
  } catch (err) {
    console.error("Failed to load medicines:", err);
  }

  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(med => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${med.MedicineID}</td>
        <td>${med.name}</td>
        <td>${med.Quantity}</td>
        <td>${med.Price}</td>
        <td>${med.dateAdded}</td>
        <td>${med.lastUpdated}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  searchBar.addEventListener("input", () => {
    const value = searchBar.value.toLowerCase();
    const filtered = medicines.filter(med =>
      med.MedicineID.toLowerCase().includes(value) ||
      med.name.toLowerCase().includes(value)
    );
    renderTable(filtered);
  });
});
