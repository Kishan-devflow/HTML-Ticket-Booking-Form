"use strict";

const teams = [
  { name: "Chennai Super Kings", short: "CSK", slug: "csk", color: "#f6c443", city: "Chennai", ground: "M. A. Chidambaram Stadium" },
  { name: "Mumbai Indians", short: "MI", slug: "mi", color: "#3d8cff", city: "Mumbai", ground: "Wankhede Stadium" },
  { name: "Royal Challengers Bengaluru", short: "RCB", slug: "rcb", color: "#ed3d51", city: "Bengaluru", ground: "M. Chinnaswamy Stadium" },
  { name: "Kolkata Knight Riders", short: "KKR", slug: "kkr", color: "#b28aff", city: "Kolkata", ground: "Eden Gardens" },
  { name: "Sunrisers Hyderabad", short: "SRH", slug: "srh", color: "#ff9149", city: "Hyderabad", ground: "Rajiv Gandhi International Cricket Stadium" },
  { name: "Rajasthan Royals", short: "RR", slug: "rr", color: "#ff76bb", city: "Jaipur", ground: "Sawai Mansingh Stadium" },
  { name: "Delhi Capitals", short: "DC", slug: "dc", color: "#5797ff", city: "Delhi", ground: "Arun Jaitley Stadium" },
  { name: "Punjab Kings", short: "PBKS", slug: "pbks", color: "#fa5968", city: "New Chandigarh", ground: "Maharaja Yadavindra Singh International Cricket Stadium" },
  { name: "Gujarat Titans", short: "GT", slug: "gt", color: "#73b8c8", city: "Ahmedabad", ground: "Narendra Modi Stadium" },
  { name: "Lucknow Super Giants", short: "LSG", slug: "lsg", color: "#58d2df", city: "Lucknow", ground: "BRSABV Ekana Cricket Stadium" }
];

const matches = [
  { home: "RCB", away: "CSK", venue: "M. Chinnaswamy Stadium", city: "Bengaluru" },
  { home: "MI", away: "KKR", venue: "Wankhede Stadium", city: "Mumbai" },
  { home: "SRH", away: "GT", venue: "Rajiv Gandhi International Cricket Stadium", city: "Hyderabad" },
  { home: "RR", away: "DC", venue: "Sawai Mansingh Stadium", city: "Jaipur" },
  { home: "PBKS", away: "LSG", venue: "Maharaja Yadavindra Singh International Cricket Stadium", city: "New Chandigarh" },
  { home: "CSK", away: "MI", venue: "M. A. Chidambaram Stadium", city: "Chennai" },
  { home: "GT", away: "RCB", venue: "Narendra Modi Stadium", city: "Ahmedabad" },
  { home: "KKR", away: "SRH", venue: "Eden Gardens", city: "Kolkata" }
];

const teamByShort = new Map(teams.map(team => [team.short, team]));
const feeRate = 0.05;
const bookingStorageKey = "ipl-ticket-arena-demo-bookings";
let activeTeamFilter = "";
let pendingBooking = null;
let savedBookings = [];

const matchGrid = document.getElementById("matchGrid");
const teamsGrid = document.getElementById("teamsGrid");
const bookingForm = document.getElementById("bookingForm");
const matchSelect = document.getElementById("matchSelect");
const ticketType = document.getElementById("ticketType");
const quantitySelect = document.getElementById("quantity");
const bookingMessage = document.getElementById("bookingMessage");
const storageMessage = document.getElementById("storageMessage");
const reviewDialog = document.getElementById("reviewDialog");
const reviewSummary = document.getElementById("reviewSummary");
const numberFormat = new Intl.NumberFormat("en-IN");

function formatRupees(amount) {
  return `₹${numberFormat.format(amount)}`;
}

function getTeamLogo(team, extraClass = "") {
  return `
    <span class="team-mark ${extraClass}" style="--team-color:${team.color}">
      <img src="img/${team.slug}.svg" alt="${team.name} logo" loading="lazy">
      <span class="logo-fallback" aria-hidden="true">${team.short}</span>
    </span>
  `;
}

function attachLogoFallbacks(container) {
  container.querySelectorAll(".team-mark img").forEach(image => {
    image.addEventListener("error", () => {
      image.hidden = true;
      image.closest(".team-mark").classList.add("logo-unavailable");
    }, { once: true });
  });
}

