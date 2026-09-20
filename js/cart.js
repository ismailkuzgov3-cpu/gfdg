/* ============================================
   🛒 КОРЗИНА
   ============================================ */

const WHATSAPP_NUMBER = '79626408866';
const DISCOUNT_PERCENT = 5;

/* ============================================
   🎟️ СЕКРЕТНЫЙ ПРОМОКОД ДЛЯ МАСТЕРОВ
   WINTER10 → дополнительная скидка 5% поверх обычной
   Итого для мастера: 5% (онлайн) + 5% (мастер) = 10%
   Клиенты о нём не знают. В админке не показывается.
   ============================================ */
const SECRET_PROMOS = [
  { code: 'WINTER10', percent: 5, used: 0, secret: true },
];

/* ============================================
   ХРАНИЛИЩЕ
   ============================================ */
function cartKey() {
  const u = currentUser();
  return 'cc_cart_' + (u ? u.username : 'guest');
}
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey()) || '[]');
  } catch (e) {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(cartKey(), JSON.stringify(cart));
  renderNav();
  renderCart();
}

/* ============================================
   ПРОМОКОДЫ
   ============================================ */
function promoKey() {
  const u = currentUser();
  return 'cc_active_promo_' + (u ? u.username : 'guest');
}
function getActivePromo() {
  try {
    return JSON.parse(localStorage.getItem(promoKey()) || 'null');
  } catch (e) {
    return null;
  }
}
function setActivePromo(p) {
  if (p) localStorage.setItem(promoKey(), JSON.stringify(p));
  else localStorage.removeItem(promoKey());
}

/* Обычные промокоды (создаются Арсамаком в админке) */
function getPromos() {
  try {
    return JSON.parse(localStorage.getItem('cc_promos') || '[]');
  } catch (e) {
    return [];
  }
}

/* Все промокоды: обычные + секретные (для мастеров) */
function getAllPromos() {
  return [...getPromos(), ...SECRET_PROMOS];
}

function applyPromo() {
  const input = document.getElementById('promoInput');
  const msg = document.getElementById('promoMsg');
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();

  if (!code) {
    msg.className = 'promo-msg error';
    msg.innerText = 'Введите промокод';
    return;
  }

  const promo = getAllPromos().find(p => p.code === code);
  if (!promo) {
    setActivePromo(null);
    msg.className = 'promo-msg error';
    msg.innerText = '❌ Промокод не найден';
    renderCart();
    return;
  }

  setActivePromo(promo);

  if (promo.secret) {
    msg.className = 'promo-msg success';
    msg.innerText = `👷 Мастерский промокод применён: +${promo.percent}% скидка`;
  } else {
    msg.className = 'promo-msg success';
    msg.innerText = `✅ Промокод применён: −${promo.percent}%`;
  }
  renderCart();
}

/* ============================================
   NAV
   ============================================ */
function renderNav() {
  const nav = document.getElementById('navLinks');
  const mobileBar = document.getElementById('mobileBar');
  if (!nav) return;

  const user = currentUser();
  const count = getCart().reduce((s,i) => s + i.qty, 0);

  if (user) {
    nav.innerHTML = `
      <span class="user-name">👤 ${user.name}</span>
      <a href="index.html">Каталог</a>
      <a href="cart.html" class="cart-btn">🛒 Корзина <span class="badge">${count}</span></a>
    `;
    if (mobileBar) {
      mobileBar.innerHTML = `
        <a href="index.html">🏠<span>Главная</span></a>
        <a href="cart.html" class="active">🛒<span>Корзина</span>${count ? `<b class="mob-badge">${count}</b>` : ''}</a>
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
        <a href="cart.html" class="active">🛒<span>Корзина</span>${count ? `<b class="mob-badge">${count}</b>` : ''}</a>
        <a href="login.html">👤<span>Войти</span></a>
      `;
    }
  }
}

/* ============================================
   РЕНДЕР КОРЗИНЫ
   ============================================ */
