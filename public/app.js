// --- CONFIG & STATE ---
const API_URL = 'http://localhost:3000/api';
let records = [];
let currentUser = JSON.parse(localStorage.getItem('gripzone_user')) || null;
let currentProfileEmail = null;
let sortState = { key: 'score', order: 'desc' };
let myChart = null;

const translations = {
    es: {
        login: "Iniciar Sesión", upload: "Subir Marca",
        hero_title: 'GRIP<span class="highlight">ZONE</span> RANKING',
        hero_subtitle: "BASE DE DATOS MUNDIAL DE FUERZA DE MANO",
        sort_by: "Ordenar por:", btn_score: "Marca", btn_bw: "Peso Corp.", btn_date: "Fecha", btn_country: "País",
        th_athlete: "Atleta", th_country: "País", th_device: "Dispositivo", th_score: "Marca", th_bw: "Peso", th_date: "Fecha", th_video: "Video",
        tab_login: "Entrar", tab_register: "Registrarse", btn_enter: "Entrar", btn_register: "Crear Cuenta",
        upload_header: "Registrar Marca", lbl_device: "Dinamómetro", lbl_score: "Marca (KG)", lbl_bw: "Peso (KG)", lbl_video: "Video Link", btn_submit: "Guardar",
        ph_email: "Correo Electrónico", ph_pass: "Contraseña", ph_name: "Nombre y Apellidos", ph_country: "País (Código ISO: ES, MX...)",
        ph_video: "Enlace de Youtube (Opcional)",
        lbl_country: "PAÍS", lbl_best_score: "MEJOR MARCA", lbl_current_bw: "PESO", lbl_rank_global: "RANK GLOBAL",
        btn_edit_profile: "EDITAR PERFIL", btn_back_ranking: "VOLVER AL RANKING", title_history: "HISTORIAL DE AGARRE",
        modal_edit_title: "EDITAR PERFIL", lbl_edit_photo: "Foto de Perfil", lbl_edit_bw: "Peso Corporal (KG)", lbl_edit_bio: "Descripción / Bio",
        ph_bio: "Ej: Armwrestler, Escalador...", btn_save_changes: "GUARDAR CAMBIOS"
    },
    en: {
        login: "Login", upload: "Add Score",
        hero_title: 'GRIP<span class="highlight">ZONE</span> RANKING',
        hero_subtitle: "WORLDWIDE STRENGTH DATABASE",
        sort_by: "Sort by:", btn_score: "Score", btn_bw: "Bodyweight", btn_date: "Date", btn_country: "Country",
        th_athlete: "Athlete", th_country: "Country", th_device: "Device", th_score: "Score", th_bw: "Weight", th_date: "Date", th_video: "Video",
        tab_login: "Login", tab_register: "Register", btn_enter: "Log In", btn_register: "Sign Up",
        upload_header: "New Record", lbl_device: "Dynamometer", lbl_score: "Score (KG)", lbl_bw: "BW (KG)", lbl_video: "Video Link", btn_submit: "Save",
        ph_email: "Email Address", ph_pass: "Password", ph_name: "Full Name", ph_country: "Country Code (US, UK...)",
        ph_video: "YouTube Link (Optional)",
        lbl_country: "COUNTRY", lbl_best_score: "BEST SCORE", lbl_current_bw: "WEIGHT", lbl_rank_global: "GLOBAL RANK",
        btn_edit_profile: "EDIT PROFILE", btn_back_ranking: "BACK TO RANKING", title_history: "GRIP HISTORY",
        modal_edit_title: "EDIT PROFILE", lbl_edit_photo: "Profile Photo", lbl_edit_bw: "Body Weight (KG)", lbl_edit_bio: "Description / Bio",
        ph_bio: "Ex: Armwrestler, Climber...", btn_save_changes: "SAVE CHANGES"
    },
    ru: {
        login: "Войти", upload: "Добавить",
        hero_title: 'GRIP<span class="highlight">ZONE</span> РЕЙТИНГ',
        hero_subtitle: "МИРОВАЯ БАЗА ДАННЫХ",
        sort_by: "Сортировка:", btn_score: "Результат", btn_bw: "Вес тела", btn_date: "Дата", btn_country: "Страна",
        th_athlete: "Атлет", th_country: "Страна", th_device: "Прибор", th_score: "Результат", th_bw: "Вес", th_date: "Дата", th_video: "Видео",
        tab_login: "Вход", tab_register: "Регистрация", btn_enter: "Войти", btn_register: "Создать аккаунт",
        upload_header: "Новый рекорд", lbl_device: "Динамометр", lbl_score: "Результат (КГ)", lbl_bw: "Вес (КГ)", lbl_video: "Ссылка на видео", btn_submit: "Сохранить",
        ph_email: "Электронная почта", ph_pass: "Пароль", ph_name: "Полное имя", ph_country: "Код страны (RU, KZ...)",
        ph_video: "Ссылка на YouTube (Необязательно)",
        lbl_country: "СТРАНА", lbl_best_score: "ЛУЧШИЙ", lbl_current_bw: "ВЕС ТЕЛА", lbl_rank_global: "РЕЙТИНГ",
        btn_edit_profile: "РЕДАКТИРОВАТЬ", btn_back_ranking: "НАЗАД В РЕЙТИНГ", title_history: "ИСТОРИЯ",
        modal_edit_title: "РЕДАКТИРОВАТЬ", lbl_edit_photo: "Фото профиля", lbl_edit_bw: "Вес тела (КГ)", lbl_edit_bio: "Описание",
        ph_bio: "Пример: Армрестлер...", btn_save_changes: "СОХРАНИТЬ"
    },
    cn: {
        login: "登录", upload: "上传成绩",
        hero_title: 'GRIP<span class="highlight">ZONE</span> 排名',
        hero_subtitle: "全球握力数据库",
        sort_by: "排序方式:", btn_score: "分数", btn_bw: "体重", btn_date: "日期", btn_country: "国家",
        th_athlete: "运动员", th_country: "国家", th_device: "设备", th_score: "分数", th_bw: "体重", th_date: "日期", th_video: "视频",
        tab_login: "登录", tab_register: "注册", btn_enter: "进入", btn_register: "创建账户",
        upload_header: "新记录", lbl_device: "测力计", lbl_score: "分数 (KG)", lbl_bw: "体重 (KG)", lbl_video: "视频链接", btn_submit: "提交",
        ph_email: "电子邮件", ph_pass: "密码", ph_name: "全名", ph_country: "国家代码 (CN, JP...)",
        ph_video: "YouTube 链接 (可选)",
        lbl_country: "国家", lbl_best_score: "最佳成绩", lbl_current_bw: "体重", lbl_rank_global: "全球排名",
        btn_edit_profile: "编辑资料", btn_back_ranking: "返回排名", title_history: "历史记录",
        modal_edit_title: "编辑资料", lbl_edit_photo: "头像", lbl_edit_bw: "体重 (KG)", lbl_edit_bio: "简介",
        ph_bio: "例如：扳手腕运动员...", btn_save_changes: "保存更改"
    }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    fetchRecords();
    updateAuthUI();
    setupEventListeners();
    setupLanguage();
});

