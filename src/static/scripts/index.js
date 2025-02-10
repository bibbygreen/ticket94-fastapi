import { isTokenExpired, showToast } from "./signin-signup.js";

function setupSlider(images) {
  const slide = document.getElementById("slide");
  const dotsContainer = document.querySelector(".dots");

  images.forEach((url, index) => {
    const carouselImg = createImageElement(url);
    slide.appendChild(carouselImg);

    const dot = createDotElement(index);
    dotsContainer.appendChild(dot);
  });

  initializeSlider();
}

function createImageElement(url) {
  const img = document.createElement("img");
  img.classList.add("attraction-img");
  img.src = url;
  return img;
}

function createDotElement(index) {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  dot.dataset.index = index;
  return dot;
}

function initializeSlider() {
  let counter = 0;
  const items = document.querySelectorAll(".attraction-img");
  const dots = document.querySelectorAll(".dot");
  const timer = 4000;
  let interval = setInterval(showNext, timer);

  function showCurrent() {
    const itemToShow = Math.abs(counter % items.length);
    items.forEach((el, index) => {
      el.classList.remove("show");
      dots[index].classList.remove("active");
    });
    items[itemToShow].classList.add("show");
    dots[itemToShow].classList.add("active");
  }

  function showNext() {
    counter++;
    showCurrent();
  }

  document
    .getElementById("slide")
    .addEventListener("mouseover", () => clearInterval(interval));
  document
    .getElementById("slide")
    .addEventListener(
      "mouseout",
      () => (interval = setInterval(showNext, timer))
    );

  const prevBtn = document.getElementById("btn-left");
  const nextBtn = document.getElementById("btn-right");

  prevBtn.addEventListener("click", () => {
    counter--;
    showCurrent();
  });

  nextBtn.addEventListener("click", showNext);

  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      counter = index;
      showCurrent();
    });
  });

  items[0].classList.add("show");
  dots[0].classList.add("active");
}

// 2. 事件篩選功能模組化
function setupEventFilters() {
  document
    .getElementById("show-all")
    .addEventListener("click", () => filterEvents("all"));
  document
    .getElementById("show-popular")
    .addEventListener("click", () => filterEvents("popular"));
  document
    .getElementById("show-upcoming")
    .addEventListener("click", () => filterEvents("upcoming"));
}

function filterEvents(category) {
  const events = document.querySelectorAll(".event-box");

  events.forEach((event) => {
    if (category === "all" || event.classList.contains(category)) {
      event.classList.remove("inactive");
    } else {
      event.classList.add("inactive");
    }
  });

  // Update tab active class
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));
  document.getElementById(`show-${category}`).classList.add("active");
}

let isFetching = false;
let nextPage = null;

async function fetchEvents(page) {
  const url = encodeURI(`/api/events?page=${page}`);
  isFetching = true;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();

    if (page === 0) {
      // First page: replace existing list
      const eventsContainer = document.querySelector(".events-container"); // 定義 eventsContainer
      eventsContainer.innerHTML = "";
    }

    renderEvents(data.data);
    nextPage = data.nextPage;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  } finally {
    isFetching = false;
  }
}

function renderEvents(events, clearExisting = false) {
  const eventsContainer = document.querySelector(".events-container");
  if (clearExisting) eventsContainer.innerHTML = "";

  events.forEach((event) => {
    const eventBox = document.createElement("div");
    eventBox.classList.add("event-box");
    if (event.category) eventBox.classList.add(event.category);

    eventBox.addEventListener(
      "click",
      () => (window.location.href = `/event/${event.id}`)
    );

    const img = document.createElement("img");
    img.src = event.pic;
    img.alt = event.eventName;

    const date = document.createElement("div");
    date.classList.add("div-event-date");

    const icon = document.createElement("i");
    icon.classList.add("fa", "fa-calendar");
    date.appendChild(icon);
    date.appendChild(document.createTextNode(" " + event.date));

    const title = document.createElement("div");
    title.classList.add("div-event-title");
    title.textContent = event.eventName;

    eventBox.appendChild(img);
    eventBox.appendChild(date);
    eventBox.appendChild(title);
    eventsContainer.appendChild(eventBox);

    // 應用圖片背景顏色
    // if (img.complete) {
    //   applyBackgroundColor(img);
    // } else {
    //   img.addEventListener("load", () => applyBackgroundColor(img));
    // }
  });
}

