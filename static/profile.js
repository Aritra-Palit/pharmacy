const userId = localStorage.getItem("loggedInEmpId");
const userName = localStorage.getItem("loggedInName");
const userUsername = localStorage.getItem("loggedInUsername");

// Pre-fill
document.getElementById("empId").value = userId || "";
document.getElementById("name").value = userName || "";
document.getElementById("username").value = userUsername || "";

// Upload
function uploadProfile() {
  const file = document.getElementById("profileInput").files[0];
  if (!file) return alert("Select an image");

  const formData = new FormData();
  formData.append("image", file);
  formData.append("user_id", userId);

  fetch("/upload-profile", {
    method: "POST",
    body: formData
  }).then(res => {
    if (res.ok) alert("Uploaded!");
    else alert("Failed.");
  });
}

// View
function viewProfile() {
  const img = document.getElementById("profilePic");
  img.src = `/profile-picture/${userId}?t=${Date.now()}`;
  img.style.display = "block";
}

// Delete
function deleteProfile() {
  fetch(`/delete-profile/${userId}`, { method: "DELETE" })
    .then(res => {
      if (res.ok) {
        alert("Deleted!");
        document.getElementById("profilePic").style.display = "none";
      }
    });
}

// Save Profile (optional storage logic)
function saveProfile() {
  const updatedName = document.getElementById("name").value;
  const updatedUsername = document.getElementById("username").value;
  const updatedPassword = document.getElementById("password").value;
  const empId = document.getElementById("empId").value;

  fetch("/update-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empId: empId,
      name: updatedName,
      username: updatedUsername,
      password: updatedPassword
    })
  })
  .then(res => {
    if (res.ok) {
      localStorage.setItem("loggedInName", updatedName);
      localStorage.setItem("loggedInUsername", updatedUsername);
      alert("✅ Profile updated successfully.");
      window.location.href = '/my-profile';
    } else {
      alert("❌ Failed to update profile.");
    }
  })
  .catch(err => {
    console.error("Error:", err);
    alert("❌ Error while saving profile.");
  });
}
