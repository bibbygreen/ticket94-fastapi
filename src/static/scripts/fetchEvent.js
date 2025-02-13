export async function fetchEvent(id) {
  const url = `/api/events/${id}`;
  try {
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    renderEvent(data);
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
}

export function renderEvent(event) {
  const eventProfile = document.querySelector(".event-profile");

  const eventImage = eventProfile.querySelector(".event-image img");
  eventImage.src = event.pic || "default-image.jpg";

  const eventDetails = eventProfile.querySelector(".event-details");
  eventDetails.querySelector("h2").textContent = event.eventName;
  eventDetails.querySelector(
    "p:nth-of-type(1)"
  ).textContent = `Date: ${event.date}`;
  eventDetails.querySelector(
    "p:nth-of-type(2)"
  ).textContent = `Time: ${event.time}`;
  eventDetails.querySelector(
    "p:nth-of-type(3)"
  ).textContent = `Location: ${event.location}`;
}
