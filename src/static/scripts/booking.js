import { fetchMemberData, requireAuth } from "./signin-signup.js";
import { activateStep } from "./progress.js";
import { fetchEvent } from "./fetchEvent.js";

function getEventIdFromUrl() {
  const href = window.location.href;
  const pattern = /\/booking\/(\d+)/;
  const match = href.match(pattern);
  if (match) {
    return match[1];
  } else {
    console.error("Invalid URL format. Unable to extract event ID.");
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  activateStep(3);

  let seatIds = [];

  const eventId = getEventIdFromUrl();
  if (eventId) {
    fetchEvent(eventId);
  } else {
    console.error("Event ID not found in URL");
  }

  fetch(`/api/seats/locked?eventId=${eventId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("無法取得鎖定的座位資訊。");
      }
      return response.json();
    })
    .then((data) => {
      const seatData = data.seats;

      if (seatData && seatData.length > 0) {
        // const eventId = seatData[0].event_id;
        // fetchEvent(eventId);

        seatIds = seatData.map((seat) => seat.id);
        displaySummaryTable(seatData);

        const holdExpiresAtString = seatData[0].hold_expires_At;
        const holdExpiresAt = new Date(Date.parse(holdExpiresAtString));
        const now = new Date();

        let timeLeft = Math.floor((holdExpiresAt - now) / 1000);
        if (timeLeft > 0) {
          startCountdown(timeLeft);
        } else {
          alert("您的訂單已逾期");
        }
      } else {
        document.getElementById("summary-container").innerHTML =
          "<p>尚未選擇任何座位。</p>";
      }
    })
    .catch((error) => {
      console.error("取得座位時發生錯誤：", error);
      document.getElementById("summary-container").innerHTML =
        "<p>取得座位資訊時發生錯誤。</p>";
    });

  fetchMemberData()
    .then((user) => {
      document.getElementById("member-name").textContent = user.name;
      document.getElementById("member-email").textContent = user.email;
      document.getElementById("member-phone").textContent = user.phone;
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });

  const cancelButton = document.querySelector(".cancel-button");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      // 釋放所有座位
      fetch("/api/seats/release", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to release seats.");
          }
          return response.text();
        })
        .then(() => {
          window.location.href = "/";
        })
        .catch((error) => {
          console.error("Error releasing seats:", error);
          alert("Error releasing seats. Please try again.");
        });
    });
  }

  // 動態加載 TPDirect SDK 並在加載完成後設置
  const script = document.createElement("script");
  script.src = "https://js.tappaysdk.com/sdk/tpdirect/v5.14.0";
  script.async = true;
  script.onload = setupTPDirectSDK;
  document.head.appendChild(script);

  function startCountdown(timeLeft) {
    const timerElement = document.getElementById("timer");

    const interval = setInterval(() => {
      if (timeLeft < 0) {
        clearInterval(interval);
        timerElement.textContent = "00:00";
        alert("逾時繳費，訂單已取消");
        window.location.href = "/";
        return;
      }

      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      if (!isNaN(minutes) && !isNaN(seconds)) {
        timerElement.textContent = `${minutes}:${
          seconds < 10 ? "0" : ""
        }${seconds}`;
      }

      timeLeft--;
    }, 1000);
  }

  function displaySummaryTable(seats) {
    let totalPrice = 0;
    let totalTicket = seats.length;
    const seatRows = seats
      .map((seat) => {
        totalPrice += seat.price;
        return `
        <tr>
          <td>${seat.section_name}區</td>
          <td>${seat.row_num}排${seat.number}號</td>
          <td>全票</td>
          <td>${seat.price}元</td>
        </tr>
      `;
      })
      .join("");

    document.getElementById("summary-container").innerHTML = `
      <h2>訂單資料</h2>
      <table>
        <thead>
          <tr>
            <th>票區</th>
            <th>位置</th>
            <th>票種</th>
            <th>金額</th>
          </tr>
        </thead>
        <tbody>
          ${seatRows}
          <tr>
            <td colspan="3" style="text-align: right;">訂購張數</td>
            <td style="color:blue">${totalTicket} 張</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;">總金額</td>
            <td  id="amount" style="color:red">${totalPrice.toLocaleString()} 元</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  function setupTPDirectSDK() {
    TPDirect.setupSDK(
      151901,
      "app_vixuBsk4bJ7W6FZe0OBoujnI0ZnDoDMSaY0qPzrWxvcgV1DJply2PeV8BlZV",
      "sandbox"
    );

    let fields = {
      number: {
        element: "#card-number",
        placeholder: "**** **** **** ****",
      },
      expirationDate: {
        element: document.getElementById("card-expiration-date"),
        placeholder: "MM / YY",
      },
      ccv: {
        element: "#card-ccv",
        placeholder: "ccv",
      },
    };

    TPDirect.card.setup({
      fields: fields,
      styles: {
        input: {
          color: "gray",
        },
        ".valid": {
          color: "green",
        },
        ".invalid": {
          color: "red",
        },
        "@media screen and (max-width: 400px)": {
          input: {
            color: "orange",
          },
        },
      },
      isMaskCreditCardNumber: true,
      maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11,
      },
    });

    TPDirect.card.onUpdate(function (update) {
      const btnConfirmPayment = document.getElementById("confirm-button");
      if (update.canGetPrime) {
        btnConfirmPayment.removeAttribute("disabled");
      } else {
        btnConfirmPayment.setAttribute("disabled", true);
      }
    });

    const btnConfirmPayment = document.getElementById("confirm-button");
    btnConfirmPayment.addEventListener("click", onSubmitOrder);
  }

  async function onSubmitOrder(event) {
    event.preventDefault();

    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    if (!tappayStatus.canGetPrime) {
      alert(
        "Cannot get prime. Please check the card information and try again."
      );
      return;
    }

    TPDirect.card.getPrime((result) => {
      console.log("result.status: ", result.status);
      if (result.status !== 0) {
        alert("取得 Prime 錯誤: " + result.msg);
        console.error("Failed to get prime:", result);
        return;
      }
      // alert("取得 Prime 成功");
      const prime = result.card.prime;

      const contactName = document.getElementById("member-name").textContent;
      const contactEmail = document.getElementById("member-email").textContent;
      const contactPhone = document.getElementById("member-phone").textContent;

      if (!contactName || !contactEmail || !contactPhone) {
        alert("Missing cardholder information");
        return;
      }

      const amountText = document.getElementById("amount").textContent;
      const amount = parseInt(amountText.replace(/[^\d]/g, ""), 10);

      if (isNaN(amount)) {
        alert("Invalid amount value");
        return;
      }

      const orderData = {
        prime: prime,
        amount: amount,
        cardholder: {
          name: contactName,
          email: contactEmail,
          phone_number: contactPhone,
        },
        seatIds: seatIds,
      };

      fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      })
        .then((response) => {
          console.log("Response status:", response.status);
          if (!response.ok) {
            return response.json().then((error) => {
              console.error("Error response from server:", error);
              throw new Error(`Booking failed: ${error.message}`);
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("Response data:", data);
          const orderNumber = data.data.number;
          if (data.data.payment.status === 1) {
            window.location.href = `/finish.html?orderNumber=${orderNumber}`;
          } else {
            alert("交易失敗，敬請重新訂購");
            window.location.href = "/";
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert(`Booking failed. Please try again. Error: ${error.message}`);
          window.location.href = "/";
        });
    });
  }
});
