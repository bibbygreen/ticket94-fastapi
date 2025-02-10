document.addEventListener("DOMContentLoaded", async () => {
  const orderHistoryContainer = document.getElementById(
    "order-history-container"
  );

  try {
    const response = await fetch("/api/history/orders", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      const orders = await response.json();

      if (orders.length > 0) {
        orders.forEach((order) => {
          const orderDiv = document.createElement("div");
          orderDiv.classList.add("order-item");

          // 使用 Intl.DateTimeFormat 轉換 created_time
          const formattedCreatedTime = new Intl.DateTimeFormat("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Taipei", // 指定轉換的時區
            hour12: false, // 24 小時制
          }).format(new Date(order.created_time));

          // 處理付款狀態和 ibon 繳費序號
          let paymentInfo = order.payment_message;
          if (order.ibon_number) {
            paymentInfo += `<br>ibon繳費序號: ${order.ibon_number}`;
          }

          const orderInfoTable = `
          <table>
            <thead>
              <tr>
                <th>訂單編號</th>
                <th>訂購時間</th>
                <th>活動名稱</th>
                <th>付款狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.order_number}</td>
                <td>${formattedCreatedTime}</td>
                <td>${order.eventName}</td>
                <td>${paymentInfo}<br>
                <button class="toggle-details">展開明細</button></td>
              </tr>
            </tbody>
          </table>
      `;

          // 第二個表格：活動詳情、票區、位置、票種/金額
          const seatsTable = `
          <div class="details" style="display: none;">
            <table>
              <thead>
                <tr>
                  <th>日期/時間/地點</th>
                  <th>票區</th>
                  <th>位置</th>
                  <th>票種/金額</th>
                </tr>
              </thead>
              <tbody>
                ${order.seats
                  .map(
                    (seat) => `
                  <tr>
                    <td>
                      ${order.date}<br>
                      ${order.time}<br>
                      ${order.location}
                    </td>
                    <td>${seat.section_name}</td>
                    <td>${seat.row_num}排${seat.number}號</td>
                    <td>全票 / ${seat.price}元</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          <hr>
      `;

          orderDiv.innerHTML = orderInfoTable + seatsTable;
          orderHistoryContainer.appendChild(orderDiv);

          // 展開明細
          const toggleButton = orderDiv.querySelector(".toggle-details");
          const detailsDiv = orderDiv.querySelector(".details");

          toggleButton.addEventListener("click", () => {
            if (detailsDiv.style.display === "none") {
              detailsDiv.style.display = "block";
              toggleButton.textContent = "收起明細";
            } else {
              detailsDiv.style.display = "none";
              toggleButton.textContent = "展開明細";
            }
          });
        });
      } else {
        orderHistoryContainer.innerHTML = "<p>目前沒有訂單紀錄。</p>";
      }
    } else {
      orderHistoryContainer.innerHTML = "<p>無法取得訂單紀錄，請稍後再試。</p>";
    }
  } catch (error) {
    console.error("Error fetching order history:", error);
    orderHistoryContainer.innerHTML = "<p>發生錯誤，請稍後再試。</p>";
  }
});