function renderCart() {
  const cart = getCart();
  const wrap = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');

  if (!wrap || !summary) {
    console.error('cart.html: не найдены #cartItems или #cartSummary');
    return;
  }

  if (!cart.length) {
    wrap.innerHTML = `
      <div class="empty">
        <div style="font-size:60px;margin-bottom:16px;">🛒</div>
        <p>Корзина пуста</p>
        <a href="index.html">Перейти в каталог →</a>
      </div>`;
    summary.style.display = 'none';
    return;
  }

  wrap.innerHTML = cart.map(i => `
    <div class="cart-item">
      <img src="${i.img}" onerror="this.src='https://via.placeholder.com/80'">
      <div class="cart-item-info">
        <div class="name">${i.name}</div>
        <div class="price">${i.price.toLocaleString('ru')} ₽</div>
      </div>
      <div class="qty">
        <button onclick="changeQty(${i.id}, -1)" aria-label="Уменьшить">−</button>
        <span>${i.qty}</span>
        <button onclick="changeQty(${i.id}, 1)" aria-label="Увеличить">+</button>
      </div>
      <button class="remove" onclick="removeItem(${i.id})">🗑 Удалить</button>
    </div>
  `).join('');

  const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const baseDiscount = Math.round(subtotal * DISCOUNT_PERCENT / 100);
  const promo = getActivePromo();
  const promoDiscount = promo ? Math.round(subtotal * promo.percent / 100) : 0;
  const totalDiscount = baseDiscount + promoDiscount;
  const total = subtotal - totalDiscount;

  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('discount');
  const totalEl = document.getElementById('cartTotal');
  const savingsEl = document.getElementById('savings');

  if (subtotalEl) subtotalEl.innerText = subtotal.toLocaleString('ru') + ' ₽';
  if (discountEl) discountEl.innerText = '−' + baseDiscount.toLocaleString('ru') + ' ₽';
  if (totalEl) totalEl.innerText = total.toLocaleString('ru') + ' ₽';
  if (savingsEl) savingsEl.innerText = totalDiscount.toLocaleString('ru') + ' ₽';

  // Промокод
  const promoRow = document.getElementById('promoRow');
  if (promoRow) {
    if (promo) {
      promoRow.style.display = 'flex';

      // Меняем текст в зависимости от секретности
      const promoLabelEl = promoRow.querySelector('span:first-child');
      if (promoLabelEl) {
        if (promo.secret) {
          promoLabelEl.innerHTML = `👷 Мастерская скидка <span id="promoCode">${promo.code}</span>:`;
        } else {
          promoLabelEl.innerHTML = `🎟️ Промокод <span id="promoCode">${promo.code}</span>:`;
        }
      }

      const discountPromoEl = document.getElementById('promoDiscount');
      if (discountPromoEl) discountPromoEl.innerText = '−' + promoDiscount.toLocaleString('ru') + ' ₽';

      // Если мастерский — подсветим жёлтым
      if (promo.secret) {
        promoRow.style.background = 'linear-gradient(90deg, #fff7e6, #ffe8a3)';
        promoRow.style.borderLeftColor = '#cc9500';
        promoRow.style.color = '#8a6d00';
      } else {
        promoRow.style.background = '';
        promoRow.style.borderLeftColor = '';
        promoRow.style.color = '';
      }
    } else {
      promoRow.style.display = 'none';
    }
  }

  summary.style.display = 'block';
}

/* ============================================
   ДЕЙСТВИЯ
   ============================================ */
function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) return removeItem(id);
  saveCart(cart);
}

