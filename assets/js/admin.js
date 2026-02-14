const ADMIN_PASSWORD = '1ab23cd4';

const loginOverlay = document.getElementById('loginOverlay');
const loginButton = document.getElementById('loginButton');
const loginError = document.getElementById('loginError');
const adminPassword = document.getElementById('adminPassword');

const loadServicesBtn = document.getElementById('loadServices');
const importServicesBtn = document.getElementById('importServices');
const importFile = document.getElementById('importFile');
const exportServicesBtn = document.getElementById('exportServices');
const validateServicesBtn = document.getElementById('validateServices');
const adminStatus = document.getElementById('adminStatus');

const serviceList = document.getElementById('serviceList');
const serviceSearch = document.getElementById('serviceSearch');

const statTotal = document.getElementById('statTotal');
const statCategories = document.getElementById('statCategories');
const statAverage = document.getElementById('statAverage');

const serviceId = document.getElementById('serviceId');
const serviceTitle = document.getElementById('serviceTitle');
const serviceCategory = document.getElementById('serviceCategory');
const servicePrice = document.getElementById('servicePrice');
const serviceDelivery = document.getElementById('serviceDelivery');
const serviceRating = document.getElementById('serviceRating');
const serviceReviews = document.getElementById('serviceReviews');
const serviceImage = document.getElementById('serviceImage');
const sellerName = document.getElementById('sellerName');
const sellerAvatar = document.getElementById('sellerAvatar');
const serviceDescription = document.getElementById('serviceDescription');
const serviceFeatures = document.getElementById('serviceFeatures');

const newServiceBtn = document.getElementById('newService');
const saveServiceBtn = document.getElementById('saveService');
const deleteServiceBtn = document.getElementById('deleteService');
const resetFormBtn = document.getElementById('resetForm');
const jsonPreview = document.getElementById('jsonPreview');

let services = [];
let selectedIndex = null;

function setStatus(message, isError = false) {
    adminStatus.textContent = message;
    adminStatus.style.color = isError ? '#d9534f' : '';
}

function unlockAdmin() {
    loginOverlay.style.display = 'none';
    adminPassword.value = '';
    loginError.textContent = '';
}

function handleLogin() {
    const entered = adminPassword.value.trim();
    if (entered === ADMIN_PASSWORD) {
        unlockAdmin();
    } else {
        loginError.textContent = 'Invalid password.';
    }
}

loginButton.addEventListener('click', handleLogin);
adminPassword.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleLogin();
    }
});

function renderList(filterText = '') {
    const keyword = filterText.toLowerCase();
    serviceList.innerHTML = '';

    services.forEach((service, index) => {
        const title = (service.title || '').toLowerCase();
        const category = (service.category || '').toLowerCase();

        if (keyword && !title.includes(keyword) && !category.includes(keyword)) {
            return;
        }

        const item = document.createElement('div');
        item.className = 'service-item';
        if (index === selectedIndex) {
            item.classList.add('active');
        }
        item.innerHTML = `
            <h3>${service.title || 'Untitled service'}</h3>
            <p>${service.category || 'No category'} · $${service.price ?? 0}</p>
        `;
        item.addEventListener('click', () => selectService(index));
        serviceList.appendChild(item);
    });

    updateStats();
    updateJsonPreview();
}

function updateStats() {
    statTotal.textContent = services.length.toString();
    const categories = [...new Set(services.map(item => item.category).filter(Boolean))];
    statCategories.textContent = categories.length ? categories.join(', ') : '-';

    const prices = services.map(item => Number(item.price)).filter(price => !Number.isNaN(price));
    if (prices.length) {
        const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        statAverage.textContent = `$${avg.toFixed(0)}`;
    } else {
        statAverage.textContent = '-';
    }
}

function updateJsonPreview() {
    jsonPreview.value = JSON.stringify(services, null, 2);
}

function clearForm() {
    serviceId.value = '';
    serviceTitle.value = '';
    serviceCategory.value = '';
    servicePrice.value = '';
    serviceDelivery.value = '';
    serviceRating.value = '';
    serviceReviews.value = '';
    serviceImage.value = '';
    sellerName.value = '';
    sellerAvatar.value = '';
    serviceDescription.value = '';
    serviceFeatures.value = '';
}

function selectService(index) {
    selectedIndex = index;
    const service = services[index];
    if (!service) return;

    serviceId.value = service.id || '';
    serviceTitle.value = service.title || '';
    serviceCategory.value = service.category || '';
    servicePrice.value = service.price ?? '';
    serviceDelivery.value = service.delivery || '';
    serviceRating.value = service.rating ?? '';
    serviceReviews.value = service.reviews ?? '';
    serviceImage.value = service.image || '';
    sellerName.value = service.seller?.name || '';
    sellerAvatar.value = service.seller?.avatar || '';
    serviceDescription.value = service.description || '';
    serviceFeatures.value = (service.features || []).join('\n');

    renderList(serviceSearch.value);
}

