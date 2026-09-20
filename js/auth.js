function initAdmin() {
  const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
  const adminExists = users.find(u => u.username === 'admin');
  if (!adminExists) {
    users.push({
      username: 'admin',
      password: '08423108.kuzz',
      name: 'Арсамак',
      role: 'admin'
    });
    localStorage.setItem('cc_users', JSON.stringify(users));
  }
}

function register(username, password, name) {
  const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
  if (users.find(u => u.username === username)) {
    return { ok:false, error:'Пользователь уже существует' };
  }
  users.push({ username, password, name, role:'user' });
  localStorage.setItem('cc_users', JSON.stringify(users));
  return { ok:true };
}

function login(username, password) {
  const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return { ok:false, error:'Неверный логин или пароль' };
  localStorage.setItem('cc_currentUser', JSON.stringify(user));
  return { ok:true, user };
}

function logout() {
  localStorage.removeItem('cc_currentUser');
  location.href = 'index.html';
}

function currentUser() {
  return JSON.parse(localStorage.getItem('cc_currentUser') || 'null');
}

function requireAuth() {
  if (!currentUser()) {
    location.href = 'login.html';
    return false;
  }
  return true;
}

function requireAdmin() {
  const u = currentUser();
  if (!u || u.role !== 'admin') {
    alert('Доступ только для администратора');
    location.href = 'index.html';
    return false;
  }
  return true;
}

initAdmin();