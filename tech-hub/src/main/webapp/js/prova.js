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
// MAPPE GLOBALI
// =====================================================
const countriesMap = new Map(); // countryId -> { name }
const regionsMap   = new Map(); // regionId  -> { name, countryId }
const citiesMap    = new Map(); // cityId    -> { name, regionId }
const emptypesMap = new Map(); // emptypeId -> name
const skillsMap = new Map(); // skillId   -> name

let allJobs = [];               // tutti i job
let jobSkillsMap = new Map();   // jobOpeningId -> array(skillId)

// array JS con i nomi delle skill inserite nel form
const skillsList = [];


// =====================================================
// LOAD STATIC DATA (CITIES, EMPTYPES, SKILLS)
// =====================================================

// -------- CITIES --------
async function loadCities() {
    try {
        const res = await fetch('servlet/cities');
        const json = await res.json();
        const data = json.data || [];

        countriesMap.clear();

        const sel = document.getElementById("registerCountry");
        if (!sel) return;

        sel.innerHTML = `<option value="">Seleziona paese</option>`;

        data.forEach(c => {
            countriesMap.set(String(c.countryId), c.name);

            const opt = document.createElement("option");
            opt.value = c.countryId;
            opt.textContent = c.name;
            sel.appendChild(opt);
        });

    } catch (e) {
        console.error("Errore loadCountries:", e);
    }
}


// =====================================================
// LOAD REGIONS (filtrate per countryId)
// =====================================================
async function loadRegions(countryId) {
    if (!countryId) {
        const sel = document.getElementById("registerRegion");
        const citySel = document.getElementById("registerCity");
        if (sel) {
            sel.innerHTML = `<option value="">Seleziona regione</option>`;
            sel.disabled = true;
        }
        if (citySel) {
            citySel.innerHTML = `<option value="">Seleziona città</option>`;
            citySel.disabled = true;
        }
        return;
    }

    try {
        const res = await fetch(`servlet/regions?countryId=${countryId}`);
        const json = await res.json();
        const data = json.data || [];

        const sel = document.getElementById("registerRegion");
        if (!sel) return;

        regionsMap.clear();
        sel.innerHTML = `<option value="">Seleziona regione</option>`;

        data.forEach(r => {

            regionsMap.set(String(r.regionId), {
                name: r.name,
                countryId: String(countryId)
            });

            const opt = document.createElement("option");
            opt.value = r.regionId;
            opt.textContent = r.name;
            sel.appendChild(opt);
        });

        sel.disabled = false;

        const citySel = document.getElementById("registerCity");
        if (citySel) {
            citySel.innerHTML = `<option value="">Seleziona città</option>`;
            citySel.disabled = true;
        }

    } catch (e) {
        console.error("Errore loadRegions:", e);
    }
}


// =====================================================
// LOAD CITIES 
// =====================================================
async function loadCities(regionId) {
    try {
        const url = regionId
            ? `servlet/cities?regionId=${regionId}`
            : `servlet/cities`;

        const res = await fetch(url);
        const json = await res.json();
        const data = json.data || [];

        // aggiorno sempre la mappa
        citiesMap.clear();
        data.forEach(c => {
            citiesMap.set(String(c.cityId), {
                name: c.name,
                regionId: String(regionId)
            });

        });

        if (regionId) {
            // registrazione: city sotto regione
            const citySel = document.getElementById("registerCity");
            if (!citySel) return;

            citySel.innerHTML = `<option value="">Seleziona città</option>`;
            data.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.cityId;
                opt.textContent = c.name;
                citySel.appendChild(opt);
            });
            citySel.disabled = false;

        } else {
            // filtri jobs
            const filterCity = document.getElementById("filterCity");
            if (!filterCity) return;

            filterCity.innerHTML = `<option value="">Sede (Tutte)</option>`;
            data.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.cityId;
                opt.textContent = c.name;
                filterCity.appendChild(opt);
            });
        }

    } catch (e) {
        console.error("Errore loadCities:", e);
    }
}



