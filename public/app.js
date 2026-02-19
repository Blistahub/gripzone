// --- CONFIG & STATE ---
const API_URL = 'http://localhost:3000/api';
let records = [];
let currentUser = JSON.parse(localStorage.getItem('gripzone_user')) || null;
let currentProfileEmail = null;
let sortState = { key: 'score', order: 'desc' };

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
        // NUEVAS TRADUCCIONES PERFIL
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
        // NEW PROFILE TRANSLATIONS
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
        // NEW PROFILE TRANSLATIONS
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
        // NEW PROFILE TRANSLATIONS
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
    document.getElementById('global-ranking-view').classList.remove('hidden');
    fetchRecords();
}

async function loadProfile(email) {
    currentProfileEmail = email;
    try {
        const res = await fetch(`${API_URL}/get-profile`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
        });
        const data = await res.json();

        // UI Fill
        document.getElementById('profile-name').textContent = data.name;
        document.getElementById('profile-country').innerHTML = `<img src="https://flagcdn.com/${data.country.toLowerCase()}.svg" class="flag-icon"> ${data.country}`;
        document.getElementById('profile-bio').textContent = data.bio;
        document.getElementById('profile-best').textContent = data.bestScore.toFixed(2);
        document.getElementById('profile-rank-badge').textContent = data.globalRank === '-' ? '-' : '#' + data.globalRank;
        document.getElementById('profile-bw-display').textContent = data.bw.toFixed(1); // MOSTRAR PESO

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
            // Pre-rellenar formulario
            document.getElementById('editBio').value = data.bio;
            document.getElementById('editInsta').value = data.instagram;
            document.getElementById('editYt').value = data.youtube;
            document.getElementById('editBwInput').value = data.bw; // Pre-rellenar peso
        } else {
            editBtn.classList.add('hidden');
        }

        renderPersonalTable(data.history);
        document.getElementById('global-ranking-view').classList.add('hidden');
        document.getElementById('profile-view').classList.remove('hidden');
        window.scrollTo(0, 0);

    } catch (err) {
        console.error("Error loading profile", err);
    }
}

function renderPersonalTable(history) {
    const tbody = document.getElementById('personalHistoryBody');
    tbody.innerHTML = '';
    history.sort((a, b) => b.id - a.id);

    history.forEach(r => {
        let videoContent = (r.video && r.video.trim() !== '') ? `<a href="${r.video}" target="_blank" class="video-link"><i class="fas fa-play-circle fa-lg"></i></a>` : `<span style="color:#333">-</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="color:var(--text-muted)">${r.date}</td>
            <td style="color:var(--text-main)">${r.device}</td>
            <td class="text-right"><span class="score-val" style="font-size:1.3rem">${r.score.toFixed(2)}</span> kg</td>
            <td class="text-right">${r.bw} kg</td>
            <td class="text-center">${videoContent}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- UTILS & API ---
const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

async function updateProfile(data) {
    const res = await fetch(`${API_URL}/profile/update`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    return res.json();
}
async function fetchRecords() {
    const res = await fetch(`${API_URL}/records`);
    records = await res.json();
    applySort();
}
// ... (Funciones de registro/login/upload se mantienen igual)
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
        let videoContent = (r.video && r.video.trim() !== '') ? `<a href="${r.video}" target="_blank" class="video-link"><i class="fas fa-play-circle fa-lg"></i></a>` : `<span style="color:#333; font-size:1.2rem;">-</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="th-rank">${index + 1}</td>
            <td>
                <div class="profile-link hover-slide" onclick="loadProfile('${r.email}')">${r.name}</div>
            </td>
            <td><img src="https://flagcdn.com/${r.country.toLowerCase()}.svg" class="flag-icon"> ${r.country}</td>
            <td><span class="device-tag">${r.device}</span></td>
            <td class="text-right"><span class="score-val">${r.score.toFixed(2)}</span><span class="unit-small">kg</span>${newPrBadge}</td>
            <td class="text-right text-muted">${r.bw}<span class="unit-small">kg</span></td>
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
        const fileInput = document.getElementById('editAvatar');
        let avatarBase64 = null;
        if (fileInput.files.length > 0) {
            avatarBase64 = await getBase64(fileInput.files[0]);
        }
        const res = await updateProfile({
            email: currentUser.email,
            bio: document.getElementById('editBio').value,
            instagram: document.getElementById('editInsta').value,
            youtube: document.getElementById('editYt').value,
            bw: document.getElementById('editBwInput').value, // ENVIAR PESO
            avatar: avatarBase64
        });
        if (res.success) {
            editProfileModal.classList.add('hidden');
            loadProfile(currentUser.email);
        } else {
            alert('Error actualizando perfil');
        }
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
        if (res.success) { uploadModal.classList.add('hidden'); fetchRecords(); alert('Marca subida!'); if (currentProfileEmail === currentUser.email) loadProfile(currentUser.email); }
        else alert('Error');
    };
    document.getElementById('logoutBtn').onclick = () => { currentUser = null; localStorage.removeItem('gripzone_user'); updateAuthUI(); goHome(); };
}

function updateAuthUI() {
    if (currentUser) {
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('userInfo').classList.remove('hidden');
        document.getElementById('userNameDisplay').textContent = currentUser.name;
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