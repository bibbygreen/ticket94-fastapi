import { checkSigninStatus } from "./signin-signup.js";
import { activateStep } from "./progress.js";
import { fetchEvent } from "./fetchEvent.js";

let eventId;
let selectedAreaName = "";
let selectedAreaPrice = 0;
let selectedSeatsData = [];

const ticketOptionsContainer = document.getElementById("ticket-options");

async function fetchEventSections(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}/sections`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch event sections");
    }
    const data = await response.json();
    const sections = data.sections.sections;

    if (!Array.isArray(sections)) {
      throw new Error("Sections data is not an array");
    }

    const areaOptions = document.querySelector(".area-options");
    areaOptions.innerHTML = "<h2>票區一覽</h2>";

    sections.forEach((section) => {
      const areaDiv = document.createElement("div");
      areaDiv.classList.add("area");
      areaDiv.setAttribute("data-area", section.section_name);

      const areaNameSpan = document.createElement("span");
      areaNameSpan.classList.add("area-name");
      areaNameSpan.textContent = `${section.section_name}區`;

      const areaPriceSpan = document.createElement("span");
      areaPriceSpan.classList.add("area-price");
      areaPriceSpan.textContent = `NT ${section.price.toLocaleString()}元`;

      areaDiv.appendChild(areaNameSpan);
      areaDiv.appendChild(areaPriceSpan);
      areaOptions.appendChild(areaDiv);
    });
  } catch (error) {
    console.error("Error fetching event sections:", error);
  }
}

function displayTicketOptions(areaId, price) {
  ticketOptionsContainer.innerHTML = `
    <h2>選擇座位</h2>
    <h2>所選擇區域 ${areaId}區</h2>
    <label for="ticket-quantity">購買張數:</label>
    <select id="ticket-quantity">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
    </select><br>
    <div class="selection-options">
      <label><input type="radio" name="seat-selection" value="manual"> 自行選位</label>
      <label><input type="radio" name="seat-selection" value="auto"> 電腦配位</label>
    </div>
    <button class="confirm-button">確認</button>
  `;
  ticketOptionsContainer.classList.add("active");

  document
    .querySelector(".confirm-button")
    .addEventListener("click", async () => {
      const quantity = document.getElementById("ticket-quantity").value;
      const selectedOption = document.querySelector(
        'input[name="seat-selection"]:checked'
      );

      if (!selectedOption) {
        alert("請選擇座位選擇方式。");
        return;
      }

      const optionValue = selectedOption.value;

      if (optionValue === "manual") {
        showSeatDiagramModal(selectedAreaName);
      } else if (optionValue === "auto") {
        autoSelectSeats(eventId, selectedAreaName, quantity);
      }
    }); //document.querySelector(".confirm-button")
} //function displayTicketOptions

async function fetchAvailableSeats(eventId, area, quantity) {
  console.log("Area:", area);
  console.log("Quantity:", quantity);
  const token = localStorage.getItem("token");
  const response = await fetch(
    `/api/events/${eventId}/seats?area=${area}&quantity=${quantity}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch available seats.");
  const data = await response.json();
  return data;
}

// 根據活動 ID 取得座位
// async function fetchSeatsForArea(areaName) {
//   try {
//     const response = await fetch(`/api/seats/${eventId}?area=${areaName}`);
//     if (!response.ok) {
//       throw new Error("Failed to fetch seats for area.");
//     }
//     const seats = await response.json();
//     console.log("Fetched seats data for area:", seats);
//     return seats;
//   } catch (error) {
//     console.error("Error fetching seats for area:", error);
//     return [];
//   }
// } 單一活動

async function fetchSeatsForArea(eventId, areaName) {
  if (!eventId || !areaName) {
    throw new Error("eventId or areaName is missing.");
  }

  const response = await fetch(`/api/seats/${eventId}?area=${areaName}`);
  if (!response.ok) {
    throw new Error("Failed to fetch seats.");
  }
  return await response.json(); // 返回座位數據，包含 seat_id, row_num, seat_num, status
}

