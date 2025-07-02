const name = localStorage.getItem("loggedInName");
const empid = localStorage.getItem("loggedInEmpId");

if (!name || !empid) {
  window.location.href = "/";
}


document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get("phone");
  if (phone) document.getElementById("phone").value = phone;

  document.getElementById("addCustomerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const phone = document.getElementById("phone").value.trim();
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("name", name);
    formData.append("address", address);

    const response = await fetch("/add-customer", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      alert("Customer added successfully!");
      window.location.href = "/dashboard"; // Redirect to dashboard after adding customer
    } else {
      alert("Error saving customer.");
    }
  });
});
