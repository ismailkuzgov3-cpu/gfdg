/* ============================================
   👤 ПРОФИЛЬ — боковое меню, настройки, история, избранное
   ============================================ */

/* -------- Отрисовка бургер-кнопки в шапке -------- */
function renderBurger() {
  const user = currentUser();
  if (!user) return;

  // Найти или создать бургер
  let burger = document.getElementById('burgerBtn');
  if (!burger) {
    burger = document.createElement('button');
    burger.id = 'burgerBtn';
    burger.className = 'burger-btn';
    burger.setAttribute('aria-label', 'Меню профиля');
    burger.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;
    burger.onclick = openProfileMenu;

    const header = document.querySelector('header');
    if (header) header.appendChild(burger);
  }

  // Создать боковую панель, если её ещё нет
  if (!document.getElementById('profileDrawer')) {
    createDrawer();
  }
}

/* -------- Создание боковой панели -------- */
function createDrawer() {
  const user = currentUser();
  if (!user) return;

  const drawer = document.createElement('div');
  drawer.id = 'profileDrawer';
  drawer.className = 'profile-drawer';
  drawer.innerHTML = `
    <div class="drawer-overlay" onclick="closeProfileMenu()"></div>
    <aside class="drawer-panel">
      <div class="drawer-header">
        <div class="drawer-avatar">${(user.name || 'U')[0].toUpperCase()}</div>
        <div class="drawer-userinfo">
          <div class="drawer-name">${user.name}</div>
          <div class="drawer-login">@${user.username}</div>
          ${user.role === 'admin'
            ? '<div class="drawer-role">👑 Администратор</div>'
            : '<div class="drawer-role user">👤 Клиент</div>'}
        </div>
        <button class="drawer-close" onclick="closeProfileMenu()" aria-label="Закрыть">✕</button>
      </div>

      <nav class="drawer-nav">
        <a class="drawer-item" onclick="showProfileTab('info')">
          <span class="di-icon">👤</span>
          <span>Мой профиль</span>
        </a>

        <a class="drawer-item" onclick="showProfileTab('favorites')">
          <span class="di-icon">❤️</span>
          <span>Избранное</span>
          <span class="di-count" id="drawerFavCount"></span>
        </a>

        <a class="drawer-item" onclick="showProfileTab('history')">
          <span class="di-icon">📦</span>
          <span>История покупок</span>
          <span class="di-count" id="drawerOrderCount"></span>
        </a>

        <a class="drawer-item" onclick="showProfileTab('settings')">
          <span class="di-icon">⚙️</span>
          <span>Настройки</span>
        </a>

        ${user.role === 'admin' ? `
          <a class="drawer-item" href="admin.html">
            <span class="di-icon">🛠️</span>
            <span>Админ-панель</span>
          </a>
        ` : ''}

        <a class="drawer-item" href="cart.html">
          <span class="di-icon">🛒</span>
          <span>Корзина</span>
        </a>

        <a class="drawer-item" href="index.html">
          <span class="di-icon">🏠</span>
          <span>Каталог</span>
        </a>
      </nav>

      <div class="drawer-footer">
        <button class="drawer-logout" onclick="logout()">
          🚪 Выйти из аккаунта
        </button>
      </div>
    </aside>

    <div class="drawer-content" id="drawerContent" style="display:none;">
      <div class="drawer-content-panel">
        <button class="drawer-back" onclick="showProfileTab('menu')">← Назад</button>
        <div id="drawerBody"></div>
      </div>
    </div>
  `;
  document.body.appendChild(drawer);
}

/* -------- Открытие / закрытие -------- */
function openProfileMenu() {
  const drawer = document.getElementById('profileDrawer');
  if (!drawer) createDrawer();
  const d = document.getElementById('profileDrawer');
  if (d) {
    d.classList.add('active');
    updateOrderCount();
    updateFavCount();
  }
}