function applyBackgroundColor(img) {
  const colorThief = new ColorThief();
  const color = colorThief.getColor(img);
  img.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function checkToken() {
  const token = localStorage.getItem("token");

  if (token && isTokenExpired(token)) {
    showToast("您的登入已過期，請重新登入");
    localStorage.removeItem("token");
    setTimeout(() => (window.location.href = "/"), 2000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkToken();
  setupEventFilters();
  fetchEvents(0);

  const tem_images = [
    "https://static.ticketplus.com.tw/event/f8704ca7ddebb0ba12000f5ff4f76a45/picBigActiveMain_1722854812562.jpeg",
    "https://i.ytimg.com/vi/n5Fak2-UOaE/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBy63F8GUkKjknwXR85RXht3zugNA",
    "https://t.kfs.io/upload_images/207222/KKTIX-YYW-1200x630_large.jpg",
    "https://static.tixcraft.com/images/activity/24_mel_7ab87c8f1c05489a43d84bade8461159.jpg",
    "https://www.legacy.com.tw/uploads/image_library/1469005927.jpg",
    "https://t.kfs.io/upload_images/209030/_Ticket_Site__Main_KV_02_1200x630_TAIWAN_large.jpg",
  ];
  setupSlider(tem_images);
});

///////////////////
// import { isTokenExpired, showToast } from "./signin-signup.js";

// function updateSlider(images) {
//   const slide = document.getElementById("slide");
//   const dotsContainer = document.querySelector(".dots");
//   // slide.innerHTML=''; // Clear existing images
//   // dotsContainer.innerHTML=''; // Clear existing dots

//   const preloadPromises = [];

//   images.forEach((url, index) => {
//     const img = new Image();
//     img.src = url;
//     const preloadPromise = new Promise((resolve, reject) => {
//       img.onload = () => {
//         resolve(img);
//       };
//       img.onerror = () => {
//         reject(new Error(`Failed to load image: ${url}`));
//       };
//     });

//     preloadPromises.push(preloadPromise);

//     const carouselImg = document.createElement("img");
//     carouselImg.classList.add("attraction-img");
//     carouselImg.src = url;
//     slide.appendChild(carouselImg);

//     const dot = document.createElement("div");
//     dot.classList.add("dot");
//     dot.dataset.index = index;
//     dotsContainer.appendChild(dot);
//   });

//   Promise.all(preloadPromises)
//     .then(() => {
//       initializeSlider();
//     })
//     .catch((error) => {
//       console.error("Error preloading images:", error);
//       initializeSlider();
//     });
// }

// function initializeSlider() {
//   setTimeout(() => {
//     let counter = 0;
//     const items = document.querySelectorAll(".attraction-img");
//     const itemsCount = items.length;
//     const prevBtn = document.getElementById("btn-left");
//     const nextBtn = document.getElementById("btn-right");
//     const dots = document.querySelectorAll(".dot");
//     const timer = 4000;
//     let interval = setInterval(showNext, timer);

//     const showCurrent = () => {
//       const itemToShow = Math.abs(counter % itemsCount);
//       items.forEach((el, index) => {
//         el.classList.remove("show");
//         dots[index].classList.remove("active");
//       });
//       items[itemToShow].classList.add("show");
//       dots[itemToShow].classList.add("active");
//     };

//     function showNext() {
//       counter++;
//       showCurrent();
//     }
//     function showPrev() {
//       counter--;
//       showCurrent();
//     }

//     function showImage(index) {
//       counter = index;
//       showCurrent();
//     }

//     document
//       .getElementById("slide")
//       .addEventListener("mouseover", () => clearInterval(interval));
//     document
//       .getElementById("slide")
//       .addEventListener(
//         "mouseout",
//         () => (interval = setInterval(showNext, timer))
//       );
//     nextBtn.addEventListener("click", showNext);
//     prevBtn.addEventListener("click", showPrev);

//     dots.forEach((dot) => {
//       dot.addEventListener("click", (e) => {
//         const index = parseInt(e.target.dataset.index);
//         showImage(index);
//       });
//     });

//     items[0].classList.add("show");
//     dots[0].classList.add("active");
//   }, 100);
// }

// const tem_images = [
//   "https://static.ticketplus.com.tw/event/f8704ca7ddebb0ba12000f5ff4f76a45/picBigActiveMain_1722854812562.jpeg",
//   "https://i.ytimg.com/vi/n5Fak2-UOaE/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBy63F8GUkKjknwXR85RXht3zugNA",
//   "https://t.kfs.io/upload_images/207222/KKTIX-YYW-1200x630_large.jpg",
//   "https://static.tixcraft.com/images/activity/24_mel_7ab87c8f1c05489a43d84bade8461159.jpg",
//   "https://www.legacy.com.tw/uploads/image_library/1469005927.jpg",
//   "https://t.kfs.io/upload_images/209030/_Ticket_Site__Main_KV_02_1200x630_TAIWAN_large.jpg",
// ];

// updateSlider(tem_images);

// document.getElementById("show-all").addEventListener("click", function () {
//   let events = document.querySelectorAll(".event-box");
//   events.forEach(function (event) {
//     event.classList.remove("inactive");
//   });

//   // Set active class for tab
//   document.querySelectorAll(".tab").forEach((tab) => {
//     tab.classList.remove("active");
//   });
//   this.classList.add("active");
// });

// document.getElementById("show-popular").addEventListener("click", function () {
//   let events = document.querySelectorAll(".event-box");
//   events.forEach(function (event) {
//     if (event.classList.contains("popular")) {
//       event.classList.remove("inactive");
//     } else {
//       event.classList.add("inactive");
//     }
//   });

//   // Set active class for tab
//   document.querySelectorAll(".tab").forEach((tab) => {
//     tab.classList.remove("active");
//   });
//   this.classList.add("active");
// });

// document.getElementById("show-upcoming").addEventListener("click", function () {
//   let events = document.querySelectorAll(".event-box");
//   events.forEach(function (event) {
//     if (event.classList.contains("upcoming")) {
//       event.classList.remove("inactive");
//     } else {
//       event.classList.add("inactive");
//     }
//   });

//   // Set active class for tab
//   document.querySelectorAll(".tab").forEach((tab) => {
//     tab.classList.remove("active");
//   });
//   this.classList.add("active");
// });

// const eventsContainer = document.querySelector(".events-container");
// let nextPage = null;
// let isFetching = false;

// async function fetchEvents(page) {
//   const url = encodeURI(`/api/events?page=${page}`);
//   isFetching = true;

//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error("Network response was not ok " + response.statusText);
//     }
//     const data = await response.json();

//     if (page === 0) {
//       // First page: replace existing list
//       eventsContainer.innerHTML = "";
//     }

//     renderEvents(data.data);
//     nextPage = data.nextPage;
//   } catch (error) {
//     console.error("There has been a problem with your fetch operation:", error);
//   } finally {
//     isFetching = false;
//   }
// }

// function renderEvents(events) {
//   events.forEach((event) => {
//     const eventBox = document.createElement("div");
//     eventBox.classList.add("event-box");
//     eventBox.addEventListener("click", () => {
//       window.location.href = `/event/${event.id}`;
//     });

//     if (event.category) {
//       eventBox.classList.add(event.category); // Add category class
//     }

//     // Create the image element
//     const img = document.createElement("img");
//     img.src = event.pic;
//     img.alt = event.eventName;

//     // Create the title element
//     const title = document.createElement("div");
//     title.classList.add("div-event-title");
//     title.textContent = event.eventName;

//     // Append image and title to the event box
//     eventBox.appendChild(img);
//     eventBox.appendChild(title);

//     // Append the event box to the container
//     eventsContainer.appendChild(eventBox);
//   });
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const token = localStorage.getItem("token");

//   if (token) {
//     if (isTokenExpired(token)) {
//       showToast("您的登入已過期，請重新登入");
//       localStorage.removeItem("token");
//       setTimeout(() => {
//         window.location.href = "/";
//       }, 2000);
//     }
//   }

//   fetchEvents(0);
// });