function renderTeams() {
  teamsGrid.innerHTML = teams.map(team => `
    <article class="team-card" style="--team-color:${team.color}">
      <div class="team-card-top"><span class="team-card-index">${team.short}</span><span class="team-spark" aria-hidden="true">✦</span></div>
      ${getTeamLogo(team)}
      <h3>${team.name}</h3>
      <p class="team-city">${team.city}</p>
      <button class="team-match-link" type="button" data-team="${team.short}">
        View matches <span aria-hidden="true">↗</span>
      </button>
    </article>
  `).join("");
  attachLogoFallbacks(teamsGrid);
}

function renderMatches() {
  const visibleMatches = matches
    .map((match, index) => ({ ...match, index }))
    .filter(match => !activeTeamFilter || match.home === activeTeamFilter || match.away === activeTeamFilter);

  matchGrid.innerHTML = visibleMatches.map(match => {
    const home = teamByShort.get(match.home);
    const away = teamByShort.get(match.away);
    const matchNumber = String(match.index + 1).padStart(2, "0");

    return `
      <article class="match-card">
        <div class="match-card-head">
          <span class="match-number">DEMO MATCH <b>${matchNumber}</b></span>
          <span class="demo-status"><span class="live-dot"></span> SAMPLE</span>
        </div>
        <div class="match-versus">
          <div class="match-team">
            ${getTeamLogo(home)}
            <h3>${home.name}</h3>
            <span class="match-short">${home.short}</span>
          </div>
          <span class="versus-divider"><span>VS</span></span>
          <div class="match-team">
            ${getTeamLogo(away)}
            <h3>${away.name}</h3>
            <span class="match-short">${away.short}</span>
          </div>
        </div>
        <div class="match-details">
          <div><span class="detail-icon" aria-hidden="true">◷</span><span><strong>Fixture TBA</strong><small>Time TBA</small></span></div>
          <div><span class="detail-icon" aria-hidden="true">⌖</span><span><strong>${match.venue}</strong><small>${match.city}</small></span></div>
        </div>
        <div class="match-card-bottom">
          <span class="match-placeholder">Dates &amp; prices are demo placeholders</span>
          <button class="button button-small" type="button" data-book-match="${match.index}">Book Tickets <span aria-hidden="true">↗</span></button>
        </div>
      </article>
    `;
  }).join("");

  attachLogoFallbacks(matchGrid);
}

function populateMatchSelect() {
  matchSelect.innerHTML = matches.map((match, index) => {
    const home = teamByShort.get(match.home);
    const away = teamByShort.get(match.away);
    return `<option value="${index}">${home.name} vs ${away.name} · Demo matchup</option>`;
  }).join("");
}

function getSelectedMatch() {
  const index = Number(matchSelect.value);
  return Number.isInteger(index) ? matches[index] : undefined;
}

function renderSelectedMatch() {
  const match = getSelectedMatch();
  const preview = document.getElementById("selectedMatchPreview");

  if (!match) {
    preview.textContent = "Choose a matchup to see the demo details.";
    return;
  }

  const home = teamByShort.get(match.home);
  const away = teamByShort.get(match.away);
  preview.innerHTML = `
    <div class="preview-teams">
      <div>${getTeamLogo(home, "team-mark-small")}<span>${home.short}</span></div>
      <span class="preview-vs">VS</span>
      <div>${getTeamLogo(away, "team-mark-small")}<span>${away.short}</span></div>
    </div>
    <div class="preview-venue"><span aria-hidden="true">⌖</span> ${match.venue}, ${match.city}</div>
    <span class="preview-date">Sample matchup · Fixture date and time TBA</span>
  `;
  attachLogoFallbacks(preview);
}

function updatePriceBreakdown() {
  const price = Number(ticketType.value);
  const quantity = Number(quantitySelect.value);
  const subtotal = price * quantity;
  const fee = Math.round(subtotal * feeRate);

  document.getElementById("ticketCountLabel").textContent = `(${quantity})`;
  document.getElementById("ticketSubtotal").textContent = formatRupees(subtotal);
  document.getElementById("serviceFee").textContent = formatRupees(fee);
  document.getElementById("totalPrice").textContent = formatRupees(subtotal + fee);
}

