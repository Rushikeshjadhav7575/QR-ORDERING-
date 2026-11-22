
import { isFirebaseConfigured } from "./firebase.js";

// MOBILE SIDEBAR
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// UPDATE DATE AND TIME
function updateDate() {
    const now = new Date();

    const formatted = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    document.getElementById("currentDate").textContent = formatted;
}

updateDate();

// NAVIGATION
const navLinks = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("pageTitle");

navLinks.forEach(link => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        navLinks.forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");

        const page = link.dataset.page;

        pageTitle.textContent =
            page === "Overview" ? "Dashboard Overview" : page;

        sidebar.classList.remove("open");

        if (page !== "Overview") {
            alert(
                page + " module will be developed in our next steps!"
            );
        }
    });
});

// VIEW ORDERS
document.getElementById("viewOrders").addEventListener("click", () => {
    document.querySelector('[data-page="Orders"]').click();
});

// VIEW TABLES
document.getElementById("viewTables").addEventListener("click", () => {
    document.querySelector('[data-page="Tables"]').click();
});

// NOTIFICATION
document.getElementById("notificationBtn").addEventListener("click", () => {
    alert("You have 5 sample notifications!");
});

// SUPPORT
document.getElementById("helpBtn").addEventListener("click", () => {
    alert("Welcome to SmartServe Support!");
});

// FIREBASE STATUS
const connectionStatus =
    document.getElementById("connectionStatus");

if (isFirebaseConfigured) {
    connectionStatus.innerHTML =
        "<span></span> Firebase configured";

    connectionStatus.classList.add("connected");
} else {
    connectionStatus.innerHTML =
        "<span></span> Demo Mode";
}

console.log("SmartServe Dashboard Loaded Successfully!");
