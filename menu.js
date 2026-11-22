
import { db, isFirebaseConfigured } from "./firebase.js";
import { collection, getDocs } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// =====================================
// 1. SAMPLE FOOD DATA
// =====================================

const sampleFoods = [
    {
        id: "pizza1",
        name: "Margherita Pizza",
        category: "Pizza",
        price: 299,
        description: "Classic pizza with cheese and fresh tomato.",
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=600",
        available: true
    },
    {
        id: "pizza2",
        name: "Farmhouse Pizza",
        category: "Pizza",
        price: 349,
        description: "Loaded with fresh vegetables and cheese.",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
        available: true
    },
    {
        id: "burger1",
        name: "Cheese Burger",
        category: "Burger",
        price: 199,
        description: "Juicy burger with cheese and fresh vegetables.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
        available: true
    },
    {
        id: "burger2",
        name: "Double Burger",
        category: "Burger",
        price: 249,
        description: "Double patty burger with special sauce.",
        image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=600",
        available: true
    },
    {
        id: "chinese1",
        name: "Veg Noodles",
        category: "Chinese",
        price: 180,
        description: "Delicious noodles with fresh vegetables.",
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600",
        available: true
    },
    {
        id: "chinese2",
        name: "Fried Rice",
        category: "Chinese",
        price: 160,
        description: "Fresh fried rice with delicious spices.",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
        available: true
    },
    {
        id: "dessert1",
        name: "Chocolate Cake",
        category: "Dessert",
        price: 150,
        description: "Rich and delicious chocolate dessert.",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
        available: true
    },
    {
        id: "drink1",
        name: "Fresh Orange Juice",
        category: "Drinks",
        price: 99,
        description: "Refreshing fresh orange juice.",
        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
        available: true
    }
];

// =====================================
// 2. GLOBAL VARIABLES
// =====================================

let foods = [];
let selectedCategory = "All";
let cart = JSON.parse(localStorage.getItem("smartServeCart") || "[]");

// Validate restored cart data.
if (
    !Array.isArray(cart) ||
    !cart.every(item =>
        item &&
        typeof item.id === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 99
    )
) {
    cart = [];
}

// =====================================
// 3. HELPER FUNCTIONS
// =====================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function saveCart() {
    localStorage.setItem(
        "smartServeCart",
        JSON.stringify(cart)
    );
}

// =====================================
// 4. TABLE NUMBER FROM QR URL
// =====================================

const params = new URLSearchParams(window.location.search);

const tableParam = params.get("table");

const tableNumber =
    tableParam && /^[A-Za-z0-9-]{1,10}$/.test(tableParam)
        ? tableParam
        : "01";

document.getElementById("tableNumber").textContent =
    `Table ${tableNumber}`;

// =====================================
// 5. LOAD FOOD FROM FIREBASE
// =====================================

async function loadFoods() {

    const foodGrid = document.getElementById("foodGrid");

    foodGrid.innerHTML =
        '<div class="loading-message">Loading delicious food...</div>';

    if (isFirebaseConfigured) {

        try {
            const snapshot = await getDocs(collection(db, "foods"));

            const firebaseFoods = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            foods = firebaseFoods
                .filter(food =>
                    food.available !== false &&
                    typeof food.name === "string" &&
                    typeof food.category === "string" &&
                    Number.isFinite(food.price) &&
                    food.price >= 0 &&
                    typeof food.description === "string" &&
                    typeof food.image === "string" &&
                    /^https:\/\//i.test(food.image)
                );

            showToast("Firebase menu loaded!");

        } catch (error) {

            console.error("Firebase menu error:", error);

            foods = sampleFoods;

            showToast("Firebase unavailable. Demo menu loaded.");
        }

    } else {

        foods = sampleFoods;

        showToast("Demo menu loaded!");
    }

    renderFoods();
    renderCart();
}

// =====================================
// 6. DISPLAY FOOD CARDS
// =====================================

function renderFoods() {

    const foodGrid = document.getElementById("foodGrid");

    const searchValue =
        document.getElementById("searchInput").value
        .toLowerCase()
        .trim();

    const filteredFoods = foods.filter(food => {

        const matchesCategory =
            selectedCategory === "All" ||
            food.category === selectedCategory;

        const matchesSearch =
            food.name.toLowerCase().includes(searchValue) ||
            food.category.toLowerCase().includes(searchValue);

        return matchesCategory && matchesSearch;
    });

    document.getElementById("foodCount").textContent =
        `${filteredFoods.length} items available`;

    if (filteredFoods.length === 0) {
        foodGrid.innerHTML =
            '<div class="no-food">No food items found 😔</div>';
        return;
    }

    foodGrid.innerHTML = filteredFoods.map(food => `

        <div class="food-card">

            <div class="food-image">

                <img
                    src="${escapeHTML(food.image)}"
                    alt="${escapeHTML(food.name)}"
                    loading="lazy"
                >

                <span class="food-category">
                    ${escapeHTML(food.category)}
                </span>

            </div>

            <div class="food-content">

                <h3>${escapeHTML(food.name)}</h3>

                <p>${escapeHTML(food.description)}</p>

                <div class="food-bottom">

                    <span class="food-price">
                        ₹${food.price.toFixed(2)}
                    </span>

                    <button
                        class="add-btn"
                        data-add="${escapeHTML(food.id)}"
                    >
                        + Add
                    </button>

                </div>

            </div>

        </div>

    `).join("");
}

