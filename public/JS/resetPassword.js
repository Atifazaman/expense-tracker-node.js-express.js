const form = document.getElementById("resetForm");

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPassword = e.target.password.value;

  try {
    await axios.post(
      "/user/password/resetpassword",
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