function closeProfileMenu() {
  const d = document.getElementById('profileDrawer');
  if (d) {
    d.classList.remove('active');
    d.classList.remove('content-view');
    const content = document.getElementById('drawerContent');
    if (content) content.style.display = 'none';
  }
}

/* -------- Переключение вкладок -------- */
function showProfileTab(tab) {
  const drawer = document.getElementById('profileDrawer');
  const content = document.getElementById('drawerContent');
  const body = document.getElementById('drawerBody');
  if (!drawer || !content || !body) return;

  if (tab === 'menu') {
    drawer.classList.remove('content-view');
    content.style.display = 'none';
    return;
  }

  drawer.classList.add('content-view');
  content.style.display = 'flex';

  if (tab === 'info') body.innerHTML = renderInfoTab();
  if (tab === 'favorites') body.innerHTML = renderFavoritesTab();
  if (tab === 'history') body.innerHTML = renderHistoryTab();
  if (tab === 'settings') body.innerHTML = renderSettingsTab();
}

/* -------- Вкладка: Мой профиль -------- */
function renderInfoTab() {
  const user = currentUser();
  const cart = getCartCount();
  const orders = getOrders();
  const favs = JSON.parse(localStorage.getItem('cc_fav_' + user.username) || '[]');

  return `
    <h2 class="drawer-title">👤 Мой профиль</h2>

    <div class="profile-card">
      <div class="profile-avatar-lg">${(user.name || 'U')[0].toUpperCase()}</div>
      <div class="profile-name-lg">${user.name}</div>
      <div class="profile-login-lg">@${user.username}</div>
    </div>

    <div class="info-grid">
      <div class="info-block">
        <div class="info-label">Роль</div>
        <div class="info-value">${user.role === 'admin' ? '👑 Админ' : '👤 Клиент'}</div>
      </div>
      <div class="info-block">
        <div class="info-label">Заказов</div>
        <div class="info-value">${orders.length}</div>
      </div>
      <div class="info-block">
        <div class="info-label">В корзине</div>
        <div class="info-value">${cart} шт.</div>
      </div>
      <div class="info-block">
        <div class="info-label">В избранном</div>
        <div class="info-value">${favs.length} шт.</div>
      </div>
    </div>
  `;
}

/* -------- Вкладка: Избранное -------- */
function renderFavoritesTab() {
  const u = currentUser();
  const favs = JSON.parse(localStorage.getItem('cc_fav_' + (u ? u.username : 'guest')) || '[]');
  const products = getProducts().filter(p => favs.includes(p.id));

  if (!products.length) {
    return `
      <h2 class="drawer-title">❤️ Избранное</h2>
      <div class="drawer-empty">
        <div style="font-size:50px;margin-bottom:12px;">💔</div>
        <p>Пока ничего не добавлено</p>
        <a href="index.html" class="drawer-empty-link">Перейти в каталог →</a>
      </div>
    `;
  }

  return `
    <h2 class="drawer-title">❤️ Избранное</h2>
    <p class="drawer-subtitle">${products.length} ${plural(products.length, 'товар', 'товара', 'товаров')}</p>
    <div class="fav-list">
      ${products.map(p => `
        <div class="fav-item">
          <img src="${p.img}" onerror="this.src='https://via.placeholder.com/60'">
          <div class="fav-info">
            <div class="fav-name">${p.name}</div>
            <div class="fav-price">${p.price.toLocaleString('ru')} ₽</div>
          </div>
          <button class="fav-cart" onclick="addToCart(${p.id})" title="В корзину">🛒</button>
          <button class="fav-remove" onclick="removeFavFromProfile(${p.id})" title="Убрать">✕</button>
        </div>
      `).join('')}
    </div>
  `;
}

function removeFavFromProfile(id) {
  const user = currentUser();
  const key = 'cc_fav_' + user.username;
  let favs = JSON.parse(localStorage.getItem(key) || '[]');
  favs = favs.filter(x => x !== id);
  localStorage.setItem(key, JSON.stringify(favs));
  updateFavCount();
  showProfileTab('favorites');
}

