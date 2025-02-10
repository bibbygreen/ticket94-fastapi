let cachedUserData = null;

export function requireAuth(redirectTo = "/") {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

export function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // JWT exp 是以秒為單位的 UNIX
    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();

    return currentTime > expiryTime;
  } catch (error) {
    console.error("解析 Token 發生錯誤：", error);
    return true; // 如果無法解析 Token，視為過期
  }
}

export async function verifyUserSignInToken() {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const response = await fetch("/api/users/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        console.error("Server response:", await response.text());
        window.location.href = "/";
        throw new Error("Token verification failed");
      }
      return await response.json();
    } catch (error) {
      console.error("Error during token verification:", error);
      window.location.href = "/";
      throw error;
    }
  } else {
    showToast("購票前請先登入");
    setTimeout(() => {
      window.location.href = "/signin";
    }, 2000);
  }
}

export async function checkSigninStatus() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    if (cachedUserData) {
      return cachedUserData;
    }

    const response = await fetch("/api/users/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to verify token");
    }

    const userData = await response.json();
    cachedUserData = userData;
  } catch (error) {
    console.error("User not logged in or token invalid:", error);
    window.location.href = "/";
  }
}

export async function fetchMemberData() {
  if (cachedUserData) {
    return cachedUserData;
  }

  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token available");

  const response = await fetch("/api/users/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch member data");

  const data = await response.json();
  cachedUserData = data;
  return data;
}

function saveCurrentPageUrl() {
  const currentUrl = window.location.href;
  localStorage.setItem("returnUrl", currentUrl);
}

document.addEventListener("DOMContentLoaded", function () {
  const headlineElement = document.querySelector(".headline");
  const signinLink = document.getElementById("signin-link");
  const logoutLink = document.getElementById("logout-link");

  headlineElement.addEventListener("click", () => {
    window.location.href = "/";
  });

  const token = localStorage.getItem("token");

  if (token) {
    //登入
    signinLink.style.display = "none";
    logoutLink.style.display = "block";

    const profileDropdown = document.getElementById("profile-dropdown");
    const dropdownContent = document.querySelector(".dropdown-content");

    profileDropdown.style.display = "block";

    // 點擊會員中心顯示或隱藏下拉選單
    profileDropdown.addEventListener("click", function (event) {
      event.stopPropagation(); // 防止點擊事件冒泡
      if (dropdownContent.style.display === "block") {
        dropdownContent.style.display = "none";
      } else {
        dropdownContent.style.display = "block";
      }
    });

    // 點擊其他地方隱藏下拉選單
    document.addEventListener("click", function () {
      dropdownContent.style.display = "none";
    });

    // 防止點擊下拉選單內容時隱藏選單
    dropdownContent.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    logoutLink.addEventListener("click", function () {
      localStorage.removeItem("token");
      showToast("您已登出");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    });
  } else {
    // 未登入
    signinLink.style.display = "block";
    // profileDropdown.style.display = "none";
    logoutLink.style.display = "none";

    signinLink.addEventListener("click", function () {
      window.location.href = "/signin";
    });
  }
});

const signInForm = document.getElementById("signInForm");
if (signInForm) {
  signInForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;

    try {
      const response = await fetch("/api/users/auth", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        showToast("登入成功！");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        showToast("登入失敗：" + data.message);
      }
    } catch (error) {
      console.error("發生錯誤：", error);
      showToast("登入時發生錯誤");
    }
  });
}

const signUpForm = document.getElementById("signUpForm");
if (signUpForm) {
  signUpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const phone = document.getElementById("signup-phone").value;
    const password = document.getElementById("signup-password").value;

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("註冊成功！您現在可以登入");
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      } else {
        showToast("註冊失敗：" + data.message);
      }
    } catch (error) {
      console.error("發生錯誤：", error);
      showToast("註冊時發生錯誤");
    }
  });
}

export function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 2000);
}
