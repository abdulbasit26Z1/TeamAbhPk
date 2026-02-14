(function () {
    const STORAGE_KEYS = {
        users: 'abh_users',
        orders: 'abh_orders',
        session: 'abh_session'
    };

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) {
                return fallback;
            }
            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getUsers() {
        return readJson(STORAGE_KEYS.users, []);
    }

    function saveUsers(users) {
        writeJson(STORAGE_KEYS.users, users);
    }

    function getUser(username) {
        return getUsers().find(user => user.username === username);
    }

    function register(username, password, profile) {
        if (!username || !password) {
            return { ok: false, reason: 'invalid', message: 'Username and password are required.' };
        }

        const existing = getUser(username);
        if (existing) {
            return { ok: false, reason: 'exists', message: 'Username already exists.' };
        }

        const users = getUsers();
        const newUser = {
            username: username,
            password: password,
            profile: profile || {},
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        saveUsers(users);
        setSession(username);
        return { ok: true, user: newUser };
    }

    function login(username, password) {
        const user = getUser(username);
        if (!user || user.password !== password) {
            return { ok: false, message: 'Invalid credentials.' };
        }
        setSession(username);
        return { ok: true, user: user };
    }

    function setSession(username) {
        writeJson(STORAGE_KEYS.session, { username: username, at: new Date().toISOString() });
    }

    function getSession() {
        return readJson(STORAGE_KEYS.session, null);
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEYS.session);
    }

    function getOrders() {
        return readJson(STORAGE_KEYS.orders, []);
    }

    function saveOrders(orders) {
        writeJson(STORAGE_KEYS.orders, orders);
    }

    function createOrder(order) {
        const orders = getOrders();
        orders.push(order);
        saveOrders(orders);
        return order;
    }

    function updateOrder(orderId, updater) {
        const orders = getOrders();
        const index = orders.findIndex(order => order.id === orderId);
        if (index === -1) {
            return null;
        }
        const updated = updater(orders[index]) || orders[index];
        orders[index] = updated;
        saveOrders(orders);
        return updated;
    }

    function getOrdersForUser(username) {
        return getOrders().filter(order => order.username === username);
    }

    async function initOrdersFromFile(url) {
        const existing = getOrders();
        if (existing.length) {
            return existing;
        }
        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                return [];
            }
            saveOrders(data);
            return data;
        } catch (error) {
            return [];
        }
    }

    window.AbhAuth = {
        getUsers: getUsers,
        getUser: getUser,
        register: register,
        login: login,
        setSession: setSession,
        getSession: getSession,
        logout: logout,
        getOrders: getOrders,
        createOrder: createOrder,
        updateOrder: updateOrder,
        getOrdersForUser: getOrdersForUser,
        initOrdersFromFile: initOrdersFromFile
    };
})();
