"use strict";

const ticketBookingForm = document.getElementById("ticketBookingForm");
const formMessage = document.getElementById("formMessage");

ticketBookingForm.addEventListener("submit", event => {
  event.preventDefault();
  formMessage.textContent = "Your details are valid. This demo does not send or save your information.";
  formMessage.classList.add("is-success");
});

ticketBookingForm.addEventListener("reset", () => {
  formMessage.textContent = "";
  formMessage.classList.remove("is-success");
});
