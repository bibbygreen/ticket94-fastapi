import {
  isTokenExpired,
  verifyUserSignInToken,
  showToast,
} from "./signin-signup.js";

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const navbarHeight = document.querySelector(".tabs").offsetHeight;
  const token = localStorage.getItem("token");

  let eventId;

  if (token) {
    if (isTokenExpired(token)) {
      showToast("您的登入已過期，請重新登入");
      localStorage.removeItem("token");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }

  const href = location.href;
  const pattern = /\/event\/(\d+)/;
  const match = href.match(pattern);
  if (match) {
    eventId = match[1];
    fetchEvent(eventId);
  } else {
    console.error("Invalid URL format. Unable to extract event ID.");
  }

  // Function to handle tab click
  const handleTabClick = (event) => {
    tabs.forEach((tab) => tab.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    // Add active class to clicked tab and related content
    const targetTab = event.target;
    targetTab.classList.add("active");

    const contentId = "tab-content-" + targetTab.id.replace("tab-", "");
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
      targetContent.classList.add("active");

      window.scrollTo({
        top: targetContent.offsetTop - 1.5 * navbarHeight,
        behavior: "smooth",
      });
    }
  };

  // Add click event listener to each tab
  tabs.forEach((tab) => tab.addEventListener("click", handleTabClick));

  async function fetchEvent(id) {
    const url = `/api/events/${id}`;
    try {
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      renderEvent(data);
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  }
  function renderEvent(data) {
    const headerContainer = document.querySelector(".header-container");
    const eventTitle = headerContainer.querySelector(".event-title");
    const headerImg = headerContainer.querySelector(".header-img");

    // Check if elements are found
    if (!eventTitle || !headerImg) {
      console.error("Error: header elements not found");
      return;
    }
    eventTitle.textContent = data.eventName;
    headerImg.src = data.pic;
    headerImg.alt = data.eventName;

    const tabContentBuying = document.getElementById("tab-content-buying");
    const tabContentIntroduction = document.getElementById(
      "tab-content-introduction"
    );

    tabContentBuying.innerHTML = `
    <h2>立即購買</h2>
    <table class="buying-details">
      <thead>
        <tr>
          <th>場次名稱</th>
          <th>場次日期</th>
          <th>場次時間</th>
          <th>場次地點</th>
          <th>售票狀態</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${data.eventName}</td>
          <td>${data.date}</td>
          <td>${data.time}</td>
          <td>${data.location}</td>
          <td>${
            data.onSale
              ? '<button class="buy-button">立即購買</button>'
              : "已售完"
          }</td>
        </tr>
      </tbody>
    </table>
  `;

    tabContentIntroduction.innerHTML = `
      <h2>活動介紹</h2>
      <br>
      <p>${data.description}
      <br><br><br><br>
      活動名稱｜${data.eventName}<br><br>
      日期｜${data.date}<br><br>
      入場時間｜${data.time}<br><br>
      地點｜${data.location}<br><br>
      地址｜${data.address}<br><br>
      主辦單位｜${data.organizer}<br><br>
      啟售｜${data.saleTime}<br><br>
      票價｜${data.price}<br><br>
      </p>
    `;
  }

  // Function to highlight the active tab based on scroll position
  const updateActiveTabOnScroll = () => {
    let currentId = "";

    tabContents.forEach((content) => {
      const rect = content.getBoundingClientRect();
      if (
        rect.top <= window.innerHeight / 2 &&
        rect.bottom >= window.innerHeight / 2
      ) {
        currentId = content.id.replace("tab-content-", "tab-");
      }
    });

    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.id === currentId);
    });
  };

  async function handleBuyButtonClick() {
    try {
      const userStatus = await verifyUserSignInToken();
      if (userStatus) {
        console.log("Navigating to area page with eventId:", eventId); ////
        window.location.href = `/area/${eventId}`;
      } else {
        showToast("購票前請先登入");
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking user sign-in status:", error);
    }
  }
  // Add event listener to all buy buttons
  document.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("buy-button")) {
      handleBuyButtonClick();
    }
  });

  // Add scroll event listener to update active tab
  window.addEventListener("scroll", updateActiveTabOnScroll);
});