// --- NAVIGATION ---
function goHome() {
    document.getElementById('profile-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('global-ranking-view').classList.remove('hidden');
    fetchRecords();
}

async function loadProfile(email) {
    currentProfileEmail = email;
    try {
        const res = await fetch(`${API_URL}/get-profile`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
        });

        if (!res.ok) throw new Error('Error en servidor');
        const data = await res.json();

        // SEGURIDAD
        const safeBW = data.bw || 0;
        const safeBestScore = data.bestScore || 0;

        // UI Fill
        document.getElementById('profile-name').textContent = data.name;
        document.getElementById('profile-country').innerHTML = `<img src="https://flagcdn.com/${data.country.toLowerCase()}.svg" class="flag-icon"> ${data.country}`;
        document.getElementById('profile-bio').textContent = data.bio;
        document.getElementById('profile-best').textContent = safeBestScore.toFixed(2);
        document.getElementById('profile-rank-badge').textContent = data.globalRank === '-' ? '-' : '#' + data.globalRank;
        document.getElementById('profile-bw-display').textContent = safeBW.toFixed(1);

        const avatarImg = document.getElementById('profile-avatar');
        avatarImg.src = data.avatar ? data.avatar : 'https://via.placeholder.com/300x400/111/444?text=NO+IMAGE';

        const instaBtn = document.getElementById('link-insta');
        const ytBtn = document.getElementById('link-yt');

        if (data.instagram) { instaBtn.href = data.instagram; instaBtn.classList.remove('hidden'); }
        else instaBtn.classList.add('hidden');

        if (data.youtube) { ytBtn.href = data.youtube; ytBtn.classList.remove('hidden'); }
        else ytBtn.classList.add('hidden');

        const editBtn = document.getElementById('editProfileBtn');
        if (currentUser && currentUser.email === email) {
            editBtn.classList.remove('hidden');
            document.getElementById('editBio').value = data.bio || '';
            document.getElementById('editInsta').value = data.instagram || '';
            document.getElementById('editYt').value = data.youtube || '';
            document.getElementById('editBwInput').value = safeBW;
        } else {
            editBtn.classList.add('hidden');
        }

        renderBadges(safeBestScore, safeBW, data.history || []);
        renderChart(data.history || []);
        renderPersonalTable(data.history || []);

        document.getElementById('global-ranking-view').classList.add('hidden');
        document.getElementById('admin-view').classList.add('hidden');
        document.getElementById('profile-view').classList.remove('hidden');
        window.scrollTo(0, 0);

    } catch (err) {
        console.error("Error loading profile", err);
    }
}