// =====================================
// 7. CATEGORY FILTER
// =====================================

document.querySelectorAll(".category-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".category-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        renderFoods();
    });

});

// =====================================
// 8. SEARCH FOOD
// =====================================

document.getElementById("searchInput")
    .addEventListener("input", renderFoods);

// =====================================
// 9. ADD FOOD TO CART
// =====================================

document.getElementById("foodGrid")
    .addEventListener("click", event => {

        const button = event.target.closest("[data-add]");

        if (!button) return;

        const foodId = button.dataset.add;

        const food = foods.find(item => item.id === foodId);

        if (!food) return;

        const existingItem = cart.find(item => item.id === foodId);

        if (existingItem) {

            if (existingItem.quantity >= 99) {
                showToast("Maximum quantity reached!");
                return;
            }

            existingItem.quantity++;

        } else {

            cart.push({
                id: food.id,
                quantity: 1
            });
        }

        saveCart();
        renderCart();

        showToast(`${food.name} added to cart!`);

    });

// =====================================
// 10. DISPLAY CART
// =====================================

function renderCart() {

    const cartItems = document.getElementById("cartItems");

    const validCart = cart.filter(item =>
        foods.some(food => food.id === item.id)
    );

    cart = validCart;

    saveCart();

    const count = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    document.getElementById("cartCount").textContent = count;

    if (cart.length === 0) {

        cartItems.innerHTML =
            '<p class="empty-cart">Your cart is empty!</p>';

        updateBill();
        return;
    }

    cartItems.innerHTML = cart.map(item => {

        const food = foods.find(f => f.id === item.id);

        return `

            <div class="cart-item">

                <div>
                    <h4>${escapeHTML(food.name)}</h4>
                    <small>
                        ₹${food.price} × ${item.quantity}
                    </small>
                </div>

                <div class="quantity-controls">

                    <button data-minus="${escapeHTML(item.id)}">−</button>

                    <span>${item.quantity}</span>

                    <button data-plus="${escapeHTML(item.id)}">+</button>

                </div>

            </div>

        `;

    }).join("");

    updateBill();
}

// =====================================
// 11. UPDATE QUANTITY
// =====================================

document.getElementById("cartItems")
    .addEventListener("click", event => {

        const plus = event.target.closest("[data-plus]");
        const minus = event.target.closest("[data-minus]");

        if (!plus && !minus) return;

        const id = plus
            ? plus.dataset.plus
            : minus.dataset.minus;

        const item = cart.find(i => i.id === id);

        if (!item) return;

        if (plus) {

            if (item.quantity < 99) {
                item.quantity++;
            } else {
                showToast("Maximum quantity reached!");
            }

        } else {

            item.quantity--;

            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
        }

        saveCart();
        renderCart();

    });

// =====================================
// 12. CALCULATE BILL
// =====================================

function updateBill() {

    const subtotal = cart.reduce((sum, item) => {

        const food = foods.find(f => f.id === item.id);

        return sum + (food ? food.price * item.quantity : 0);

    }, 0);

    const tax = subtotal * 0.05;

    const total = subtotal + tax;

    document.getElementById("subtotal").textContent =
        `₹${subtotal.toFixed(2)}`;

    document.getElementById("tax").textContent =
        `₹${tax.toFixed(2)}`;

    document.getElementById("total").textContent =
        `₹${total.toFixed(2)}`;
}

// =====================================
// 13. OPEN AND CLOSE CART
// =====================================

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

function openCart() {
    cartDrawer.classList.add("show");
    cartOverlay.classList.add("show");
}

function closeCart() {
    cartDrawer.classList.remove("show");
    cartOverlay.classList.remove("show");
}

document.getElementById("openCart")
    .addEventListener("click", openCart);

document.getElementById("closeCart")
    .addEventListener("click", closeCart);

cartOverlay.addEventListener("click", closeCart);

// =====================================
// 14. CHECKOUT PREVIEW
// =====================================

document.getElementById("checkoutBtn")
    .addEventListener("click", () => {

        if (cart.length === 0) {
            showToast("Please add food to your cart!");
            return;
        }

        showToast("Cart ready! Checkout is coming in Day 3.");

    });

// =====================================
// 15. START APPLICATION
// =====================================

loadFoods();

console.log("SmartServe Customer Menu Loaded!");
