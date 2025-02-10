import {
  checkSigninStatus,
  fetchMemberData,
  showToast,
} from "./signin-signup.js";

let cachedUserData = null;

function togglePasswordVisibility(id) {
  const passwordField = document.getElementById(id);
  const passwordFieldType = passwordField.getAttribute("type");
  if (passwordFieldType === "password") {
    passwordField.setAttribute("type", "text");
  } else {
    passwordField.setAttribute("type", "password");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // checkSigninStatus();

  fetchMemberData()
    .then((user) => {
      document.getElementById("member-name").textContent = user.name;
      document.getElementById("member-email").textContent = user.email;
      document.getElementById("member-phone").value = user.phone;
    })
    .catch((error) => {
      console.error("Failed to fetch user data:", error);
    });

  document
    .getElementById("update-phone-button")
    .addEventListener("click", async () => {
      const phone = document.getElementById("member-phone").value;

      try {
        const response = await fetch("/api/users/me/phone", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ phone }),
        });

        if (response.ok) {
          showToast("手機號碼更新成功");
        } else {
          showToast("更新手機號碼失敗");
        }
      } catch (error) {
        console.error("Error updating phone number:", error);
        showToast("更新手機號碼時發生錯誤");
      }
    });

  document
    .getElementById("update-password-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const currentPassword = document
        .getElementById("current-password")
        .value.trim();
      const newPassword = document.getElementById("new-password").value.trim();

      if (!currentPassword || !newPassword) {
        alert("請填寫所有欄位");
        return;
      }

      try {
        const response = await fetch("/api/users/me/password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (response.ok) {
          showToast("密碼更新成功");
        } else {
          showToast("密碼更新失敗");
        }
      } catch (error) {
        console.error("Error updating password:", error);
        showToast("更新密碼時發生錯誤");
      }
    });
});
