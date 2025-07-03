const name = localStorage.getItem("loggedInName");
const empid = localStorage.getItem("loggedInEmpId");
const empType = localStorage.getItem("loggedInEmpType");

if (!name || !empid) {
  window.location.href = "/";
}

if (empType !== "Employee") {
  alert("❌ You do not have permission to access this page.");
  window.location.href = "/";
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
  window.location.href = "/";
}

// Parse Excel-like dates
function parseDate(val) {
  if (!val) return null;

  // Excel date serial number
  if (typeof val === "number") {
    return new Date(Date.UTC(1899, 11, 30) + val * 86400000);
  }

  // Format: DD-MM-YYYY
  if (typeof val === "string" && val.includes("-")) {
    const [day, month, year] = val.split("-");
    return new Date(`${year}-${month}-${day}`);
  }

  // Fallback
  const parsed = new Date(val);
  return isNaN(parsed) ? null : parsed;
}

// Dashboard cards
let medicines = [];
let customers = [];

async function loadDashboardData() {
  try {
    const [medRes, custRes] = await Promise.all([
      fetch("/medicines"),
      fetch("/customers")
    ]);
    medicines = await medRes.json();
    customers = await custRes.json();

    const now = new Date();

    document.getElementById("stockCount").textContent =
      `Medicines in Stock: ${medicines.length}`;

    const recent = medicines.filter(med => {
      const addedDate = parseDate(med.dateAdded);
      if (!addedDate) return false;
      const daysDiff = Math.round((now - addedDate) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    
    document.getElementById("newCount").textContent =
      `New Medicines Added: ${recent.length}`;

    const pending = medicines.filter(med => {
  const updateDate = parseDate(med.lastUpdated);
  if (!updateDate) return false;

  const daysSinceUpdate = Math.floor((now - updateDate)/ (1000 * 60 * 60 * 24));

  return daysSinceUpdate > 30;
});

    document.getElementById("pendingCount").textContent =
      `Pending Updates: ${pending.length}`;

    customerSearchBox();   // You already updated this
    setupSearchBox();      // If this is for medicine search, it stays

  } catch (err) {
    console.error("❌ Error loading dashboard data:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadDashboardData);


async function customerSearchBox() {
  const searchInput1 = document.getElementById("customerSearch");
  const suggestionsBox1 = document.getElementById("customerSuggestions");

  // Fetch customer data from server
  let customers = [];
  try {
    const res = await fetch("/customers");
    customers = await res.json();
  } catch (err) {
    console.error("Failed to load customers:", err);
    return;
  }

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
          localStorage.setItem("customerPhone", searchInput1.value);
          window.location.href = "/add-customer";  // updated route
        }
      }, 300);
      return;
    }

    matches1.forEach(med => {
      const li = document.createElement("li");
      li.textContent = `${med.Phone} - ${med.Name} - ${med.Address}`;
      li.addEventListener("click", () => {
        searchInput1.value = `${med.Phone} - ${med.Name} - ${med.Address}`;
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
      .filter(m => m.MedicineID?.toString().toLowerCase().startsWith(value) && m.Quantity > 0)
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
    <td><button onclick="this.closest('tr').remove(); updatePrintButtonLabel();">Remove</button></td>
  `;
  // Handle quantity changes
  row.querySelector(".qty-input").addEventListener("input", function () {
    const qty = parseInt(this.value);
    const newSubtotal = isNaN(qty) ? 0 : med.Price * qty;
    row.querySelector(".subtotal").textContent = newSubtotal;
    updatePrintButtonLabel();
  });

  tbody.appendChild(row);
  updatePrintButtonLabel();
}


  window.addEventListener("DOMContentLoaded", () => {
  const savedBill = JSON.parse(localStorage.getItem("currentBill") || "[]");
  const phone = localStorage.getItem("customerPhone");
  const customerSearchInput1 = document.getElementById("customerSearch");
  customerSearchInput1.value = phone;
  if (empid) {
  const img = document.getElementById("profilePic");
  const fallback = document.getElementById("fallbackAvatar");
  const name = localStorage.getItem("loggedInName") || "User";

  img.onerror = () => {
    // Try JPG as fallback
    img.onerror = () => {
      // If JPG also fails, show initials
      img.style.display = "none";
      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 3);
      fallback.textContent = initials;
      fallback.style.display = "inline-block";
    };
    img.src = `/static/profile_pics/${empid}.jpg`;
  };

  img.onload = () => {
    img.style.display = "block";
    fallback.style.display = "none";
  };

  // First attempt with PNG
  img.src = `/static/profile_pics/${empid}.png`;
}




  savedBill.forEach(item => {
    const row = document.querySelector("#billTable tbody").insertRow();

    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.price}</td>
      <td><input type="number" value="${item.quantity}" min="1" class="qty-input" /></td>
      <td class="subtotal">${item.price * item.quantity}</td>
      <td><button onclick="this.closest('tr').remove(); updatePrintButtonLabel();">Remove</button></td>
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


function printBill() {
  // Get customer info from search box
  const raw = document.getElementById("customerSearch")?.value || "";
  const [phone, name, address] = raw.split(" - ");

  // Set customer info
  document.getElementById("printPhone").textContent = phone || "N/A";
  document.getElementById("printName").textContent = name || "N/A";
  document.getElementById("printAddress").textContent = address || "N/A"; 

  // Get bill table rows
  const rows = document.querySelectorAll("#billTable tbody tr");
  const tbody = document.getElementById("printTableBody");
  tbody.innerHTML = "";
  let total = 0;

  rows.forEach(row => {
    const id = row.cells[0].textContent;
    const name = row.cells[1].textContent;
    const price = row.cells[2].textContent.replace("₹", "").trim();
    const qtyEl = row.cells[3].querySelector("input");
    const quantity = qtyEl ? qtyEl.value : row.cells[3].textContent;

    let subtotal = 0;
    if (qtyEl) {
      subtotal = parseFloat(price) * parseInt(quantity || "0");
    } else {
      subtotal = parseFloat(row.cells[4].textContent.replace("₹", "").trim() || "0");
    }

    total += subtotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${id}</td>
      <td>${name}</td>
      <td>₹${price}</td>
      <td>${quantity}</td>
      <td>₹${subtotal}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("printTotal").textContent = total.toFixed(2);

  // Open print view
  const printContents = document.getElementById("printSection").innerHTML;
  const win = window.open('', '', 'width=800,height=600');
  win.document.write(`
    <html>
      <head><title>PharmaSys Invoice</title></head>
      <body>${printContents}</body>
    </html>
  `);

  // Deduct stock
  const soldItems = Array.from(rows).map(row => ({
  id: row.cells[0].textContent,
  quantity: parseInt(row.cells[3].querySelector("input")?.value || "0")
  }));

  
  // Save bill
  const products = Array.from(rows).map(row => ({
  product: row.cells[1].textContent,
  price: parseFloat(row.cells[2].textContent.replace("₹", "").trim()) *
         parseInt(row.cells[3].querySelector("input")?.value || "0")
  }));


  const payload = {
  userId: localStorage.getItem("loggedInEmpId"),
  userName: localStorage.getItem("loggedInName"),
  customerPhone: phone,
  customerName: name,
  customerAddress: address,
  total_amount: total,
  products: products,
  items: soldItems    // ⬅️ Add soldItems to the same payload
};


  fetch("/process-bill", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
.then(res => {
  if (res.ok) {
      win.document.close();
      win.print();
      localStorage.removeItem("customerPhone");
      window.location.href = '/dashboard';
  } else {
    alert("❌ Failed to process bill.");
  }
})
.catch(err => {
  console.error("❌ Error calling /process-bill:", err);
  alert("❌ Internal error.");
});

  
}

function updatePrintButtonLabel() {
  let total = 0;
  const rows = document.querySelectorAll("#billTable tbody tr");
  rows.forEach(row => {
    const price = parseFloat(row.cells[2].textContent) || 0;
    const qtyInput = row.cells[3].querySelector("input");
    const quantity = parseInt(qtyInput?.value || "0");
    total += price * quantity;
  });

  const button = document.getElementById("printButton");
  button.textContent = total > 0 ? `Print Bill (₹${total.toFixed(2)})` : "Print Bill";
}