// --- BADGES ---
function renderBadges(bestScore, bw, history) {
    const container = document.getElementById('badges-container');
    container.innerHTML = '';
    const badges = [];

    // 1. FUERZA ABSOLUTA
    if (bestScore > 0) {
        if (bestScore >= 120) { badges.push({ icon: 'fa-khanda', text: '120KG+ HYDRAULIC', class: 'mythic' }); }
        else if (bestScore >= 110) { badges.push({ icon: 'fa-dumbbell', text: '110KG TITAN', class: 'mythic' }); }
        else if (bestScore >= 100) { badges.push({ icon: 'fa-certificate', text: '100KG CENTURY CLUB', class: 'diamond' }); }
        else if (bestScore >= 90) { badges.push({ icon: 'fa-dragon', text: '90KG BEAST', class: 'diamond' }); }
        else if (bestScore >= 80) { badges.push({ icon: 'fa-fist-raised', text: '80KG VICE GRIP', class: 'gold' }); }
        else if (bestScore >= 70) { badges.push({ icon: 'fa-hand-rock', text: '70KG IRON HAND', class: 'gold' }); }
        else if (bestScore >= 60) { badges.push({ icon: 'fa-lock', text: '60KG LOCKED', class: 'silver' }); }
        else if (bestScore >= 50) { badges.push({ icon: 'fa-user', text: '50KG AVERAGE JOE', class: 'bronze' }); }
        else if (bestScore >= 40) { badges.push({ icon: 'fa-seedling', text: '40KG ROOKIE', class: 'bronze' }); }
        else { badges.push({ icon: 'fa-baby', text: 'BABY GRIP', class: 'trash' }); }
    }

    // 2. FUERZA RELATIVA
    if (bw > 0 && bestScore > 0) {
        const ratio = bestScore / bw;
        if (ratio >= 2.0) { badges.push({ icon: 'fa-spider', text: 'THE SPIDER (2.0x)', class: 'mythic' }); }
        else if (ratio >= 1.9) { badges.push({ icon: 'fa-dragon', text: 'THE T-REX (1.9x)', class: 'mythic' }); }
        else if (ratio >= 1.8) { badges.push({ icon: 'fa-pastafarianism', text: 'THE CRAB (1.8x)', class: 'diamond' }); }
        else if (ratio >= 1.7) { badges.push({ icon: 'fa-dumbbell', text: 'THE GORILLA (1.7x)', class: 'diamond' }); }
        else if (ratio >= 1.6) { badges.push({ icon: 'fa-feather-alt', text: 'THE EAGLE (1.6x)', class: 'gold' }); }
        else if (ratio >= 1.5) { badges.push({ icon: 'fa-bug', text: 'THE ANT (1.5x)', class: 'gold' }); }
        else if (ratio >= 1.4) { badges.push({ icon: 'fa-monument', text: 'THE CHIMP (1.4x)', class: 'gold' }); }
        else if (ratio >= 1.3) { badges.push({ icon: 'fa-staff-snake', text: 'THE PYTHON (1.3x)', class: 'silver' }); }
        else if (ratio >= 1.2) { badges.push({ icon: 'fa-cat', text: 'THE LEOPARD (1.2x)', class: 'silver' }); }
        else if (ratio >= 1.1) { badges.push({ icon: 'fa-dog', text: 'THE BULLDOG (1.1x)', class: 'silver' }); }
        else if (ratio >= 1.0) { badges.push({ icon: 'fa-wolf-pack-battalion', text: 'THE WOLF (1.0x)', class: 'bronze' }); }
        else if (ratio >= 0.9) { badges.push({ icon: 'fa-cat', text: 'THE CAT (0.9x)', class: 'bronze' }); }
        else if (ratio >= 0.8) { badges.push({ icon: 'fa-tree', text: 'THE SQUIRREL (0.8x)', class: 'bronze' }); }
        else if (ratio >= 0.7) { badges.push({ icon: 'fa-leaf', text: 'THE KOALA (0.7x)', class: 'trash' }); }
        else if (ratio >= 0.6) { badges.push({ icon: 'fa-bed', text: 'THE SLOTH (0.6x)', class: 'trash' }); }
        else { badges.push({ icon: 'fa-water', text: 'JELLYFISH (<0.6x)', class: 'trash' }); }
    }

    if (history.length > 0) { badges.push({ icon: 'fa-flag-checkered', text: 'DEBUT', class: 'silver' }); }
    if (history.length >= 10) { badges.push({ icon: 'fa-medal', text: 'VETERAN', class: 'gold' }); }
    else if (history.length >= 5) { badges.push({ icon: 'fa-star', text: 'CONSISTENT', class: 'bronze' }); }

    badges.forEach(b => {
        const div = document.createElement('div');
        div.className = `badge ${b.class}`;
        div.innerHTML = `<i class="fas ${b.icon}"></i> ${b.text}`;
        div.title = b.text;
        container.appendChild(div);
    });
}

