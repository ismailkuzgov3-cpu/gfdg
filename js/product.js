/* ============================================
   📦 СТРАНИЦА ТОВАРА
   ============================================ */

let currentProduct = null;

/* --- Получить id товара из URL --- */
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}

/* --- Избранное --- */
function favKey() {
  const u = currentUser();
  return 'cc_fav_' + (u ? u.username : 'guest');
}
function getFavorites() {
  return JSON.parse(localStorage.getItem(favKey()) || '[]');
}
function isFavorite(id) {
  return getFavorites().includes(id);
}
function toggleFavorite(id, e) {
  if (e) e.stopPropagation();
  const user = currentUser();
  if (!user) {
    if (confirm('Войдите, чтобы добавлять в избранное. Перейти на страницу входа?')) {
      location.href = 'login.html';
    }
    return;
  }
  let favs = getFavorites();
  if (favs.includes(id)) favs = favs.filter(x => x !== id);
  else favs.push(id);
  localStorage.setItem(favKey(), JSON.stringify(favs));
  renderProductPage();
  showToast(isFavorite(id) ? '❤️ Добавлено в избранное' : '💔 Удалено из избранного');
}

/* --- Toast --- */
function showToast(text) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = text;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 1800);
}

/* --- NAV --- */
function renderNav() {
  const nav = document.getElementById('navLinks');
  const mobileBar = document.getElementById('mobileBar');
  const user = currentUser();
  const cart = JSON.parse(localStorage.getItem('cc_cart_' + (user?.username || 'guest')) || '[]');
  const count = cart.reduce((s,i) => s + i.qty, 0);

  if (user) {
    nav.innerHTML = `
      <span class="user-name">👤 ${user.name}</span>
      ${user.role === 'admin' ? '<a href="admin.html" class="admin-link">Админ</a>' : ''}
      <a href="index.html">Каталог</a>
      <a href="cart.html" class="cart-btn">🛒 Корзина <span class="badge">${count}</span></a>
    `;
    if (mobileBar) {
      mobileBar.innerHTML = `
        <a href="index.html">🏠<span>Главная</span></a>
        <a href="cart.html">🛒<span>Корзина</span>${count ? `<b class="mob-badge">${count}</b>` : ''}</a>
        ${user.role === 'admin' ? '<a href="admin.html">⚙️<span>Админ</span></a>' : ''}
        <a onclick="openProfileMenu()" style="cursor:pointer">👤<span>Профиль</span></a>
      `;
    }
  } else {
    nav.innerHTML = `
      <a href="index.html">Каталог</a>
      <a href="cart.html" class="cart-btn">🛒 Корзина <span class="badge">${count}</span></a>
      <a href="login.html">Войти</a>
    `;
    if (mobileBar) {
      mobileBar.innerHTML = `
        <a href="index.html">🏠<span>Главная</span></a>
        <a href="cart.html">🛒<span>Корзина</span>${count ? `<b class="mob-badge">${count}</b>` : ''}</a>
        <a href="login.html">👤<span>Войти</span></a>
      `;
    }
  }
}

