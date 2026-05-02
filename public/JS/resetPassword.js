const form = document.getElementById("resetForm");

// ✅ get token from URL (?token=...)
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPassword = e.target.password.value;

  try {
    await axios.post(
      "https://surfer-leggings-lurch.ngrok-free.dev/user/password/resetpassword",
      {
        token,
        newPassword
      }
    );

    alert("Password reset successful");
    window.location.href = "login.html";
  } catch (error) {
    console.log(error);
  }
});