// --- CHART ---
function renderChart(history) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    const chartData = [...history].sort((a, b) => {
        if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
        return new Date(a.date) - new Date(b.date);
    });

    if (chartData.length === 0) chartData.push({ date: 'Start', score: 0 });
    const labels = chartData.map(d => d.date);
    const dataPoints = chartData.map(d => d.score);

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Fuerza (KG)',
                data: dataPoints,
                borderColor: '#F4C430',
                backgroundColor: 'rgba(244, 196, 48, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#F4C430',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(0,0,0,0.9)', titleColor: '#F4C430', bodyColor: '#fff', borderColor: '#333', borderWidth: 1 } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' }, beginAtZero: false }
            }
        }
    });
}

function renderPersonalTable(history) {
    const tbody = document.getElementById('personalHistoryBody');
    tbody.innerHTML = '';
    const safeHistory = [...history];
    safeHistory.sort((a, b) => (b.timestamp || b.id) - (a.timestamp || a.id));

    safeHistory.forEach(r => {
        let videoContent = (r.video && r.video.trim() !== '') ? `<a href="${r.video}" target="_blank" class="video-link"><i class="fas fa-play-circle fa-lg"></i></a>` : `<span style="color:#333">-</span>`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="color:var(--text-muted)">${r.date}</td>
            <td style="color:var(--text-main)">${r.device}</td>
            <td class="text-right"><span class="score-val" style="font-size:1.3rem">${parseFloat(r.score).toFixed(2)}</span> kg</td>
            <td class="text-right">${parseFloat(r.bw).toFixed(1)} kg</td>
            <td class="text-center">${videoContent}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- ADMIN FUNCTIONS ---
function loadAdminPanel() {
    document.getElementById('global-ranking-view').classList.add('hidden');
    document.getElementById('profile-view').classList.add('hidden');
    document.getElementById('admin-view').classList.remove('hidden');

    fetch(`${API_URL}/admin/pending`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: currentUser.email })
    })
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('pending-list');
            container.innerHTML = '';
            if (data.length === 0) container.innerHTML = '<p style="text-align:center; color:#666">No hay marcas pendientes.</p>';

            data.forEach(r => {
                const card = document.createElement('div');
                card.className = 'review-card';
                card.innerHTML = `
                <div class="review-info">
                    <h3>${r.name} <small style="font-size:1rem; color:#666">(${r.country})</small></h3>
                    <p><span class="highlight">${r.score} kg</span> en ${r.device} (BW: ${r.bw})</p>
                    <p style="margin-top:5px;"><a href="${r.video}" target="_blank" style="color:#F4C430">Ver Video <i class="fas fa-external-link-alt"></i></a></p>
                </div>
                <div class="review-actions">
                    <button class="btn-approve" onclick="verifyRecord(${r.id}, 'approve')"><i class="fas fa-check"></i> APROBAR</button>
                    <button class="btn-reject" onclick="verifyRecord(${r.id}, 'reject')"><i class="fas fa-times"></i> RECHAZAR</button>
                </div>
            `;
                container.appendChild(card);
            });
        });
}

