import { requireAuth } from "./signin-signup.js";
import { activateStep } from "./progress.js";
import { fetchEvent } from "./fetchEvent.js";

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  activateStep(4);

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const orderNumber = getQueryParam("orderNumber");

  fetch(`/api/orders/${orderNumber}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch order details.");
      }
      return response.json();
    })
    .then((data) => {
      const { order, seats } = data;
      if (seats && seats.length > 0) {
        displaySummaryTable(seats, order);

        const eventId = seats[0].event_id;
        fetchEvent(eventId);
      } else {
        document.getElementById("summary-container").innerHTML =
          "<p>No seat selection found.</p>";
      }

      if (order.payment_method === "ibon付款") {
        displayIbonInfo(
          order.ibon_number,
          order.payment_status,
          order.payment_message
        );
      }
    })
    .catch((error) => {
      console.error("Error fetching order details:", error);
      document.getElementById("summary-container").innerHTML =
        "<p>Error fetching order details.</p>";
    });

  function displaySummaryTable(seats, order) {
    let totalPrice = Math.floor(order.total_price).toLocaleString() || 0;
    let totalTickets = seats.length;

    const seatRows = seats
      .map(
        (seat) => `
        <tr>
          <td>${seat.section_name}區</td>
          <td>${seat.row_num}排${seat.number}號</td>
          <td>全票</td>
          <td>${seat.price}元</td>
        </tr>
      `
      )
      .join("");

    document.getElementById("summary-container").innerHTML = `
      <h2>訂單資料</h2>
      <p>訂單狀態：<span id="order-status">${order.payment_message}</span></p>
      <p>訂單編號：<span id="order-number">${order.order_number}</span></p>
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
          <td id="ticket-count" style="color:blue">${totalTickets} 張</td>
        </tr>
          <tr>
            <td colspan="3" style="text-align: right;">總金額</td>
            <td id="amount" style="color:red">${totalPrice} 元</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  function displayIbonInfo(ibonNumber, paymentStatus, paymentMessage) {
    const orderDetailsDiv = document.getElementById("order-details");
    orderDetailsDiv.innerHTML = `
      <p>您的ibon繳費序號為: <strong style="color:red">${ibonNumber}</strong></p>
      <p>繳費狀態: ${paymentMessage}</p>
      <p>請於訂單成立1小時內完成付款取票，逾時系統將自動取消本筆訂單</p>
    `;
  }
});