async function autoSelectSeats(eventId, area, quantity) {
  const data = await fetchAvailableSeats(eventId, area, quantity);

  if (!data.available || data.seats.length === 0) {
    alert("No seats available");
    return;
  }

  const seatDetails = data.seats.map((seat) => ({
    id: seat.id,
    row: seat.row,
    number: seat.number,
    price: seat.price,
    area: data.area,
  }));

  const seatIds = seatDetails.map((seat) => seat.id);

  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/seats/hold", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ seatIds, eventId }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Seats held successfully:", data);
      window.location.href = `/checkout/${eventId}`;
    } else {
      console.error("Error holding seats:", data.message);
    }
  } catch (error) {
    console.error("Error holding seats:", error);
  }
}

async function showSeatDiagramModal(areaName) {
  if (!eventId || !areaName) {
    console.error("Event ID or area name is missing.", eventId, areaName);
    return;
  }

  const modal = document.createElement("div");
  modal.id = "seat-diagram-modal";

  const modalContent = document.createElement("div");
  modalContent.classList.add("seat-diagram-content");

  const seatDiagram = await createSeatDiagram(eventId, areaName);

  modalContent.innerHTML = `
  <div style="text-align: center; margin-bottom: 10px">
    <h2>↑↑↑座位面向↑↑↑</h2>
    <h2>所選擇區域 ${areaName}區</h2>
    <button class="close-modal">關閉</button>
    <button class="clear-selection-button">重設選位</button>
    <button class="seat-confirm-button">確認選位</button>
  </div>
  <div id="seat-container">${seatDiagram}</div>
  
`;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // 還原之前選擇的座位狀態
  selectedSeatsData.forEach((seat) => {
    const seatElement = document.querySelector(
      `[data-row="${seat.row}"][data-seat="${seat.number}"]`
    );
    if (seatElement) {
      seatElement.classList.add("selected");
      seatElement.style.backgroundColor = "blue";
      seatElement.style.color = "white";
    }
  });

  // 清除選擇
  modalContent
    .querySelector(".clear-selection-button")
    .addEventListener("click", () => {
      clearSelectedSeats();
    });

  // 確認選位
  modalContent
    .querySelector(".seat-confirm-button")
    .addEventListener("click", async () => {
      if (selectedSeatsData.length === 0) {
        alert("請選擇至少一個座位。");
        return;
      }

      console.log("Selected seats to send:", selectedSeatsData);

      try {
        const token = localStorage.getItem("token");

        const seatIds = selectedSeatsData.map((seat) => seat.id);

        const response = await fetch("/api/seats/hold", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ seatIds, eventId }),
        });

        if (response.ok) {
          modal.style.display = "none";
          window.location.href = `/checkout/${eventId}`;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to hold seats.");
        }
      } catch (error) {
        console.error("Error holding seats:", error);
        alert("Error holding seats: " + error.message);
      }
    });

  document.querySelectorAll(".seat").forEach((seat) => {
    seat.addEventListener("click", () => {
      handleSeatSelection(seat);
    });

    const closeButton = modalContent.querySelector(".close-modal");
    closeButton.addEventListener("click", () => {
      resetSelectedSeats();
      modal.style.display = "none";
    });
  });
}

function clearSelectedSeats() {
  // 清除所有已選中的座位樣式
  document.querySelectorAll(".seat.selected").forEach((seat) => {
    seat.classList.remove("selected");
    seat.style.backgroundColor = "";
    seat.style.color = "";
  });

  // 清空 selectedSeatsData 數組
  selectedSeatsData = [];
  console.log("All selected seats have been cleared.");
}

// 重置已選擇的座位狀態
function resetSelectedSeats() {
  document.querySelectorAll(".seat.selected").forEach((seat) => {
    seat.classList.remove("selected");
    seat.style.backgroundColor = "";
    seat.style.color = "";
  });
}

