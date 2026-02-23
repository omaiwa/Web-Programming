(() => {

  const products = [
    { id: "p1", title: "Горшок пластиковый", price: 399, img: "ASSETS/images/pot1.jpg" },
    { id: "p2", title: "Горшок особый", price: 8999, img: "ASSETS/images/pot2.jpg" },
    { id: "p3", title: "Горшок керамический", price: 2599, img: "ASSETS/images/pot3.png" },
    { id: "p4", title: "Горшок керамический", price: 1899, img: "ASSETS/images/pot4.jpg" },
    { id: "p5", title: "Земля", price: 999, img: "ASSETS/images/earth.jpeg" },
    { id: "p6", title: "Удобрение", price: 399, img: "ASSETS/images/nutrients.png" }
  ];

  const productsContainer = document.getElementById("products");
  const cartToggleBtn = document.getElementById("cart-toggle");
  const cartPanel = document.getElementById("cart");
  const cartItemsList = document.getElementById("cart-items");
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  const summaryTotal = document.getElementById("summary-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  const modal = document.getElementById("modal");
  const modalClose = document.getElementById("modal-close");
  const modalCancel = document.getElementById("modal-cancel");
  const orderForm = document.getElementById("order-form");
  const orderMessage = document.getElementById("order-message");


  const LS_KEY = "shop_cart_v1";
  let cart = {}; // product: id, title, price, qty, img 

  function formatPrice(n) {
    return n.toLocaleString("ru-RU") + " ₽";
  }

  function saveCart() {
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
  }

  function loadCart() {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      cart = JSON.parse(raw) || {};
    } catch (e) {
      console.error("Ошибка парсинга корзины", e);
      cart = {};
    }
  }

  function getCartCount() {
    return Object.values(cart).reduce((s, it) => s + it.qty, 0);
  }

  function getCartTotal() {
    return Object.values(cart).reduce((s, it) => s + it.qty * it.price, 0);
  }

  function renderProducts() {
    productsContainer.innerHTML = "";
    products.forEach(p => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.setAttribute("role", "listitem");
      card.innerHTML = `
        <img src="${p.img}" alt="${p.title} ">
        <div class="product-info">
          <div class="product-title">${p.title}</div>
          <div class="product-row">
            <div class="product-price">${formatPrice(p.price)}</div>
            <button class="btn add-to-cart" data-id="${p.id}">Добавить в корзину</button>
          </div>
        </div>
      `;
      productsContainer.appendChild(card);
    });
  }

  function renderCart() {
    cartItemsList.innerHTML = "";
    const items = Object.values(cart);
    if (items.length === 0) {
      cartItemsList.innerHTML = `<li class="cart-empty">Корзина пуста</li>`;
    } else {
      items.forEach(item => {
        const li = document.createElement("li");
        li.className = "cart-item";
        li.dataset.id = item.id;
        li.innerHTML = `
          <img src="${item.img}" alt="${item.title}">
          <div style="flex:1">
            <div style="font-weight:600">${item.title}</div>
            <div class="muted">${formatPrice(item.price)}</div>
            <div class="qty-control">
              <button class="btn qty-decr" aria-label="Уменьшить">−</button>
              <input type="number" class="qty-input" min="1" value="${item.qty}" />
              <button class="btn qty-incr" aria-label="Увеличить">+</button>
              <button class="btn delete-item" aria-label="Удалить">Удалить</button>
            </div>
          </div>
          <div style="margin-left:8px; text-align:right;">
            <div>${formatPrice(item.price * item.qty)}</div>
          </div>
        `;
        cartItemsList.appendChild(li);
      });
    }

    cartCountEl.textContent = getCartCount();
    const total = getCartTotal();
    cartTotalEl.textContent = formatPrice(total);
    summaryTotal.textContent = formatPrice(total);
    saveCart();
  }

  function addToCart(productId, quantity = 1) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    if (!cart[productId]) {
      cart[productId] = { id: p.id, title: p.title, price: p.price, qty: quantity, img: p.img };
    } else {
      cart[productId].qty += quantity;
    }
    renderCart();
  }

  function removeFromCart(productId) {
    delete cart[productId];
    renderCart();
  }

  function updateQty(productId, qty) {
    if (!cart[productId]) return;
    cart[productId].qty = Math.max(1, Math.floor(qty) || 1);
    renderCart();
  }

  function attachEvents() {
    productsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-to-cart");
      if (!btn) return;
      const id = btn.dataset.id;
      addToCart(id, 1);
      cartToggleBtn.focus();
    });

    cartToggleBtn.addEventListener("click", () => {
      const isOpen = !cartPanel.hasAttribute("hidden");
      if (isOpen) {
        cartPanel.setAttribute("hidden", "");
        cartToggleBtn.setAttribute("aria-expanded", "false");
      } else {
        cartPanel.removeAttribute("hidden");
        cartToggleBtn.setAttribute("aria-expanded", "true");
      }
    });

    cartItemsList.addEventListener("click", (e) => {
      const li = e.target.closest(".cart-item");
      if (!li) return;
      const id = li.dataset.id;
      if (e.target.classList.contains("delete-item")) {
        removeFromCart(id);
      } else if (e.target.classList.contains("qty-incr")) {
        updateQty(id, cart[id].qty + 1);
      } else if (e.target.classList.contains("qty-decr")) {
        updateQty(id, cart[id].qty - 1);
      }
    });

    cartItemsList.addEventListener("change", (e) => {
      if (e.target.classList.contains("qty-input")) {
        const li = e.target.closest(".cart-item");
        const id = li.dataset.id;
        const val = parseInt(e.target.value, 10);
        updateQty(id, val);
      }
    });

    checkoutBtn.addEventListener("click", () => {
      openModal();
    });

    modalClose.addEventListener("click", closeModal);
    modalCancel.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) closeModal();
    });

    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!orderForm.reportValidity()) return;

      orderMessage.hidden = false;
      orderForm.style.display = "none";

      cart = {};
      renderCart();
      saveCart();

      setTimeout(() => {
        orderMessage.hidden = true;
        orderForm.reset();
        orderForm.style.display = "";
        closeModal();
      }, 1800);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!modal.hasAttribute("aria-hidden") && modal.getAttribute("aria-hidden") === "false") {
          closeModal();
        }
      }
    });
  }

  function openModal() {
    // пустяа корзина
    if (getCartCount() === 0) {
      alert("В корзине нет товаров.");
      return;
    }
    modal.setAttribute("aria-hidden", "false");
    modal.style.display = "flex";
    setTimeout(() => document.getElementById("firstName").focus(), 50);
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
  }

  function init() {
    loadCart();
    renderProducts();
    renderCart();
    attachEvents();
  }

  init();
})();
