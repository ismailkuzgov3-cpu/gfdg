if (!requireAdmin()) throw new Error('Access denied');

let currentPhoto = '';

/* ============================================
   СТАТИСТИКА
   ============================================ */
function renderStats() {
  const list = getProducts();
  const cats = new Set(list.map(p => p.category));
  document.getElementById('stats').innerHTML =
    `${list.length} товаров • ${cats.size} категорий`;
}

/* ============================================
   ТАБЫ АДМИНКИ
   ============================================ */
function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');

  if (tab === 'orders') renderOrders();
  if (tab === 'promo') renderPromoTable();
  if (tab === 'products') renderAdminTable();
}

/* ============================================
   ТОВАРЫ
   ============================================ */
function normalize(str) {
  return (str || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

function renderAdminTable() {
  const q = document.getElementById('searchAdmin').value;
  const cat = document.getElementById('catFilter').value;
  let list = getProducts();

  if (q && q.trim()) {
    const words = normalize(q).split(' ').filter(Boolean);
    list = list.filter(p => {
      const hay = normalize(p.name + ' ' + (p.desc || '') + ' ' + p.category);
      return words.every(w => hay.includes(w));
    });
  }
  if (cat) list = list.filter(p => p.category === cat);

  document.getElementById('adminTable').innerHTML = list.map(p => `
    <tr>
      <td data-label="ID">${p.id}</td>
      <td data-label="Фото"><img src="${p.img}" onerror="this.src='https://via.placeholder.com/50'"></td>
      <td data-label="Название"><b>${p.name}</b><br><small style="color:#888">${p.desc||''}</small></td>
      <td data-label="Категория">${p.category}</td>
      <td data-label="Цена" style="color:var(--primary);font-weight:700;">${p.price.toLocaleString('ru')} ₽</td>
      <td data-label="Старая цена">${p.oldPrice ? p.oldPrice.toLocaleString('ru')+' ₽' : '—'}</td>
      <td data-label="Действия">
        <button class="btn-edit" onclick="editProduct(${p.id})">✏️</button>
        <button class="btn-del" onclick="delProduct(${p.id})">🗑</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="empty">Нет товаров</td></tr>';
}

function renderCatFilter() {
  const cats = [...new Set(getProducts().map(p => p.category))];
  const sel = document.getElementById('catFilter');
  sel.innerHTML = '<option value="">Все категории</option>' +
    cats.map(c => `<option>${c}</option>`).join('');
  document.getElementById('catList').innerHTML = cats.map(c => `<option value="${c}">`).join('');
}

/* ============================================
   МОДАЛКА ТОВАРА
   ============================================ */
function openModal(id = null) {
  document.getElementById('modal').classList.add('active');
  currentPhoto = '';

  if (id) {
    const p = getProducts().find(x => x.id === id);
    document.getElementById('modalTitle').innerText = 'Редактировать товар';
    document.getElementById('m_id').value = p.id;
    document.getElementById('m_name').value = p.name;
    document.getElementById('m_category').value = p.category;
    document.getElementById('m_price').value = p.price;
    document.getElementById('m_oldPrice').value = p.oldPrice || 0;
    document.getElementById('m_desc').value = p.desc || '';
    currentPhoto = p.img || '';
    showPhoto(currentPhoto);
  } else {
    document.getElementById('modalTitle').innerText = 'Добавить товар';
    ['m_id','m_name','m_category','m_price','m_oldPrice','m_desc'].forEach(i =>
      document.getElementById(i).value = '');
    showPhoto('');
  }

  const input = document.getElementById('photoInput');
  if (input) input.value = '';
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
  currentPhoto = '';
}

function editProduct(id) { openModal(id); }

function delProduct(id) {
  if (!confirm('Удалить товар?')) return;
  saveProducts(getProducts().filter(p => p.id !== id));
  renderAdminTable(); renderStats(); renderCatFilter();
}

/* ============================================
   📷 ЗАГРУЗКА ФОТО — 1 КНОПКА, КРАСИВО
   ============================================ */
function showPhoto(src) {
  const empty = document.getElementById('photoEmpty');
  const preview = document.getElementById('photoPreviewV2');
  const img = document.getElementById('photoImgV2');

  if (src) {
    empty.style.display = 'none';
    preview.style.display = 'block';
    img.src = src;
  } else {
    empty.style.display = 'flex';
    preview.style.display = 'none';
    img.src = '';
  }
}

function removePhoto() {
  currentPhoto = '';
  showPhoto('');
  const input = document.getElementById('photoInput');
  if (input) input.value = '';
}

function handleFile(input) {
  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Выберите изображение');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 800;
      let w = img.width, h = img.height;
      if (w > MAX) { h = h * MAX / w; w = MAX; }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      currentPhoto = canvas.toDataURL('image/jpeg', 0.75);
      showPhoto(currentPhoto);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.getElementById('photoInput')?.addEventListener('change', function(){ handleFile(this); });

/* ============================================
   СОХРАНЕНИЕ ТОВАРА
   ============================================ */
function saveProduct() {
  const id = document.getElementById('m_id').value;
  const name = document.getElementById('m_name').value.trim();
  const category = document.getElementById('m_category').value.trim();
  const price = parseFloat(document.getElementById('m_price').value);
  const oldPrice = parseFloat(document.getElementById('m_oldPrice').value) || 0;
  const desc = document.getElementById('m_desc').value.trim();

  if (!name || !category || !price) {
    alert('Заполните название, категорию и цену');
    return;
  }

  const img = currentPhoto || 'https://via.placeholder.com/400x300/0d6efd/ffffff?text=Товар';

  let list = getProducts();
  if (id) {
    const idx = list.findIndex(p => p.id == id);
    list[idx] = { ...list[idx], name, category, price, oldPrice, img, desc };
  } else {
    const newId = list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
    list.push({ id:newId, name, category, price, oldPrice, img, desc });
  }

  try {
    saveProducts(list);
  } catch (e) {
    alert('Недостаточно места. Удалите старые фото или уменьшите кол-во товаров.');
    return;
  }

  closeModal();
  renderAdminTable(); renderStats(); renderCatFilter();
}

/* ============================================
   🛍 ЗАКАЗЫ (из всех пользователей)
   ============================================ */
function getAllOrders() {
  const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
  let all = [];
  users.forEach(u => {
    const orders = JSON.parse(localStorage.getItem('cc_orders_' + u.username) || '[]');
    orders.forEach(o => all.push({ ...o, username: u.username, userName: u.name }));
  });
  return all.sort((a,b) => b.date - a.date);
}

function renderOrders() {
  const orders = getAllOrders();
  const badge = document.getElementById('ordersBadge');
  const newCount = orders.filter(o => o.status === 'new').length;
  if (badge) badge.innerText = newCount ? newCount : '';

  const wrap = document.getElementById('ordersList');
  if (!orders.length) {
    wrap.innerHTML = '<div class="empty">Пока нет заказов</div>';
    return;
  }

  wrap.innerHTML = orders.map(o => `
    <div class="admin-order">
      <div class="admin-order-head">
        <div>
          <b>${o.id || 'Заказ'}</b>
          <span class="order-user">👤 ${o.userName || o.username}</span>
        </div>
        <div class="order-date">${new Date(o.date).toLocaleString('ru')}</div>
      </div>
      <div class="admin-order-items">
        ${o.items.map(i => `<div>• ${i.name} — ${i.qty}×${i.price.toLocaleString('ru')} ₽</div>`).join('')}
      </div>
      <div class="admin-order-foot">
        <div>
          <small>Сумма: ${o.subtotal.toLocaleString('ru')} ₽</small>
          ${o.promoCode ? `<small>Промокод: ${o.promoCode}</small>` : ''}
          <small>Скидка: −${o.discount.toLocaleString('ru')} ₽</small>
        </div>
        <div class="order-total-price">${o.total.toLocaleString('ru')} ₽</div>
      </div>
      <div class="admin-order-status">
        <label>Статус:</label>
        <select onchange="changeOrderStatus('${o.username}', '${o.id}', this.value)">
          <option value="new" ${o.status === 'new' ? 'selected' : ''}>🆕 Новый</option>
          <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>⚙️ В обработке</option>
          <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>✅ Доставлен</option>
          <option value="canceled" ${o.status === 'canceled' ? 'selected' : ''}>❌ Отменён</option>
        </select>
      </div>
    </div>
  `).join('');
}

function changeOrderStatus(username, orderId, status) {
  const key = 'cc_orders_' + username;
  const orders = JSON.parse(localStorage.getItem(key) || '[]');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = status;
    localStorage.setItem(key, JSON.stringify(orders));
    renderOrders();
  }
}

/* ============================================
   🎟️ ПРОМОКОДЫ
   ============================================ */
function getPromos() {
  return JSON.parse(localStorage.getItem('cc_promos') || '[]');
}
function savePromos(list) {
  localStorage.setItem('cc_promos', JSON.stringify(list));
}

function renderPromoTable() {
  const promos = getPromos();
  document.getElementById('promoTable').innerHTML = promos.map(p => `
    <tr>
      <td data-label="Код"><b style="color:var(--primary);">${p.code}</b></td>
      <td data-label="Скидка">${p.percent}%</td>
      <td data-label="Использований">${p.used || 0}</td>
      <td data-label="Действия">
        <button class="btn-del" onclick="deletePromo('${p.code}')">🗑</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="empty">Пока нет промокодов</td></tr>';
}

function addPromo() {
  const code = document.getElementById('newPromoCode').value.trim().toUpperCase();
  const percent = parseFloat(document.getElementById('newPromoPercent').value);

  if (!code || !percent || percent <= 0 || percent > 50) {
    alert('Введите код и скидку от 1 до 50%');
    return;
  }
  const promos = getPromos();
  if (promos.find(p => p.code === code)) {
    alert('Такой промокод уже есть');
    return;
  }
  promos.push({ code, percent, used: 0 });
  savePromos(promos);

  document.getElementById('newPromoCode').value = '';
  document.getElementById('newPromoPercent').value = '';
  renderPromoTable();
}

function deletePromo(code) {
  if (!confirm(`Удалить промокод ${code}?`)) return;
  savePromos(getPromos().filter(p => p.code !== code));
  renderPromoTable();
}

/* ============================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================ */
renderStats();
renderCatFilter();
renderAdminTable();
renderOrders();
renderPromoTable();