// -------- EMPLOYMENT TYPES --------
async function loadEmptypes() {
    try {
        const res = await fetch('servlet/emptypes');
        const json = await res.json();
        const types = json.data || [];

        emptypesMap.clear();
        types.forEach(t => emptypesMap.set(t.empTypeId, t.name));

        const filterContract = document.getElementById('filterContract');
        if (filterContract) {
            filterContract.innerHTML = '<option value="">Contratto (Tutti)</option>';
            types.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.empTypeId;
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

    } catch (e) {
        console.error("Errore loadJobs:", e);
    }
}



// =============================================================
// RENDER CARD LAVORO
// =============================================================
function cardJob(job) {

    const cityName = citiesMap.get(String(job.cityId)) || 'N/D';
    const emptypeName = emptypesMap.get(job.empTypeId) || 'N/D';

    const jobId = String(job.jobOpeningId);

    const skillIds = jobSkillsMap.get(jobId) || [];
    const skillNames = skillIds
        .map(id => skillsMap.get(id))
        .filter(Boolean);

    return `
        <div class="col-md-6 col-lg-4 job-card"
            data-id="${jobId}"
            data-city="${job.cityId}"
            data-contract="${job.empTypeId}"
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
              <strong>Competenze richieste:</strong>
              ${skillNames.length ? skillNames.join(", ") : "Nessuna specificata"}
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
        </div>
    `;
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


// =====================================================
// FILTRI JOBS
// =====================================================
function filterJobs() {
    const search = (document.getElementById('jobSearch')?.value || '').toLowerCase();
    const fSkill = document.getElementById('filterSkill')?.value || '';
    const fCity = document.getElementById('filterCity')?.value || '';
    const fContract = document.getElementById('filterContract')?.value || '';

    const cards = document.querySelectorAll('.job-card');

    cards.forEach(card => {
        const title = card.querySelector('h5').textContent.toLowerCase();
        const city = card.dataset.city || '';
        const contract = card.dataset.contract || '';
        const skills = card.dataset.skills
            ? card.dataset.skills.split(',').filter(s => s)
            : [];

        const matchSearch = search ? (title.includes(search) || card.textContent.toLowerCase().includes(search)) : true;
        const matchCity = fCity ? (city === fCity) : true;
        const matchContract = fContract ? (contract === fContract) : true;
        const matchSkill = fSkill ? skills.includes(fSkill) : true;

        if (matchSearch && matchCity && matchContract && matchSkill) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });

    updateJobsCount();
}


// =====================================================
// COUNTER JOBS
// =====================================================
function updateJobsCount() {
    const cards = document.querySelectorAll('.job-card');
    const visible = [...cards].filter(c => c.style.display !== 'none').length;
    const el = document.getElementById('jobsCount');
    if (el) el.textContent = `${visible} opportunità trovate`;
}


// =====================================================
// MODALE CANDIDATURA APPLICAZIONE
// =====================================================
function openApplyModal(role) {
    const modalEl = document.getElementById('registerModal');
    if (modalEl) {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    } else {
        alert("Candidati per: " + role);
    }
}


// =====================================================
// GESTIONE SKILLS 
// =====================================================
function addSkill() {
    const input = document.getElementById("skillInput");
    const value = input.value.trim();
    if (!value) return;

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

const addSkillBtn = document.getElementById("addSkillBtn");
if (addSkillBtn) {
    addSkillBtn.onclick = addSkill;
}


// =====================================================
// REGISTER FORM (countryId, regionId, cityId, address, skills[])
// =====================================================
async function handleRegisterSubmit(e) {
    e.preventDefault();

    const firstName = registerFirstName.value.trim();
    const lastName = registerLastName.value.trim();
    const dob = registerDob.value;
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();

    const countryId = registerCountry.value || "";
    const regionId = registerRegion.value || "";
    const cityId = registerCity.value || "";
    const address = registerAddress.value.trim();

    // mappo skillsList (nomi) -> ids basandomi su SKILLS
    const lowerInserted = skillsList.map(s => s.toLowerCase());
    const skillIds = [];
    for (const [id, name] of skillsMap.entries()) {
        if (lowerInserted.includes(name.toLowerCase())) {
            skillIds.push(parseInt(id, 10));
        }
    }

    const payload = {
        firstName,
        lastName,
        birthDate: dob,
        email,
        password,
        countryId: countryId ? parseInt(countryId, 10) : null,
        regionId: regionId ? parseInt(regionId, 10) : null,
        cityId: cityId ? parseInt(cityId, 10) : null,
        address,
        skills: skillIds
    };

    try {
        const res = await fetch('servlet/registration', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const json = await res.json();

        if (!json.success) throw new Error(json.message || "Registrazione fallita");

        alert("Registrazione completata!");

        if (json.redirect) {
            window.location.href = json.redirect;
        }

        registerForm.reset();
        skillsList.length = 0;
        const ul = document.getElementById("skillsList");
        if (ul) ul.innerHTML = "";

        const regModal = document.getElementById('registerModal');
        if (regModal) {
            bootstrap.Modal.getOrCreateInstance(regModal).hide();
        }

    } catch (err) {
        console.error("Errore registrazione:", err);
        alert("Errore: " + err.message);
    }
}

if (document.getElementById("registerForm")) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
}


// =====================================================
// COUNTRY 
// =====================================================
if (document.getElementById("registerCountry")) {
    registerCountry.onchange = () => {
    const cid = registerCountry.value;

    const regionSel = document.getElementById("registerRegion");
    const citySel   = document.getElementById("registerCity");

    regionSel.innerHTML = `<option value="">Seleziona regione</option>`;
    citySel.innerHTML   = `<option value="">Seleziona città</option>`;
    citySel.disabled = true;

    for (const [regionId, obj] of regionsMap.entries()) {
        if (obj.countryId === cid) {
            const opt = document.createElement("option");
            opt.value = regionId;
            opt.textContent = obj.name;
            regionSel.appendChild(opt);
        }
    }

    regionSel.disabled = cid === "";
};

}

if (document.getElementById("registerRegion")) {
    registerRegion.onchange = () => {
    const rid = registerRegion.value;

    const citySel = document.getElementById("registerCity");
    citySel.innerHTML = `<option value="">Seleziona città</option>`;

    for (const [cityId, obj] of citiesMap.entries()) {
        if (obj.regionId === rid) {
            const opt = document.createElement("option");
            opt.value = cityId;
            opt.textContent = obj.name;
            citySel.appendChild(opt);
        }
    }

    citySel.disabled = rid === "";
};

}


// =====================================================
// LOGIN
// =====================================================
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

        if (json.redirect) {
            window.location.href = json.redirect;
        }

        localStorage.setItem("utenteLoggato", JSON.stringify(json.data));

    } catch (e) {
        console.error("Errore login:", e);
        alert(e.message);
    }
}

if (document.getElementById("loginForm")) {
    loginForm.addEventListener("submit", handleLogin);
}



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
        loadCountries(),
        loadEmptypes(),
        loadSkills(),
        loadJobSkills(),
        loadCities()
    ]);

    await loadJobs();

    updateJobsCount();
});