function validateForm() {
    const requiredFields = [
        serviceTitle.value.trim(),
        serviceCategory.value.trim(),
        servicePrice.value.trim(),
        serviceDelivery.value.trim(),
        serviceRating.value.trim(),
        serviceReviews.value.trim(),
        serviceImage.value.trim(),
        sellerName.value.trim(),
        sellerAvatar.value.trim(),
        serviceDescription.value.trim()
    ];

    if (requiredFields.some(value => !value)) {
        setStatus('Please fill in all required fields.', true);
        return false;
    }

    return true;
}

function buildServiceObject() {
    return {
        id: serviceId.value.trim() || generateId(),
        title: serviceTitle.value.trim(),
        category: serviceCategory.value.trim(),
        description: serviceDescription.value.trim(),
        price: Number(servicePrice.value),
        delivery: serviceDelivery.value.trim(),
        rating: Number(serviceRating.value),
        reviews: Number(serviceReviews.value),
        image: serviceImage.value.trim(),
        seller: {
            name: sellerName.value.trim(),
            avatar: sellerAvatar.value.trim()
        },
        features: serviceFeatures.value
            .split('\n')
            .map(feature => feature.trim())
            .filter(Boolean)
    };
}

function generateId() {
    const ids = services
        .map(item => parseInt(item.id, 10))
        .filter(id => !Number.isNaN(id));
    const maxId = ids.length ? Math.max(...ids) : 0;
    return String(maxId + 1);
}

async function loadServices() {
    setStatus('Loading db/services.json...');
    try {
        const response = await fetch(`db/services.json?v=${Date.now()}`);
        if (!response.ok) {
            throw new Error('Unable to load services.json');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('services.json must contain an array');
        }
        services = data;
        selectedIndex = null;
        clearForm();
        renderList(serviceSearch.value);
        setStatus('Loaded services.json');
    } catch (error) {
        setStatus(error.message, true);
    }
}

function importServicesFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            if (!Array.isArray(data)) {
                throw new Error('JSON must be an array');
            }
            services = data;
            selectedIndex = null;
            clearForm();
            renderList(serviceSearch.value);
            setStatus('Imported JSON file');
        } catch (error) {
            setStatus(`Import failed: ${error.message}`, true);
        }
    };
    reader.readAsText(file);
}

function exportServices() {
    if (!services.length) {
        setStatus('No services to export.', true);
        return;
    }

    const blob = new Blob([JSON.stringify(services, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'services.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('Downloaded services.json');
}

function validateServices() {
    if (!services.length) {
        setStatus('No services loaded.', true);
        return;
    }

    const ids = new Set();
    for (const service of services) {
        if (!service.id || !service.title || !service.category) {
            setStatus('Validation failed: missing id/title/category.', true);
            return;
        }
        if (ids.has(service.id)) {
            setStatus(`Validation failed: duplicate id ${service.id}.`, true);
            return;
        }
        ids.add(service.id);
    }
    setStatus('Validation passed.');
}

function saveService() {
    if (!validateForm()) return;

    const service = buildServiceObject();
    const duplicateId = services.findIndex(item => item.id === service.id);

    if (selectedIndex === null) {
        if (duplicateId !== -1) {
            setStatus('Service ID already exists. Choose a unique ID.', true);
            return;
        }
        services.push(service);
        selectedIndex = services.length - 1;
    } else {
        if (duplicateId !== -1 && duplicateId !== selectedIndex) {
            setStatus('Service ID already exists. Choose a unique ID.', true);
            return;
        }
        services[selectedIndex] = service;
    }

    renderList(serviceSearch.value);
    setStatus('Service saved.');
}

function deleteService() {
    if (selectedIndex === null) {
        setStatus('Select a service to delete.', true);
        return;
    }

    const removed = services.splice(selectedIndex, 1);
    if (removed.length) {
        selectedIndex = null;
        clearForm();
        renderList(serviceSearch.value);
        setStatus('Service deleted.');
    }
}

serviceSearch.addEventListener('input', (event) => {
    renderList(event.target.value);
});

newServiceBtn.addEventListener('click', () => {
    selectedIndex = null;
    clearForm();
    renderList(serviceSearch.value);
    setStatus('Creating a new service.');
});

saveServiceBtn.addEventListener('click', saveService);
deleteServiceBtn.addEventListener('click', deleteService);
resetFormBtn.addEventListener('click', clearForm);

loadServicesBtn.addEventListener('click', loadServices);
exportServicesBtn.addEventListener('click', exportServices);
validateServicesBtn.addEventListener('click', validateServices);

importServicesBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        importServicesFromFile(file);
    }
});

renderList('');