async function verifyRecord(recordId, action) {
    if (!confirm(`¿Seguro que quieres ${action} esta marca?`)) return;
    const res = await fetch(`${API_URL}/admin/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: currentUser.email, recordId, action })
    });
    const result = await res.json();
    if (result.success) { loadAdminPanel(); } else { alert('Error'); }
}

// --- UTILS & API ---
async function updateProfile(data) {
    const res = await fetch(`${API_URL}/profile/update`, { method: 'POST', body: data });
    return res.json();
}
async function fetchRecords() {
    try {
        const res = await fetch(`${API_URL}/records`);
        if (res.ok) { records = await res.json(); applySort(); }
    } catch (e) { console.error("Server offline?"); }
}
async function registerUser(data) {
    const res = await fetch(`${API_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
}
async function loginUser(data) {
    const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
}
async function uploadRecord(data) {
    const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, userEmail: currentUser.email }) });
    return res.json();
}

// --- GLOBAL TABLE ---
function renderTable() {
    const tbody = document.getElementById('rankingBody');
    tbody.innerHTML = '';
    const now = Date.now();
    const MS_IN_48H = 48 * 60 * 60 * 1000;

    records.forEach((r, index) => {
        let newPrBadge = (r.timestamp && (now - r.timestamp < MS_IN_48H)) ? '<span class="new-pr">NEW PR</span>' : '';

        let verifiedBadge = '';
        if (r.status === 'verified') {
            verifiedBadge = '<i class="fas fa-check-circle verified-icon" title="Verificado"></i>';
        } else if (currentUser && r.email === currentUser.email) {
            verifiedBadge = '<span class="pending-text">(Pendiente)</span>';
        }

        let videoContent = (r.video && r.video.trim() !== '') ? `<a href="${r.video}" target="_blank" class="video-link"><i class="fas fa-play-circle fa-lg"></i></a>` : `<span style="color:#333">-</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="th-rank">${index + 1}</td>
            <td>
                <div class="profile-link hover-slide" onclick="loadProfile('${r.email}')">${r.name} ${verifiedBadge}</div>
            </td>
            <td><img src="https://flagcdn.com/${r.country.toLowerCase()}.svg" class="flag-icon"> ${r.country}</td>
            <td><span class="device-tag">${r.device}</span></td>
            <td class="text-right"><span class="score-val">${parseFloat(r.score).toFixed(2)}</span><span class="unit-small">kg</span>${newPrBadge}</td>
            <td class="text-right text-muted">${parseFloat(r.bw).toFixed(1)}<span class="unit-small">kg</span></td>
            <td class="text-right text-muted" style="font-size:0.9rem">${r.date}</td>
            <td class="text-center">${videoContent}</td>
        `;
        tbody.appendChild(tr);
    });
}

function applySort() {
    const { key, order } = sortState;
    records.sort((a, b) => {
        let valA = a[key], valB = b[key];
        if (key === 'country') return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        else if (key === 'date') return order === 'asc' ? new Date(valA) - new Date(valB) : new Date(valB) - new Date(valA);
        else return order === 'asc' ? valA - valB : valB - valA;
    });
    renderTable();
}

function handleSortClick(key) {
    if (sortState.key === key) sortState.order = sortState.order === 'asc' ? 'desc' : 'asc';
    else { sortState.key = key; sortState.order = 'desc'; }
    applySort();
}

