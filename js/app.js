let currentCategory = 'Все';
let searchQuery = '';

/* ============================================
   🔍 УМНЫЙ ПОИСК
   ============================================ */
function normalize(str) {
  return (str || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

function smartMatch(product, query) {
  if (!query || !query.trim()) return true;
  const words = normalize(query).split(' ').filter(Boolean);
  const haystack = normalize(product.name + ' ' + (product.desc || '') + ' ' + product.category);
  return words.every(w => haystack.includes(w));
}

/* ============================================
   ❤️ ИЗБРАННОЕ
   ============================================ */
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
  renderProducts();
  if (typeof updateFavCount === 'function') updateFavCount();
  showToast(isFavorite(id) ? '❤️ Добавлено в избранное' : '💔 Удалено из избранного');
}

/* ============================================
   ⚖️ СРАВНЕНИЕ
   ============================================ */
function compareKey() {
  const u = currentUser();
  return 'cc_compare_' + (u ? u.username : 'guest');
}
function getCompare() {
  return JSON.parse(localStorage.getItem(compareKey()) || '[]');
}
function isComparing(id) {
  return getCompare().includes(id);
}
function toggleCompare(id, e) {
  if (e) e.stopPropagation();
  let list = getCompare();
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    showToast('Убрано из сравнения');
  } else {
    if (list.length >= 4) {
      showToast('Максимум 4 товара для сравнения');
      return;
    }
    list.push(id);
    showToast('⚖️ Добавлено в сравнение');
  }
  localStorage.setItem(compareKey(), JSON.stringify(list));
  renderProducts();
  updateCompareFab();
}

function updateCompareFab() {
  const fab = document.getElementById('compareFab');
  const count = document.getElementById('compareCount');
  if (!fab) return;
  const list = getCompare();
  if (list.length > 0) {
    fab.style.display = 'flex';
    count.innerText = list.length;
  } else {
    fab.style.display = 'none';
  }
}

function openCompare() {
  const ids = getCompare();
  if (!ids.length) return;
  const products = getProducts().filter(p => ids.includes(p.id));

  const rows = [
    { label: 'Фото', render: p => `<img src="${p.img}" onerror="this.src='https://via.placeholder.com/100'">` },
    { label: 'Название', render: p => `<b>${p.name}</b>` },
    { label: 'Категория', render: p => p.category },
    { label: 'Цена', render: p => `<span style="color:var(--primary);font-weight:700;">${p.price.toLocaleString('ru')} ₽</span>` },
    { label: 'Старая цена', render: p => p.oldPrice ? `<s>${p.oldPrice.toLocaleString('ru')} ₽</s>` : '—' },
    { label: 'Описание', render: p => p.desc || '—' },
    { label: '', render: p => `<button class="btn-compare-cart" onclick="addToCart(${p.id}); closeCompare();">🛒 В корзину</button>` },
    { label: '', render: p => `<button class="btn-compare-remove" onclick="removeFromCompare(${p.id})">🗑 Убрать</button>` }
  ];

  const html = `
    <div class="compare-scroll">
      <table class="compare-table">
        <tbody>
          ${rows.map(row => `
            <tr>
              <td class="compare-label">${row.label}</td>
              ${products.map(p => `<td>${row.render(p)}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById('compareTable').innerHTML = html;
  document.getElementById('compareModal').classList.add('active');
}

function closeCompare() {
  document.getElementById('compareModal').classList.remove('active');
}

function removeFromCompare(id) {
  let list = getCompare().filter(x => x !== id);
  localStorage.setItem(compareKey(), JSON.stringify(list));
  updateCompareFab();
  renderProducts();
  if (list.length) openCompare();
  else closeCompare();
}

/* ============================================
   ⚙️ ФИЛЬТРЫ
   ============================================ */
function applyFilters() {
  renderProducts();
}

function resetFilters() {
  document.getElementById('sortSelect').value = '';
  document.getElementById('onlyDiscount').checked = false;
  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  renderProducts();
}

/* ============================================
   NAV / КАТЕГОРИИ
   ============================================ */
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
      <a href="cart.html" class="cart-btn">🛒 Корзина <span class="badge">${count}</span></a>
    `;
    if (mobileBar) {
      mobileBar.innerHTML = `
        <a href="index.html" class="active">🏠<span>Главная</span></a>
        <a href="cart.html">🛒<span>Корзина</span>${count ? `<b class="mob-badge">${count}</b>` : ''}</a>
        ${user.role === 'admin' ? '<a href="admin.html">⚙️<span>Админ</span></a>' : ''}
        <a onclick="openProfileMenu()" style="cursor:pointer">👤<span>Профиль</span></a>
      `;
    }
  } else {
    nav.innerHTML = `
      <a href="cart.html" class="cart-btn">🛒 Корзина <span class="badge">${count}</span></a>
      <a href="login.html">Войти</a>
    `;
    if (mobileBar) {
      mobileBar.innerHTML = `
        <a href="index.html" class="active">🏠<span>Главная</span></a>
        <a href="cart.html">🛒<span>Корзина</span>${count ? `<b class="mob-badge">${count}</b>` : ''}</a>
        <a href="login.html">👤<span>Войти</span></a>
      `;
    }
  }
}

function renderCategories() {
  const cats = ['Все', ...new Set(getProducts().map(p => p.category))];
  document.getElementById('categories').innerHTML = cats.map(c =>
    `<div class="cat-chip ${c === currentCategory ? 'active' : ''}" onclick="setCategory('${c}')">${c}</div>`
  ).join('');
}

function setCategory(c) {
  currentCategory = c;
  renderCategories();
  renderProducts();
}

function doSearch() {
  searchQuery = document.getElementById('searchInput').value;
  renderProducts();
}

let searchTimer;
document.getElementById('searchInput')?.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(doSearch, 200);
});
document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') { clearTimeout(searchTimer); doSearch(); }
});