/* -------- Вкладка: История покупок -------- */
function renderHistoryTab() {
  const orders = getOrders();

  if (!orders.length) {
    return `
      <h2 class="drawer-title">📦 История покупок</h2>
      <div class="drawer-empty">
        <div style="font-size:50px;margin-bottom:12px;">📭</div>
        <p>У вас пока нет заказов</p>
        <a href="index.html" class="drawer-empty-link">Перейти в каталог →</a>
      </div>
    `;
  }

  const sorted = [...orders].sort((a,b) => b.date - a.date);

  return `
    <h2 class="drawer-title">📦 История покупок</h2>
    <p class="drawer-subtitle">Всего заказов: ${orders.length}</p>

    <div class="orders-list">
      ${sorted.map(o => {
        const statusLabels = {
          new: '🆕 Новый',
          processing: '⚙️ В обработке',
          delivered: '✅ Доставлен',
          canceled: '❌ Отменён'
        };
        const statusClass = o.status || 'new';
        return `
          <div class="order-card">
            <div class="order-head">
              <div class="order-num">${o.id}</div>
              <div class="order-date">${new Date(o.date).toLocaleString('ru')}</div>
            </div>
            <div class="order-status status-${statusClass}">
              ${statusLabels[statusClass] || statusLabels.new}
            </div>
            <div class="order-items">
              ${o.items.slice(0, 3).map(i => `
                <div class="order-item-line">
                  <span>${i.name}</span>
                  <span>${i.qty}×${i.price.toLocaleString('ru')} ₽</span>
                </div>
              `).join('')}
              ${o.items.length > 3 ? `<div class="order-more">...и ещё ${o.items.length - 3}</div>` : ''}
            </div>
            <div class="order-total">
              <div>
                <small>Сумма: ${o.subtotal.toLocaleString('ru')} ₽</small>
                <small class="green">−${o.discount.toLocaleString('ru')} ₽ скидка</small>
              </div>
              <div class="order-total-price">${o.total.toLocaleString('ru')} ₽</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* -------- Вкладка: Настройки -------- */
function renderSettingsTab() {
  return `
    <h2 class="drawer-title">⚙️ Настройки</h2>

    <div class="settings-section">
      <h3>Изменить имя</h3>
      <input type="text" id="newName" placeholder="Новое имя" class="settings-input">
      <button class="settings-btn" onclick="updateName()">Сохранить имя</button>
      <div class="settings-msg" id="nameMsg"></div>
    </div>

    <div class="settings-section">
      <h3>Изменить пароль</h3>
      <input type="password" id="oldPass" placeholder="Текущий пароль" class="settings-input">
      <input type="password" id="newPass" placeholder="Новый пароль" class="settings-input">
      <input type="password" id="newPass2" placeholder="Повторите новый пароль" class="settings-input">
      <button class="settings-btn" onclick="updatePassword()">Сохранить пароль</button>
      <div class="settings-msg" id="passMsg"></div>
    </div>

    <div class="settings-section danger">
      <h3>Опасная зона</h3>
      <button class="settings-btn danger" onclick="clearCartConfirm()">🗑 Очистить корзину</button>
    </div>
  `;
}

/* -------- Изменить имя -------- */
function updateName() {
  const user = currentUser();
  const newName = document.getElementById('newName').value.trim();
  const msg = document.getElementById('nameMsg');

  if (!newName) { msg.className = 'settings-msg error'; msg.innerText = 'Введите имя'; return; }
  if (newName.length < 2) { msg.className = 'settings-msg error'; msg.innerText = 'Имя слишком короткое'; return; }

  const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
  const idx = users.findIndex(u => u.username === user.username);
  if (idx >= 0) users[idx].name = newName;
  localStorage.setItem('cc_users', JSON.stringify(users));

  user.name = newName;
  localStorage.setItem('cc_currentUser', JSON.stringify(user));

  msg.className = 'settings-msg success';
  msg.innerText = '✅ Имя обновлено';

  refreshDrawerInfo();
}

/* -------- Изменить пароль -------- */
function updatePassword() {
  const user = currentUser();
  const oldP = document.getElementById('oldPass').value;
  const newP = document.getElementById('newPass').value;
  const newP2 = document.getElementById('newPass2').value;
  const msg = document.getElementById('passMsg');

  if (!oldP || !newP || !newP2) { msg.className = 'settings-msg error'; msg.innerText = 'Заполните все поля'; return; }
  if (oldP !== user.password) { msg.className = 'settings-msg error'; msg.innerText = 'Неверный текущий пароль'; return; }
  if (newP.length < 4) { msg.className = 'settings-msg error'; msg.innerText = 'Пароль минимум 4 символа'; return; }
  if (newP !== newP2) { msg.className = 'settings-msg error'; msg.innerText = 'Пароли не совпадают'; return; }

  const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
  const idx = users.findIndex(u => u.username === user.username);
  if (idx >= 0) users[idx].password = newP;
  localStorage.setItem('cc_users', JSON.stringify(users));

  user.password = newP;
  localStorage.setItem('cc_currentUser', JSON.stringify(user));

  msg.className = 'settings-msg success';
  msg.innerText = '✅ Пароль изменён';

  document.getElementById('oldPass').value = '';
  document.getElementById('newPass').value = '';
  document.getElementById('newPass2').value = '';
}

/* -------- Очистить корзину -------- */
function clearCartConfirm() {
  if (!confirm('Очистить корзину?')) return;
  const user = currentUser();
  localStorage.removeItem('cc_cart_' + user.username);
  alert('✅ Корзина очищена');
  if (typeof renderNav === 'function') renderNav();
}

/* -------- Обновить данные в drawer -------- */
function refreshDrawerInfo() {
  const user = currentUser();
  const nameEl = document.querySelector('.drawer-name');
  const avatarEl = document.querySelector('.drawer-avatar');
  if (nameEl) nameEl.innerText = user.name;
  if (avatarEl) avatarEl.innerText = (user.name || 'U')[0].toUpperCase();

  const navName = document.querySelector('.user-name');
  if (navName) navName.innerText = '👤 ' + user.name;
}

/* -------- Счётчик заказов -------- */
function updateOrderCount() {
  const el = document.getElementById('drawerOrderCount');
  if (!el) return;
  const count = getOrders().length;
  el.innerText = count ? count : '';
}

/* -------- Счётчик избранного -------- */
function updateFavCount() {
  const el = document.getElementById('drawerFavCount');
  if (!el) return;
  const u = currentUser();
  if (!u) return;
  const favs = JSON.parse(localStorage.getItem('cc_fav_' + u.username) || '[]');
  el.innerText = favs.length ? favs.length : '';
}

/* ============================================
   🛒 ЗАКАЗЫ — сохранение истории
   ============================================ */
function ordersKey() {
  const u = currentUser();
  return 'cc_orders_' + (u ? u.username : 'guest');
}

function getOrders() {
  return JSON.parse(localStorage.getItem(ordersKey()) || '[]');
}

function saveOrder(order) {
  const orders = getOrders();
  orders.push(order);
  try {
    localStorage.setItem(ordersKey(), JSON.stringify(orders));
  } catch (e) {
    console.warn('Не удалось сохранить заказ', e);
  }
}

/* Кол-во товаров в корзине */
function getCartCount() {
  const u = currentUser();
  const cart = JSON.parse(localStorage.getItem('cc_cart_' + (u ? u.username : 'guest')) || '[]');
  return cart.reduce((s,i) => s + i.qty, 0);
}

/* -------- Склонение слов (1 товар / 2 товара / 5 товаров) -------- */
function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/* -------- Автоинициализация -------- */
document.addEventListener('DOMContentLoaded', () => {
  renderBurger();
  updateOrderCount();
  updateFavCount();
});

if (document.readyState !== 'loading') {
  renderBurger();
  updateOrderCount();
  updateFavCount();
}