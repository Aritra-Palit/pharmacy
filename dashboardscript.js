const name = localStorage.getItem("loggedInName");
const empid = localStorage.getItem("loggedInEmpId");

if (!name || !empid) {
  window.location.href = "index.html";
}

// Display welcome text
const welcomeEl = document.getElementById("welcomeText");
if (welcomeEl) {
  welcomeEl.textContent = `Welcome, ${name} (${empid})`;
}

const welcomeE2 = document.getElementById("Login");
if (welcomeE2) {
  welcomeE2.textContent = `${name}`;
}

// Logout handler
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Parse Excel-like dates
function parseDate(val) {
  if (!val) return null;
  if (typeof val === "number") return new Date(Date.UTC(1899, 11, 30) + val * 86400000);
  if (typeof val === "string") {
    const [day, month, year] = val.split("-");
    return new Date(`${year}-${month}-${day}`);
  }
  return null;
}

// Dashboard cards
let medicines = [];
let customers = [];

fetch("master.xlsx")
  .then(res => res.arrayBuffer())
  .then(data => {
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets["Medicines"];
    medicines = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const sheets = workbook.Sheets["Customer"];
    customers = XLSX.utils.sheet_to_json(sheets, { defval: "" });

    const now = new Date();

    document.getElementById("stockCount").textContent =
      `Medicines in Stock: ${medicines.length}`;

    const recent = medicines.filter(med => {
      const addedDate = parseDate(med.dateAdded);
      return (now - addedDate) / (1000 * 60 * 60 * 24) <= 7;
    });

    document.getElementById("newCount").textContent =
      `New Medicines Added: ${recent.length}`;

    const pending = medicines.filter(med => {
      const updatedDate = parseDate(med.lastUpdated);
      return (now - updatedDate) / (1000 * 60 * 60 * 24) > 30;
    });

    document.getElementById("pendingCount").textContent =
      `Pending Updates: ${pending.length}`;

    customerSearchBox();
    setupSearchBox(); // ✅ Call after loading medicines
    
  });

function customerSearchBox() {
  const searchInput1 = document.getElementById("customerSearch");
  const suggestionsBox1 = document.getElementById("customerSuggestions");

  searchInput1.addEventListener("input", () => {
    const value = searchInput1.value.toLowerCase().trim();
    suggestionsBox1.innerHTML = "";

    if (!value) return;

    const matches1 = customers
      .filter(m => m.Phone?.toString().toLowerCase().startsWith(value))
      .slice(0, 5);

    if (value.length === 10 && matches1.length === 0) {
      // No matching customer → Redirect after short delay
      setTimeout(() => {
        const confirmAdd = confirm("Customer not found. Do you want to add them?");
        if (confirmAdd) {

          // Store the phone number in localStorage for the add customer page
          const billRows = Array.from(document.querySelectorAll("#billTable tbody tr")).map(row => {
          const qtyCell = row.cells[3];
          const qtyInput = qtyCell.querySelector("input");
          const quantity = qtyInput ? parseInt(qtyInput.value) : parseInt(qtyCell.textContent);

          return {
            id: row.cells[0].textContent,
            name: row.cells[1].textContent,
            price: parseFloat(row.cells[2].textContent),
            quantity: quantity,
            subtotal: parseFloat(row.cells[4].textContent)
  };
});

localStorage.setItem("currentBill", JSON.stringify(billRows));
const customerSearchInput = document.getElementById("customerSearch");
localStorage.setItem("customerPhone", customerSearchInput.value);

          // Redirect to add customer page
          window.location.href = "addCustomer.html";
        }
      }, 300); // Slight delay for better UX
      return;
    }

    matches1.forEach(med => {
      const li = document.createElement("li");
      li.textContent = `${med.Phone} - ${med.Name}`;
      li.addEventListener("click", () => {
        searchInput1.value = li.textContent;
        suggestionsBox1.innerHTML = "";
      });
      suggestionsBox1.appendChild(li);
    });
  });
}


// Set up dynamic search suggestions and direct billing
function setupSearchBox() {
  const searchInput = document.getElementById("medicineSearch");
  const suggestionsBox = document.getElementById("suggestions");

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase().trim();
    suggestionsBox.innerHTML = "";

    if (!value) return;

    const matches = medicines
      .filter(m => m.MedicineID?.toString().toLowerCase().startsWith(value))
      .slice(0, 5);

    matches.forEach(med => {
      const li = document.createElement("li");
      li.textContent = `${med.MedicineID} - ${med.name}`;
      li.addEventListener("click", () => {
        addToBillingTable(med);
        searchInput.value = "";
        suggestionsBox.innerHTML = "";
      });
      suggestionsBox.appendChild(li);
    });
  });
}

// Add selected medicine to billing table
function addToBillingTable(med) {
  const tbody = document.querySelector("#billTable tbody");
  const quantity = 1;
  const subtotal = med.Price * quantity;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${med.MedicineID}</td>
    <td>${med.name}</td>
    <td>${med.Price}</td>
    <td><input type="number" value="${quantity}" min="1" class="qty-input"></td>
    <td class="subtotal">${subtotal}</td>
    <td><button onclick="this.closest('tr').remove()">Remove</button></td>
  `;

  // Handle quantity changes
  row.querySelector(".qty-input").addEventListener("input", function () {
    const qty = parseInt(this.value);
    const newSubtotal = isNaN(qty) ? 0 : med.Price * qty;
    row.querySelector(".subtotal").textContent = newSubtotal;
  });

  tbody.appendChild(row);
}


  window.addEventListener("DOMContentLoaded", () => {
  const savedBill = JSON.parse(localStorage.getItem("currentBill") || "[]");
  const phone = localStorage.getItem("customerPhone");
  const customerSearchInput1 = document.getElementById("customerSearch");
  customerSearchInput1.value = phone;
  savedBill.forEach(item => {
    const row = document.querySelector("#billTable tbody").insertRow();

    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.price}</td>
      <td><input type="number" value="${item.quantity}" min="1" class="qty-input" /></td>
      <td class="subtotal">${item.price * item.quantity}</td>
      <td><button onclick="this.closest('tr').remove()">Remove</button></td>
    `;

    const qtyInput = row.querySelector(".qty-input");
    const subtotalCell = row.querySelector(".subtotal");

    qtyInput.addEventListener("input", () => {
      const qty = parseInt(qtyInput.value) || 0;
      subtotalCell.textContent = item.price * qty;
    });
  });

  // Optional: clear after restore
  localStorage.removeItem("currentBill");
});