function showMatchFilter(teamShort) {
  activeTeamFilter = teamShort;
  const team = teamByShort.get(teamShort);
  const matchFilter = document.getElementById("matchFilter");
  matchFilter.hidden = false;
  document.getElementById("matchFilterLabel").textContent = `Sample matchups featuring ${team.name}`;

  const firstMatchIndex = matches.findIndex(match => match.home === teamShort || match.away === teamShort);
  if (firstMatchIndex !== -1) {
    matchSelect.value = String(firstMatchIndex);
    renderSelectedMatch();
    updatePriceBreakdown();
  }

  renderMatches();
  document.getElementById("matches").scrollIntoView({ behavior: "smooth" });
}

function goToBooking(matchIndex) {
  if (Number.isInteger(matchIndex) && matches[matchIndex]) {
    matchSelect.value = String(matchIndex);
    renderSelectedMatch();
    updatePriceBreakdown();
  }
  document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

function setBookingMessage(message, type = "") {
  bookingMessage.textContent = message;
  bookingMessage.className = `form-message${type ? ` is-${type}` : ""}`;
}

function addReviewRow(label, value, isTotal = false) {
  const row = document.createElement("div");
  row.className = `review-row${isTotal ? " review-row-total" : ""}`;
  const labelElement = document.createElement(isTotal ? "strong" : "span");
  const valueElement = document.createElement("strong");
  labelElement.textContent = label;
  valueElement.textContent = value;
  row.append(labelElement, valueElement);
  reviewSummary.append(row);
}

function openBookingReview() {
  const match = getSelectedMatch();
  if (!match) {
    setBookingMessage("Please select a demo matchup before continuing.", "error");
    return;
  }

  const home = teamByShort.get(match.home);
  const away = teamByShort.get(match.away);
  const subtotal = Number(ticketType.value) * Number(quantitySelect.value);
  const fee = Math.round(subtotal * feeRate);
  const category = ticketType.options[ticketType.selectedIndex].text.split(" · ")[0];

  pendingBooking = {
    id: `IPL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    name: document.getElementById("customerName").value.trim(),
    email: document.getElementById("customerEmail").value.trim(),
    home: home.name,
    away: away.name,
    homeShort: home.short,
    awayShort: away.short,
    venue: match.venue,
    city: match.city,
    date: "Fixture date and time TBA",
    category,
    quantity: Number(quantitySelect.value),
    subtotal,
    fee,
    total: subtotal + fee,
    createdAt: new Date().toISOString()
  };

  reviewSummary.replaceChildren();
  addReviewRow("Matchup", `${home.name} vs ${away.name}`);
  addReviewRow("Venue · demo", `${match.venue}, ${match.city}`);
  addReviewRow("Schedule", "Fixture date and time TBA");
  addReviewRow("Tickets", `${pendingBooking.quantity} × ${category}`);
  addReviewRow("Ticket subtotal", formatRupees(subtotal));
  addReviewRow("Demo service fee", formatRupees(fee));
  addReviewRow("Estimated total", formatRupees(pendingBooking.total), true);
  addReviewRow("Name", pendingBooking.name);
  addReviewRow("Email", pendingBooking.email);
  reviewDialog.showModal();
  setBookingMessage("");
}

function readSavedBookings() {
  try {
    const stored = localStorage.getItem(bookingStorageKey);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new TypeError("Saved booking data is not a list.");
    }

    return parsed.filter(booking => booking && typeof booking.id === "string" && typeof booking.name === "string");
  } catch (error) {
    console.error("Could not read locally saved demo bookings.", error);
    storageMessage.textContent = "Saved demo bookings could not be read from this browser. Check your browser storage settings.";
    storageMessage.classList.add("is-error");
    return [];
  }
}

function createBookingElement(booking) {
  const card = document.createElement("article");
  card.className = "saved-booking";

  const header = document.createElement("div");
  header.className = "saved-booking-head";
  const id = document.createElement("span");
  id.className = "saved-booking-id";
  id.textContent = `DEMO PREVIEW · ${booking.id}`;
  const removeButton = document.createElement("button");
  removeButton.className = "remove-booking";
  removeButton.type = "button";
  removeButton.dataset.removeBooking = booking.id;
  removeButton.setAttribute("aria-label", `Remove demo booking ${booking.id}`);
  removeButton.textContent = "Remove";
  header.append(id, removeButton);

  const teamsLine = document.createElement("h3");
  teamsLine.textContent = `${booking.home} vs ${booking.away}`;
  const detail = document.createElement("p");
  detail.textContent = `${booking.venue}, ${booking.city} · ${booking.date}`;
  const customer = document.createElement("p");
  customer.className = "saved-booking-customer";
  customer.textContent = `${booking.name} · ${booking.email}`;

  const footer = document.createElement("div");
  footer.className = "saved-booking-footer";
  const tickets = document.createElement("span");
  tickets.textContent = `${booking.quantity} × ${booking.category}`;
  const total = document.createElement("strong");
  total.textContent = `Estimated total ${formatRupees(booking.total)}`;
  footer.append(tickets, total);
  const notice = document.createElement("p");
  notice.className = "saved-booking-notice";
  notice.textContent = "Saved locally only · No seats reserved · No tickets issued";
  card.append(header, teamsLine, detail, customer, footer, notice);
  return card;
}

function renderSavedBookings() {
  const list = document.getElementById("bookingsList");
  const empty = document.getElementById("bookingsEmpty");
  list.replaceChildren(...savedBookings.map(createBookingElement));
  empty.hidden = savedBookings.length > 0;
  list.hidden = savedBookings.length === 0;
}

function savePendingBooking() {
  if (!pendingBooking) {
    setBookingMessage("There is no booking to save. Please review your booking again.", "error");
    reviewDialog.close();
    return;
  }

  try {
    const nextBookings = [pendingBooking, ...savedBookings];
    localStorage.setItem(bookingStorageKey, JSON.stringify(nextBookings));
    savedBookings = nextBookings;
    renderSavedBookings();
    reviewDialog.close();
    bookingForm.reset();
    renderSelectedMatch();
    updatePriceBreakdown();
    setBookingMessage(`Demo booking ${pendingBooking.id} was saved in this browser. No tickets were reserved or issued.`, "success");
    pendingBooking = null;
    document.getElementById("my-bookings").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Could not save the demo booking in browser storage.", error);
    setBookingMessage("Could not save this demo booking in browser storage. Check available storage and try again.", "error");
  }
}

function removeSavedBooking(id) {
  const nextBookings = savedBookings.filter(booking => booking.id !== id);
  try {
    if (nextBookings.length) {
      localStorage.setItem(bookingStorageKey, JSON.stringify(nextBookings));
    } else {
      localStorage.removeItem(bookingStorageKey);
    }
    savedBookings = nextBookings;
    renderSavedBookings();
    storageMessage.classList.remove("is-error");
    storageMessage.textContent = "Demo booking removed from this browser.";
  } catch (error) {
    console.error("Could not remove the saved demo booking from browser storage.", error);
    storageMessage.textContent = "Could not remove this booking from browser storage. Try again.";
    storageMessage.classList.add("is-error");
  }
}

function setActiveNavigation() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".primary-nav a");

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  sections.forEach(section => observer.observe(section));
}

function initializeNavigation() {
  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.getElementById("primaryNav");

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    primaryNav.classList.toggle("is-open", !isOpen);
  });

  primaryNav.addEventListener("click", event => {
    if (!event.target.closest("a")) return;
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      primaryNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    }
  });

  setActiveNavigation();
}

teamsGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-team]");
  if (button) showMatchFilter(button.dataset.team);
});

matchGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-book-match]");
  if (button) goToBooking(Number(button.dataset.bookMatch));
});

document.getElementById("clearMatchFilter").addEventListener("click", () => {
  activeTeamFilter = "";
  document.getElementById("matchFilter").hidden = true;
  renderMatches();
});

matchSelect.addEventListener("change", renderSelectedMatch);
ticketType.addEventListener("change", updatePriceBreakdown);
quantitySelect.addEventListener("change", updatePriceBreakdown);

bookingForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  openBookingReview();
});

document.getElementById("saveBookingButton").addEventListener("click", savePendingBooking);
reviewDialog.querySelectorAll("[data-close-review]").forEach(button => {
  button.addEventListener("click", () => reviewDialog.close());
});
reviewDialog.addEventListener("click", event => {
  if (event.target === reviewDialog) reviewDialog.close();
});
reviewDialog.addEventListener("close", () => {
  pendingBooking = null;
});

document.getElementById("bookingsList").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-booking]");
  if (button) removeSavedBooking(button.dataset.removeBooking);
});

renderTeams();
renderMatches();
populateMatchSelect();
renderSelectedMatch();
updatePriceBreakdown();
savedBookings = readSavedBookings();
renderSavedBookings();
initializeNavigation();