// --- LISTENERS ---
function setupEventListeners() {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => handleSortClick(btn.dataset.sort)));

    const authModal = document.getElementById('authModal');
    const uploadModal = document.getElementById('uploadModal');
    const editProfileModal = document.getElementById('editProfileModal');

    document.getElementById('loginBtn').onclick = () => authModal.classList.remove('hidden');
    document.getElementById('uploadBtn').onclick = () => uploadModal.classList.remove('hidden');
    document.getElementById('editProfileBtn').onclick = () => editProfileModal.classList.remove('hidden');

    document.querySelectorAll('.close-modal').forEach(btn => btn.onclick = () => {
        authModal.classList.add('hidden');
        uploadModal.classList.add('hidden');
        editProfileModal.classList.add('hidden');
    });

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
            document.getElementById(tab.dataset.tab).classList.remove('hidden');
            document.getElementById(tab.dataset.tab).classList.add('active');
        }
    });

    document.getElementById('userNameDisplay').onclick = () => {
        if (currentUser) loadProfile(currentUser.email);
    };

    // EDIT PROFILE SUBMIT
    document.getElementById('edit-profile-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('email', currentUser.email);
        formData.append('bio', document.getElementById('editBio').value);
        formData.append('instagram', document.getElementById('editInsta').value);
        formData.append('youtube', document.getElementById('editYt').value);
        formData.append('bw', document.getElementById('editBwInput').value);

        const fileInput = document.getElementById('editAvatar');
        if (fileInput.files.length > 0) {
            formData.append('avatar', fileInput.files[0]);
        }

        try {
            const res = await updateProfile(formData);
            if (res.success) {
                editProfileModal.classList.add('hidden');
                loadProfile(currentUser.email);
            } else {
                alert('Error actualizando perfil');
            }
        } catch (err) { console.error(err); }
    };

    document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const res = await loginUser({ email: document.getElementById('loginEmail').value, password: document.getElementById('loginPass').value });
        if (res.success) { currentUser = res.user; localStorage.setItem('gripzone_user', JSON.stringify(currentUser)); updateAuthUI(); authModal.classList.add('hidden'); }
        else alert(res.error);
    };
    document.getElementById('register-form').onsubmit = async (e) => {
        e.preventDefault();
        const res = await registerUser({ name: document.getElementById('regName').value, country: document.getElementById('regCountry').value.toUpperCase(), email: document.getElementById('regEmail').value, password: document.getElementById('regPass').value });
        if (res.success) { currentUser = res.user; localStorage.setItem('gripzone_user', JSON.stringify(currentUser)); updateAuthUI(); authModal.classList.add('hidden'); }
        else alert(res.error);
    };
    document.getElementById('upload-form').onsubmit = async (e) => {
        e.preventDefault();
        const res = await uploadRecord({ device: document.getElementById('upDevice').value, score: document.getElementById('upScore').value, bw: document.getElementById('upBw').value, video: document.getElementById('upVideo').value });
        if (res.success) { uploadModal.classList.add('hidden'); fetchRecords(); alert('Marca subida (Pendiente de Verificación)!'); if (currentProfileEmail === currentUser.email) loadProfile(currentUser.email); }
        else alert('Error');
    };
    document.getElementById('logoutBtn').onclick = () => { currentUser = null; localStorage.removeItem('gripzone_user'); updateAuthUI(); goHome(); };
}

function updateAuthUI() {
    if (currentUser) {
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('userInfo').classList.remove('hidden');
        document.getElementById('userNameDisplay').textContent = currentUser.name;

        // MOSTRAR BOTÓN ADMIN
        if (currentUser.role === 'admin') {
            document.getElementById('adminBtn').classList.remove('hidden');
            document.getElementById('adminBtn').onclick = loadAdminPanel;
        } else {
            document.getElementById('adminBtn').classList.add('hidden');
        }
    } else {
        document.getElementById('loginBtn').classList.remove('hidden');
        document.getElementById('userInfo').classList.add('hidden');
    }
}
function setupLanguage() {
    const langSelect = document.getElementById('langSelect');
    const setLang = (lang) => {
        const t = translations[lang] || translations['es'];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.innerHTML = t[key];
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (t[key]) el.placeholder = t[key];
        });
    };
    langSelect.addEventListener('change', (e) => setLang(e.target.value));
    setLang('es');
}