let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
let seats = JSON.parse(localStorage.getItem("seats")) || Array(12).fill(null);
let driverInfo = JSON.parse(localStorage.getItem("driverInfo")) || {};
let simulationActive = false;
let busIndex = 0;

/* FARES */
const fares = {
  "Cebu → Danao": { normal: 45, series: 60 },
  "Cebu → Naga": { normal: 30, series: 45 }
};

/* SEAT ASSIGNMENT */
function assignSeat(name) {
  const free = seats.map((s, i) => s === null ? i : null).filter(i => i !== null);
  const chosen = free[Math.floor(Math.random() * free.length)];
  seats[chosen] = name;
  localStorage.setItem("seats", JSON.stringify(seats));
  return chosen + 1;
}

function renderSeats() {
  const grid = document.getElementById("seatGrid");
  if (!grid) return;
  grid.innerHTML = "";
  seats.forEach((s, i) => {
    grid.innerHTML += `<div class="seat ${s ? "taken" : "free"}">Seat ${i+1}</div>`;
  });
}

/* PASSENGER */
bookingForm?.addEventListener("submit", e => {
  e.preventDefault();

  const seat = assignSeat(pName.value);
  const otp = Math.floor(1000 + Math.random() * 9000);

  const booking = {
    name: pName.value,
    route: pRoute.value,
    type: pBusType.value,
    fare: fares[pRoute.value][pBusType.value],
    otp,
    status: "Pending"
  };

  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  bookingForm.classList.add("hidden");
  confirmation.classList.remove("hidden");

  confirmText.innerHTML = `
    Name: <b>${booking.name}</b><br>
    Route: <b>${booking.route}</b><br>
    Fare: <b>₱${booking.fare}</b><br>
    Seat: <b>${seat}</b><br>
    OTP: <b>${otp}</b>
  `;

  renderSeats();

  if (driverInfo.name) {
    driverInfoDiv.innerHTML = `Driver: ${driverInfo.name}<br>Bus: ${driverInfo.bus}`;
  }
});

/* ADMIN */
function loadAdmin() {
  bookingTable.innerHTML = "";
  bookings.forEach(b => {
    bookingTable.innerHTML += `
      <tr>
        <td>${b.name}</td>
        <td>${b.route}</td>
        <td>${b.type}</td>
        <td>₱${b.fare}</td>
        <td>${b.status}</td>
      </tr>`;
  });
}

function startSimulation() {
  simulationActive = true;
  modeStatus.innerText = "Simulation Active";
}

function resetSystem() {
  localStorage.clear();
  location.reload();
}

/* DRIVER */
function loadDriver() {
  passengerList.innerHTML = "";
  bookings.forEach((b, i) => {
    passengerList.innerHTML += `
      <li>
        ${b.name} — ${b.status}
        <button onclick="verify(${i})">Verify</button>
        <button onclick="markBoarded(${i})">Boarded</button>
      </li>`;
  });
}

function verify(i) {
  bookings[i].status = "Verified";
  localStorage.setItem("bookings", JSON.stringify(bookings));
  loadDriver();
}

function markBoarded(i) {
  bookings[i].status = "Boarded";
  localStorage.setItem("bookings", JSON.stringify(bookings));
  loadDriver();
}

function saveDriverInfo() {
  driverInfo = { name: dName.value, bus: dBus.value };
  localStorage.setItem("driverInfo", JSON.stringify(driverInfo));
}

/* BUS TRACKING (SIMULATION) */
const routePath = [
  [10.3157, 123.8854],
  [10.3200, 123.8900],
  [10.3250, 123.8950],
  [10.3300, 123.9000]
];

if (document.getElementById("map")) {
  const map = L.map("map").setView(routePath[0], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  const marker = L.marker(routePath[0]).addTo(map);

  setInterval(() => {
    if (!simulationActive) return;
    busIndex = (busIndex + 1) % routePath.length;
    marker.setLatLng(routePath[busIndex]);
    calculateETA();
  }, 3000);
}

function calculateETA() {
  const eta = (routePath.length - busIndex - 1) * 3;
  const etaText = document.getElementById("etaText");
  if (etaText) etaText.innerText = `Estimated Arrival: ${eta} minutes`;
}