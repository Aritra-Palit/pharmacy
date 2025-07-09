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

let existingMedicines = [];

document.addEventListener("DOMContentLoaded", async () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("dateAdded").value = today;
  document.getElementById("lastUpdated").value = today;

  // Fetch existing medicines for suggestions
  try {
    const res = await fetch("/medicines");
    existingMedicines = await res.json();
  } catch (e) {
    console.error("❌ Failed to fetch medicines:", e);
  }

  const medInput = document.getElementById("medicineID");
  const nameInput = document.getElementById("name");
  const wrapper = medInput.closest(".input-wrapper");
  const suggestionBox = document.createElement("ul");
  suggestionBox.className = "suggestion-list";
  wrapper.appendChild(suggestionBox);


  medInput.addEventListener("input", () => {
    const val = medInput.value.toLowerCase();
    suggestionBox.innerHTML = "";

    const matches = existingMedicines.filter(med =>
      med.MedicineID?.toString().toLowerCase().startsWith(val)
    ).slice(0, 5);

    matches.forEach(med => {
      const li = document.createElement("li");
      li.textContent = `${med.MedicineID} - ${med.name}`;
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        medInput.value = med.MedicineID;
        nameInput.value = med.name;
        document.getElementById("price").value = med.Price || "";
        suggestionBox.innerHTML = "";
      });
      suggestionBox.appendChild(li);
    });
  });

  // Submit form
  document.getElementById("addMedicineForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      medicineID: medInput.value.trim(),
      name: nameInput.value.trim(),
      quantity: document.getElementById("quantity").value.trim(),
      price: document.getElementById("price").value.trim(),
      dateAdded: document.getElementById("dateAdded").value,
      lastUpdated: document.getElementById("lastUpdated").value
    };

    const res = await fetch("/add-medicine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("✅ Medicine added or updated!");
      window.location.href = "/add-medicine";
    } else {
      alert("❌ Failed to add medicine.");
    }
  });
});