function handleSeatSelection(seatElement) {
  if (
    seatElement.classList.contains("reserved") ||
    seatElement.classList.contains("temp-held")
  ) {
    return; // 直接返回，禁止選擇
  }

  const maxSeats = Number(document.getElementById("ticket-quantity").value);
  const selectedSeats = document.querySelectorAll(".seat.selected");

  if (
    selectedSeats.length >= maxSeats &&
    !seatElement.classList.contains("selected")
  ) {
    alert("已選擇最大數量的座位");
    return;
  }

  seatElement.classList.toggle("selected");
  if (seatElement.classList.contains("selected")) {
    seatElement.style.backgroundColor = "blue";
    seatElement.style.color = "white";

    // 添加選擇的座位到 selectedSeatsData
    const seatId = seatElement.getAttribute("seatId");
    selectedSeatsData.push({
      id: seatId,
      row: seatElement.dataset.row,
      number: seatElement.dataset.seat,
    });
  } else {
    seatElement.style.backgroundColor = "";
    seatElement.style.color = "";

    // 從 selectedSeatsData 中移除取消選擇的座位
    const seatId = seatElement.getAttribute("seatId");
    selectedSeatsData = selectedSeatsData.filter((seat) => seat.id !== seatId);
  }
  // console.log("Updated selectedSeatsData:", selectedSeatsData);
} //function handleSeatSelection

async function createSeatDiagram(eventId, areaName) {
  const seats = await fetchSeatsForArea(eventId, areaName);
  const rows = 25;
  const seatsPerRow = 20;
  let diagram = "";

  for (let row = 1; row <= rows; row++) {
    diagram += `<div class="row">${row}排<br>`; // Start of a row
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      const seatData = seats.find(
        (s) =>
          s.row_num === row && s.seat_num === seat.toString().padStart(2, "0")
      );

      const statusClass = seatData
        ? seatData.status === "V"
          ? "available"
          : seatData.status === "T"
          ? "temp-held"
          : "reserved"
        : "unknown";

      // 使用從資料庫查詢到的 seatId
      diagram += `
        <div class="seat ${statusClass}" data-row="${row}" data-seat="${seat}" seatId="${
        seatData?.id || ""
      }">
          ${seat}
        </div>
      `;
    }
    diagram += `</div><br>`; // End of a row and add a line break
  }
  return diagram;
}

document.addEventListener("DOMContentLoaded", async () => {
  activateStep(1);
  checkSigninStatus();

  eventId = getEventIdFromUrl();
  await fetchEvent(eventId);
  await fetchEventSections(eventId);

  const areaOptions = document.querySelector(".area-options");
  areaOptions.addEventListener("click", (event) => {
    const area = event.target.closest(".area");
    if (!area) return; // 如果點擊的不是區域，則返回

    selectedAreaName = area.getAttribute("data-area");
    selectedAreaPrice = parseInt(
      area.querySelector(".area-price").textContent.replace(/\D/g, ""),
      10
    );
    displayTicketOptions(selectedAreaName, selectedAreaPrice);

    document
      .querySelectorAll(".area")
      .forEach((a) => a.classList.remove("selected"));
    area.classList.add("selected");
  });
});

function getEventIdFromUrl() {
  const href = location.href;
  const pattern = /\/area\/(\d+)/;
  const match = href.match(pattern);
  if (match) {
    return match[1];
  } else {
    console.error("Invalid URL format. Unable to extract area ID.");
    return null;
  }
}

// async function createSeatDiagram(areaName) {
//   const seats = await fetchSeatsForArea(areaName);
//   const rows = 25;
//   const seatsPerRow = 20;
//   let diagram = "";

//   for (let row = 1; row <= rows; row++) {
//     diagram += `<div class="row">${row}排<br>`; // Start of a row
//     for (let seat = 1; seat <= seatsPerRow; seat++) {
//       const seatId = (row - 1) * seatsPerRow + seat; // 根據 row 和 seat 計算唯一座位 ID
//       const areaSeatId = calculateAreaSeatId(areaName, seatId);
//       const seatData = seats.find((s) => s.id === areaSeatId);

//       const statusClass = seatData
//         ? seatData.status === "V"
//           ? "available"
//           : seatData.status === "T"
//           ? "temp-held"
//           : "reserved"
//         : "unknown";

//       diagram += `
//         <div class="seat ${statusClass}" data-row="${row}" data-seat="${seat}" seatId="${areaSeatId}">
//           ${seat}
//         </div>
//       `;
//     }
//     diagram += `</div><br>`; // End of a row and add a line break
//   }
//   return diagram;
// } 單一活動

// 計算區域座位 ID
// function calculateAreaSeatId(areaName, seatId) {
//   switch (areaName) {
//     case "A":
//       return seatId;
//     case "B":
//       return 500 + seatId;
//     case "C":
//       return 1000 + seatId;
//     case "D":
//       return 1500 + seatId;
//     default:
//       return seatId;
//   }
// }