/* ============================================
   🎨 РЕНДЕР ТОВАРОВ (карточки кликабельны)
   ============================================ */
function renderProducts() {
  let list = getProducts();

  if (currentCategory !== 'Все') {
    list = list.filter(p => p.category === currentCategory);
  }

  if (searchQuery && searchQuery.trim()) {
    list = list.filter(p => smartMatch(p, searchQuery));
  }

  if (document.getElementById('onlyDiscount')?.checked) {
    list = list.filter(p => p.oldPrice && p.oldPrice > p.price);
  }

  const min = parseFloat(document.getElementById('priceMin')?.value);
  const max = parseFloat(document.getElementById('priceMax')?.value);
  if (min) list = list.filter(p => p.price >= min);
  if (max) list = list.filter(p => p.price <= max);

  const sort = document.getElementById('sortSelect')?.value;
  if (sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  if (sort === 'name-asc') list.sort((a,b) => a.name.localeCompare(b.name, 'ru'));
  if (sort === 'discount') {
    list.sort((a,b) => {
      const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
      const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
      return db - da;
    });
  }

  const grid = document.getElementById('productsGrid');

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty" style="grid-column:1/-1;">
        <div style="font-size:50px;margin-bottom:12px;">🔍</div>
        <p>Ничего не найдено</p>
        <a href="#" onclick="resetFilters(); event.preventDefault();">Сбросить фильтры</a>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const discount = (p.oldPrice && p.oldPrice > p.price)
      ? Math.round((p.oldPrice - p.price) / p.oldPrice * 100)
      : 0;

    return `
      <div class="card">
        <!-- Картинка кликабельна → переход на страницу товара -->
        <div class="card-img-wrap" onclick="location.href='product.html?id=${p.id}'" style="cursor:pointer;">
          <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/0d6efd/ffffff?text=Товар'">
          <button class="fav-btn ${isFavorite(p.id) ? 'active' : ''}" onclick="toggleFavorite(${p.id}, event)" aria-label="В избранное">
            ${isFavorite(p.id) ? '❤️' : '🤍'}
          </button>
          ${discount ? `<div class="sale-badge">−${discount}%</div>` : ''}
        </div>

        <div class="card-body">
          <!-- Инфо кликабельно → переход на страницу товара -->
          <div class="card-info-clickable" onclick="location.href='product.html?id=${p.id}'" style="cursor:pointer;flex:1;display:flex;flex-direction:column;">
            <div class="card-cat">${p.category}</div>
            <div class="card-title">${p.name}</div>
            <div class="card-desc">${p.desc || ''}</div>
            <div class="card-price">
              ${p.price.toLocaleString('ru')} ₽
              ${p.oldPrice ? `<small>${p.oldPrice.toLocaleString('ru')} ₽</small>` : ''}
            </div>
          </div>

          <!-- Кнопки — НЕ ведут на страницу (stopPropagation) -->
          <div class="card-actions">
            <button type="button" class="btn-cart" onclick="addToCart(${p.id})">
              <span>🛒</span> В корзину
            </button>
            <button type="button" class="btn-compare ${isComparing(p.id) ? 'active' : ''}" onclick="toggleCompare(${p.id}, event)" title="Сравнить">
              ⚖️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateCompareFab();
}

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

function calcBoiler() {
  const area = parseFloat(document.getElementById('areaInput').value);
  if (!area || area <= 0) {
    document.getElementById('calcResult').innerText = '⚠️ Введите корректную площадь';
    return;
  }
  const power = (area / 10 * 1.2).toFixed(1);
  document.getElementById('calcResult').innerText = `✅ Рекомендуемая мощность: ${power} кВт`;
}

renderNav();
renderCategories();
renderProducts();
updateCompareFab();