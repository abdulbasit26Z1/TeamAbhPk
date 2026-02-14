const authGate = document.getElementById('authGate');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const logoutButton = document.getElementById('logoutButton');
const profileUsername = document.getElementById('profileUsername');
const profileContact = document.getElementById('profileContact');
const orderList = document.getElementById('orderList');
const orderEmpty = document.getElementById('orderEmpty');
const orderDetails = document.getElementById('orderDetails');
const chatThread = document.getElementById('chatThread');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

let activeOrderId = null;

function setMessage(target, message) {
    if (target) {
        target.textContent = message || '';
    }
}

function showAuthGate() {
    authGate.style.display = 'grid';
    dashboard.style.display = 'none';
}

function showDashboard() {
    authGate.style.display = 'none';
    dashboard.style.display = 'block';
}

function formatDate(value) {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

function renderProfile(user) {
    profileUsername.textContent = user.username;
    const parts = [];
    if (user.profile?.name) parts.push(user.profile.name);
    if (user.profile?.email) parts.push(user.profile.email);
    if (user.profile?.phone) parts.push(user.profile.phone);
    if (user.profile?.company) parts.push(user.profile.company);
    profileContact.textContent = parts.length ? parts.join(' | ') : 'No profile info yet.';
}

function renderOrders(orders) {
    orderList.innerHTML = '';
    if (!orders.length) {
        orderEmpty.style.display = 'block';
        return;
    }
    orderEmpty.style.display = 'none';

    orders.forEach(order => {
        const item = document.createElement('li');
        item.className = 'order-item';
        if (order.id === activeOrderId) {
            item.classList.add('active');
        }
        item.innerHTML = `
            <div style="font-weight: 600; color: var(--secondary-color);">${order.serviceName}</div>
            <div class="order-meta">
                <span>${order.id}</span>
                <span>$${order.price} • ${order.status}</span>
            </div>
        `;
        item.addEventListener('click', () => selectOrder(order.id));
        orderList.appendChild(item);
    });
}

function renderOrderDetails(order) {
    if (!order) {
        orderDetails.innerHTML = '<p style="color: var(--text-light);">Select an order to see details.</p>';
        chatThread.innerHTML = '';
        return;
    }

    orderDetails.innerHTML = `
        <div style="display: grid; gap: 6px;">
            <div><strong>Service:</strong> ${order.serviceName}</div>
            <div><strong>Order ID:</strong> ${order.id}</div>
            <div><strong>Status:</strong> ${order.status}</div>
            <div><strong>Total:</strong> $${order.price}</div>
            <div><strong>Placed:</strong> ${formatDate(order.createdAt)}</div>
            <div><strong>Payment:</strong> ${order.paymentMethod}</div>
            <div><strong>Notes:</strong> ${order.projectDescription || 'None'}</div>
        </div>
    `;

    renderChat(order.messages || []);
}

function renderChat(messages) {
    chatThread.innerHTML = '';
    if (!messages.length) {
        chatThread.innerHTML = '<p style="color: var(--text-light);">No messages yet.</p>';
        return;
    }
    messages.forEach(message => {
        const bubble = document.createElement('div');
        const author = message.author === 'admin' ? 'admin' : 'user';
        bubble.className = `chat-message ${author}`;
        bubble.innerHTML = `
            <div>${message.text}</div>
            <div class="chat-meta">${author === 'admin' ? 'Admin' : 'You'} • ${formatDate(message.at)}</div>
        `;
        chatThread.appendChild(bubble);
    });
    chatThread.scrollTop = chatThread.scrollHeight;
}

function selectOrder(orderId) {
    const session = window.AbhAuth.getSession();
    if (!session) return;
    const orders = window.AbhAuth.getOrdersForUser(session.username);
    const order = orders.find(item => item.id === orderId);
    activeOrderId = orderId;
    renderOrders(orders);
    renderOrderDetails(order);
}

function bootDashboard() {
    const session = window.AbhAuth.getSession();
    if (!session) {
        showAuthGate();
        return;
    }

    const user = window.AbhAuth.getUser(session.username);
    renderProfile(user || { username: session.username, profile: {} });
    showDashboard();

    const orders = window.AbhAuth.getOrdersForUser(session.username);
    const urlOrder = new URLSearchParams(window.location.search).get('order');
    activeOrderId = urlOrder || (orders[0] && orders[0].id) || null;
    renderOrders(orders);
    renderOrderDetails(orders.find(item => item.id === activeOrderId));
}

loginForm?.addEventListener('submit', event => {
    event.preventDefault();
    setMessage(loginMessage, '');
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const result = window.AbhAuth.login(username, password);
    if (!result.ok) {
        setMessage(loginMessage, result.message || 'Unable to login.');
        return;
    }
    bootDashboard();
});

registerForm?.addEventListener('submit', event => {
    event.preventDefault();
    setMessage(registerMessage, '');
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const result = window.AbhAuth.register(username, password, { name: name, email: email });
    if (!result.ok) {
        setMessage(registerMessage, result.message || 'Unable to create account.');
        return;
    }
    bootDashboard();
});

logoutButton?.addEventListener('click', () => {
    window.AbhAuth.logout();
    showAuthGate();
});

chatForm?.addEventListener('submit', event => {
    event.preventDefault();
    const messageText = chatInput.value.trim();
    if (!messageText || !activeOrderId) {
        return;
    }
    const update = window.AbhAuth.updateOrder(activeOrderId, order => {
        const messages = order.messages || [];
        messages.push({
            id: `msg-${Date.now()}`,
            author: 'user',
            text: messageText,
            at: new Date().toISOString()
        });
        return { ...order, messages: messages };
    });
    chatInput.value = '';
    renderOrderDetails(update);
});

window.AbhAuth.initOrdersFromFile('db/orders.json').finally(() => {
    bootDashboard();
});
