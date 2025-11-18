// ==============================
// ANIMAZIONE CARD (Why Section)
// ==============================
const cards = document.querySelectorAll('.why-card');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.3 });

cards.forEach(card => observer.observe(card));



// =====================================================
// MAPPE GLOBALI (STATIC TABLES)
// =====================================================
const citiesMap = new Map();        // cityId -> name
const emptypesMap = new Map();      // emptypeId -> name
const skillsMap = new Map();        // skillId -> name

// Per i job openings
let allJobs = [];                   // conterrà i job originali
let jobSkillsMap = new Map();       // jobOpeningId -> array(skillId)



// =====================================================
// LOAD STATIC DATA (CITIES, EMPTYPES, SKILLS)
// =====================================================

// -------- CITIES --------
async function loadCities() {
    try {
        const res = await fetch('servlet/cities');
        const json = await res.json();
        const cities = json.data || [];

        citiesMap.clear();
        cities.forEach(c => citiesMap.set(String(c.cityId), c.name));

        // filtro città
        const filterCity = document.getElementById('filterCity');
        if (filterCity) {
            filterCity.innerHTML = '<option value="">Sede (Tutte)</option>';
            cities.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.cityId;
                opt.textContent = c.name;
                filterCity.appendChild(opt);
            });
        }

        // select registrazione
        const registerCity = document.getElementById('registerCity');
        if (registerCity) {
            registerCity.innerHTML = '<option value="">Seleziona città</option>';
            cities.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.cityId;
                opt.textContent = c.name;
                registerCity.appendChild(opt);
            });
        }

    } catch (err) {
        console.error("Errore loadCities:", err);
    }
}



// -------- EMPLOYMENT TYPES --------
async function loadEmptypes() {
    try {
        const res = await fetch('servlet/emptypes');
        const json = await res.json();
        const types = json.data || [];

        emptypesMap.clear();
        types.forEach(t => emptypesMap.set(String(t.emptypeId), t.name));

        const filterContract = document.getElementById('filterContract');
        if (filterContract) {
            filterContract.innerHTML = '<option value="">Contratto (Tutti)</option>';
            types.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.emptypeId;
                opt.textContent = t.name;
                filterContract.appendChild(opt);
            });
        }

    } catch (err) {
        console.error("Errore loadEmptypes:", err);
    }
}



// -------- SKILLS --------
async function loadSkills() {
    try {
        const res = await fetch('servlet/skills');
        const json = await res.json();
        const skills = json.data || [];

        skillsMap.clear();
        skills.forEach(s => skillsMap.set(String(s.skillId), s.name));

        // filtro skill
        const filterSkill = document.getElementById('filterSkill');
        if (filterSkill) {
            filterSkill.innerHTML = '<option value="">Skill (Tutte)</option>';
            skills.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.skillId;
                opt.textContent = s.name;
                filterSkill.appendChild(opt);
            });
        }

    } catch (err) {
        console.error("Errore loadSkills:", err);
    }
}



// =============================================================
// LOAD JOBS + JOIN SKILLS
// =============================================================
async function loadJobSkills() {
    try {
        const res = await fetch('servlet/jobopeningsskills');
        const json = await res.json();
        const list = json.data || [];

        jobSkillsMap.clear();

        list.forEach(entry => {
            const jobId = String(entry.jobOpeningId);
            const skillId = String(entry.skillId);

            if (!jobSkillsMap.has(jobId)) jobSkillsMap.set(jobId, []);
            jobSkillsMap.get(jobId).push(skillId);
        });

    } catch (err) {
        console.error("Errore loadJobSkills:", err);
    }
}



// ---------------- JOB OPENINGS ----------------
async function loadJobs() {
    try {
        const res = await fetch('servlet/jobopenings');
        const json = await res.json();
        allJobs = json.data || [];

        // conta posizioni initiali
        const count = allJobs.length;
        const pill = document.getElementById('homeJobsCountPill');
        const card = document.getElementById('homeJobsCountCard');
        if (pill) pill.textContent = count;
        if (card) card.textContent = count;

        // render cards
        renderJobs(allJobs);

    } catch (err) {
        console.error("Errore loadJobs:", err);
    }
}



// =============================================================
// RENDER CARD LAVORO
// =============================================================
function cardJob(job) {

    const cityName = citiesMap.get(String(job.cityId)) || 'N/D';
    const emptypeName = emptypesMap.get(String(job.emptypeId)) || 'N/D';

    const jobId = String(job.jobOpeningId);
    const skillIds = jobSkillsMap.get(jobId) || [];
    const skillNames = skillIds.map(id => skillsMap.get(id)).filter(Boolean);

    return `
        <div class="col-md-6 col-lg-4 job-card"
            data-id="${jobId}"
            data-city="${job.cityId}"
            data-contract="${job.emptypeId}"
            data-skills="${skillIds.join(',')}">

          <div class="card h-100 p-4">

            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="mb-1">${job.title}</h5>
              <span class="badge rounded-pill bg-light text-primary small">${emptypeName}</span>
            </div>

            <div class="text-muted small mb-2">
              <i class="bi bi-geo-alt"></i> ${cityName}
            </div>

            <p class="mb-3 text-muted small">${job.description}</p>

            <div class="small mb-3">
              <strong>Skill richieste:</strong><br>
              ${skillNames.length > 0 ? skillNames.join(', ') : 'Nessuna'}
            </div>

            <div class="d-flex justify-content-between align-items-center mt-auto">
              <div class="small text-muted">
                <i class="bi bi-wallet2"></i> ${job.ralFrom} - ${job.ralTo}
              </div>

              <button class="btn btn-sm btn-primary" onclick="openApplyModal('${job.title}')">
                Candidati
              </button>
            </div>

          </div>
        </div>`;
}