/* --- Рендер страницы товара --- */
function renderProductPage() {
  const id = getProductId();
  const product = getProducts().find(p => p.id === id);
  const wrap = document.getElementById('productPage');

  if (!product) {
    wrap.innerHTML = `
      <div class="empty" style="padding:80px 20px;">
        <div style="font-size:60px;margin-bottom:16px;">🔍</div>
        <p>Товар не найден</p>
        <a href="index.html">← Вернуться в каталог</a>
      </div>
    `;
    return;
  }

  currentProduct = product;

  const discount = (product.oldPrice && product.oldPrice > product.price)
    ? Math.round((product.oldPrice - product.price) / product.oldPrice * 100)
    : 0;

  const fav = isFavorite(product.id);

  wrap.innerHTML = `
    <div class="product-layout">

      <!-- ФОТО -->
      <div class="product-image-block">
        <div class="product-image-wrap">
          <img src="${product.img}" alt="${product.name}"
               onerror="this.src='https://via.placeholder.com/600x500/0d6efd/ffffff?text=Товар'">
          <button class="product-fav ${fav ? 'active' : ''}" onclick="toggleFavorite(${product.id}, event)">
            ${fav ? '❤️' : '🤍'}
          </button>
          ${discount ? `<div class="product-sale">−${discount}%</div>` : ''}
        </div>
      </div>

      <!-- ИНФО -->
      <div class="product-info-block">
        <div class="product-cat">${product.category}</div>
        <h1 class="product-name">${product.name}</h1>

        ${product.desc ? `<p class="product-desc">${product.desc}</p>` : ''}

        <div class="product-price-block">
          <div class="product-price-row">
            <span class="product-price-new">${product.price.toLocaleString('ru')} ₽</span>
            ${product.oldPrice ? `<span class="product-price-old">${product.oldPrice.toLocaleString('ru')} ₽</span>` : ''}
            ${discount ? `<span class="product-price-save">Выгода ${discount}%</span>` : ''}
          </div>
        </div>

        <div class="product-actions">
          <button class="product-cart-btn" onclick="addToCart(${product.id})">
            🛒 Добавить в корзину
          </button>
          <button class="product-buy-btn" onclick="addToCart(${product.id}); location.href='cart.html';">
            ⚡ Купить сейчас
          </button>
        </div>

        <div class="product-features">
          <div class="feature-item">
            <div class="feature-icon">🚚</div>
            <div>
              <div class="feature-title">Доставка по России</div>
              <div class="feature-sub">Уточняется при оформлении</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <div>
              <div class="feature-title">Гарантия качества</div>
              <div class="feature-sub">От производителя</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎁</div>
            <div>
              <div class="feature-title">Скидка 5% онлайн</div>
              <div class="feature-sub">При заказе через сайт</div>
            </div>
          </div>
        </div>

        <div class="product-full-desc">
          <h3>Описание</h3>
          <p>${product.desc || 'Описание товара уточняйте у менеджера.'}</p>
          <p>Категория: <b>${product.category}</b></p>
          <p>Артикул: <b>CC-${String(product.id).padStart(4, '0')}</b></p>
        </div>
      </div>
    </div>
  `;

  // Похожие товары
  renderSimilar(product);
}

/* --- Похожие товары --- */
function renderSimilar(product) {
  const similar = getProducts()
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const section = document.getElementById('similarSection');
  const grid = document.getElementById('similarGrid');

  if (!similar.length) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  grid.innerHTML = similar.map(p => `
    <div class="card" onclick="location.href='product.html?id=${p.id}'" style="cursor:pointer;">
      <div class="card-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/0d6efd/ffffff?text=Товар'">
        ${p.oldPrice && p.oldPrice > p.price
          ? `<div class="sale-badge">−${Math.round((p.oldPrice - p.price) / p.oldPrice * 100)}%</div>`
          : ''}
      </div>
      <div class="card-body">
        <div class="card-cat">${p.category}</div>
        <div class="card-title">${p.name}</div>
        <div class="card-price">
          ${p.price.toLocaleString('ru')} ₽
          ${p.oldPrice ? `<small>${p.oldPrice.toLocaleString('ru')} ₽</small>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

/* --- Добавить в корзину --- */
function addToCart(id) {
  const user = currentUser();
  if (!user) {
    if (confirm('Чтобы добавить в корзину, войдите. Перейти на страницу входа?')) {
      location.href = 'login.html';
    }
    return;
  }
  const key = 'cc_cart_' + user.username;
  let cart = JSON.parse(localStorage.getItem(key) || '[]');
  const item = cart.find(i => i.id === id);
  const prod = getProducts().find(p => p.id === id);
  if (item) item.qty++;
  else cart.push({ id, name: prod.name, price: prod.price, img: prod.img, qty:1 });
  localStorage.setItem(key, JSON.stringify(cart));
  renderNav();
  showToast('✅ Добавлено в корзину');
}

/* --- Запуск --- */
renderNav();
renderProductPage();