function removeItem(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

/* ============================================
   ОТПРАВКА В WHATSAPP
   ============================================ */
function sendToWhatsApp() {
  const user = currentUser();
  const cart = getCart();
  if (!cart.length) return;

  const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const baseDiscount = Math.round(subtotal * DISCOUNT_PERCENT / 100);
  const promo = getActivePromo();
  const promoDiscount = promo ? Math.round(subtotal * promo.percent / 100) : 0;
  const totalDiscount = baseDiscount + promoDiscount;
  const total = subtotal - totalDiscount;

  const orderId = 'CC-' + Date.now().toString().slice(-6);

  const order = {
    id: orderId,
    date: Date.now(),
    items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    subtotal: subtotal,
    discount: totalDiscount,
    baseDiscount: baseDiscount,
    promoDiscount: promoDiscount,
    promoCode: promo ? promo.code : null,
    isMaster: promo && promo.secret ? true : false,
    total: total,
    status: 'new'
  };

  const ordersKey = 'cc_orders_' + (user ? user.username : 'guest');
  const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
  orders.push(order);
  try {
    localStorage.setItem(ordersKey, JSON.stringify(orders));
  } catch (e) { console.warn(e); }

  // Счётчик только для обычных промокодов
  if (promo && !promo.secret) {
    const promos = getPromos();
    const idx = promos.findIndex(p => p.code === promo.code);
    if (idx >= 0) {
      promos[idx].used = (promos[idx].used || 0) + 1;
      localStorage.setItem('cc_promos', JSON.stringify(promos));
    }
  }

  let msg = `🔥 *НОВЫЙ ЗАКАЗ — Климат Комфорт* 🔥\n\n`;
  msg += `🆔 *Заказ:* ${orderId}\n`;
  msg += `👤 *Клиент:* ${user ? user.name : 'Гость'}\n`;
  if (user) msg += `🔑 *Логин:* ${user.username}\n`;
  msg += `📅 *Дата:* ${new Date().toLocaleString('ru')}\n`;

  // Пометка что это мастер
  if (promo && promo.secret) {
    msg += `👷 *МАСТЕР (по промокоду ${promo.code})*\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `📦 *СОСТАВ ЗАКАЗА:*\n\n`;

  cart.forEach((i, idx) => {
    msg += `${idx+1}. *${i.name}*\n`;
    msg += `   ${i.qty} шт. × ${i.price.toLocaleString('ru')} ₽ = *${(i.price*i.qty).toLocaleString('ru')} ₽*\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *Сумма товаров:* ${subtotal.toLocaleString('ru')} ₽\n`;
  msg += `🎁 *Скидка 5% за онлайн-заказ:* −${baseDiscount.toLocaleString('ru')} ₽\n`;
  if (promo) {
    const label = promo.secret ? `👷 Мастерская скидка ${promo.code}` : `🎟️ Промокод ${promo.code}`;
    msg += `${label} (−${promo.percent}%): −${promoDiscount.toLocaleString('ru')} ₽\n`;
  }
  msg += `\n✅ *ИТОГО К ОПЛАТЕ: ${total.toLocaleString('ru')} ₽*\n`;
  msg += `_(вы сэкономили ${totalDiscount.toLocaleString('ru')} ₽)_\n\n`;
  msg += `Пожалуйста, свяжитесь со мной для оформления ✅`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  showOrderSuccess(orderId, total, promo);

  setTimeout(() => {
    window.open(url, '_blank');
  }, 1200);
}

/* ============================================
   ПЛАШКА УСПЕХА
   ============================================ */
function showOrderSuccess(orderId, total, promo) {
  const isMaster = promo && promo.secret;
  const success = document.createElement('div');
  success.className = 'order-success-modal';
  success.innerHTML = `
    <div class="order-success-box">
      <div class="success-icon">${isMaster ? '👷' : '✅'}</div>
      <h2>${isMaster ? 'Заказ мастера оформлен!' : 'Заказ оформлен!'}</h2>
      ${isMaster ? '<p style="color:#cc9500;font-weight:700;margin-bottom:8px;">Мастерская скидка +5% применена 🎉</p>' : ''}
      <p class="success-order">Номер: <b>${orderId}</b></p>
      <p class="success-total">Итого: <b>${total.toLocaleString('ru')} ₽</b></p>
      <p class="success-hint">Сейчас откроется WhatsApp — отправьте сообщение Арсамаку</p>
      <button onclick="this.closest('.order-success-modal').remove()">Понятно</button>
    </div>
  `;
  document.body.appendChild(success);
  setTimeout(() => success.classList.add('show'), 10);
}

/* ============================================
   СТАРТ
   ============================================ */
renderNav();
renderCart();