// =============================================================
// STAMPA JOBS NEL GRID
// =============================================================
function renderJobs(list) {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;

    grid.innerHTML = list.map(job => cardJob(job)).join("");
    updateJobsCount();
}



// =============================================================
// FILTRI (skill, city, contract, ricerca)
// =============================================================
function filterJobs() {

    const search = (document.getElementById('jobSearch')?.value || '').toLowerCase();
    const fSkill = document.getElementById('filterSkill')?.value || '';
    const fCity = document.getElementById('filterCity')?.value || '';
    const fContract = document.getElementById('filterContract')?.value || '';

    const cards = document.querySelectorAll('.job-card');

    cards.forEach(card => {

        const title = card.querySelector('h5').textContent.toLowerCase();
        const city = card.dataset.city;
        const contract = card.dataset.contract;
        const skills = card.dataset.skills.split(',');

        const matchSearch = search ? title.includes(search) : true;
        const matchCity = fCity ? (city === fCity) : true;
        const matchContract = fContract ? (contract === fContract) : true;

        // skill: un job può avere più skill → se la skill scelta è nei suoi skill
        const matchSkill = fSkill ? skills.includes(fSkill) : true;

        if (matchSearch && matchCity && matchContract && matchSkill) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });

    updateJobsCount();
}



// =============================================================
// UPDATE COUNTER
// =============================================================
function updateJobsCount() {
    const cards = document.querySelectorAll('.job-card');
    const visible = [...cards].filter(c => c.style.display !== 'none').length;
    const el = document.getElementById('jobsCount');
    if (el) el.textContent = `${visible} opportunità trovate`;
}



// =============================================================
// MODALE CANDIDATURA APPLICAZIONE
// =============================================================
function openApplyModal(role) {
    const modalEl = document.getElementById('registerModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
    else alert("Candidati per: " + role);
}



// =============================================================
// SKILL MANAGER (NO TOUCH)
// =============================================================
function addSkill(inputId, listId) {
    const input = document.getElementById(inputId);
    const val = input.value.trim();
    if (!val) return;

    const ul = document.getElementById(listId);

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = val;

    const closeIcon = document.createElement("span");
    closeIcon.innerHTML = "&times;";
    closeIcon.className = "ms-2 text-danger fw-bold";
    closeIcon.style.cursor = "pointer";

    closeIcon.onclick = () => li.remove();
    li.onclick = () => li.remove();

    li.appendChild(closeIcon);
    ul.appendChild(li);
    input.value = "";
}

if (document.getElementById('addSoftSkillBtn'))
    addSoftSkillBtn.onclick = () => addSkill('softSkillInput', 'softSkillsList');

if (document.getElementById('addHardSkillBtn'))
    addHardSkillBtn.onclick = () => addSkill('hardSkillInput', 'hardSkillsList');



// =============================================================
// REGISTER FORM
// =============================================================
async function handleRegisterSubmit(e) {
    e.preventDefault();

    const firstName = registerFirstName.value.trim();
    const lastName = registerLastName.value.trim();
    const dob = registerDob.value;
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    const cityId = registerCity.value || "";
    const cvFile = registerCv.files[0] || null;

    // Skill da soft+hard
    const skillNames = [
        ...[...softSkillsList.querySelectorAll('li')].map(li => li.childNodes[0].textContent.trim()),
        ...[...hardSkillsList.querySelectorAll('li')].map(li => li.childNodes[0].textContent.trim())
    ];

    // map skill names → skillIds
    const skillIds = [];
    for (const [id, name] of skillsMap.entries()) {
        if (skillNames.map(s => s.toLowerCase()).includes(name.toLowerCase()))
            skillIds.push(id);
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("birthDate", dob);
    formData.append("email", email);
    formData.append("password", password);
    if (cityId) formData.append("cityId", cityId);
    formData.append("skills", JSON.stringify(skillIds));
    if (cvFile) formData.append("cv", cvFile);

    try {
        const res = await fetch('servlet/users', {
            method: "POST",
            body: formData
        });

        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        alert("Registrazione completata! Benvenuto " + json.data.firstName);

        bootstrap.Modal.getOrCreateInstance(registerModal).hide();
        registerForm.reset();
        softSkillsList.innerHTML = "";
        hardSkillsList.innerHTML = "";

    } catch (err) {
        console.error("Errore registrazione:", err);
        alert("Errore: " + err.message);
    }
}

if (document.getElementById("registerForm"))
    registerForm.addEventListener("submit", handleRegisterSubmit);



// =============================================================
// LOGIN FORM
// =============================================================
async function handleLogin(e) {
    e.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    try {
        const res = await fetch("servlet/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const json = await res.json();

        if (!json.success) throw new Error(json.message || "Credenziali errate");

        alert("Benvenuto " + json.data.firstName);
        localStorage.setItem("utenteLoggato", JSON.stringify(json.data));

    } catch (err) {
        console.error("Errore login:", err);
        alert(err.message);
    }
}

if (document.getElementById("loginForm"))
    loginForm.addEventListener("submit", handleLogin);



// =============================================================
// HOME / JOBS SWITCH
// =============================================================
window.showJobsPage = function () {
    homeContent.style.display = "none";
    jobSection.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

window.showHomePage = function () {
    homeContent.style.display = "block";
    jobSection.style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
};



// =============================================================
// DOM READY
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadCities(),
        loadEmptypes(),
        loadSkills(),
        loadJobSkills()
    ]);

    await loadJobs();

    updateJobsCount();
});
