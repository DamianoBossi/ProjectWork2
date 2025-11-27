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
const regionsMap = new Map(); // regionId  -> { name, countryId }
const citiesMap = new Map(); // cityId    -> { name, regionId }
const empTypesMap = new Map(); // empTypeId -> name
const skillsMap = new Map(); // skillId   -> name
const workSchedMap = new Map(); // workSchedId -> name 

let allJobs = [];               // tutti i job
let jobSkillsMap = new Map();   // jobOpeningId -> array(skillId)

// array JS con i nomi delle skill inserite nel form
const skillsList = [];


// -------- COUNTRIES --------
async function loadCountries() {
    try {
        const res = await fetch('servlet/countries');
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

// -------- REGIONS --------
async function loadRegions(countryId) {

    const sel = document.getElementById("registerRegion");
    const citySel = document.getElementById("registerCity");

    if (!countryId) {
        sel.innerHTML = `<option value="">Seleziona regione</option>`;
        sel.disabled = true;
        citySel.innerHTML = `<option value="">Seleziona città</option>`;
        citySel.disabled = true;
        return;
    }

    try {
        const res = await fetch(`servlet/regions`);
        const json = await res.json();
        const data = json.data || [];

        regionsMap.clear();
        sel.innerHTML = `<option value="">Seleziona regione</option>`;
        citySel.innerHTML = `<option value="">Seleziona città</option>`;
        citySel.disabled = true;

        data.forEach(r => {
            regionsMap.set(String(r.regionId), {
                name: r.name,
                countryId: String(r.countryId)
            });
        });

        data.forEach(r => {
            if (String(r.countryId) === String(countryId)) {
                const opt = document.createElement("option");
                opt.value = r.regionId;
                opt.textContent = r.name;
                sel.appendChild(opt);
            }
        });

        sel.disabled = false;

    } catch (e) {
        console.error("Errore loadRegions:", e);
    }
}


// -------- CITIES --------
async function loadCities(regionId) {
    try {
        const res = await fetch(`servlet/cities`);
        const json = await res.json();
        const data = json.data || [];

        const citySel = document.getElementById("registerCity");

        citySel.innerHTML = `<option value="">Seleziona città</option>`;
        citySel.disabled = true;

        citiesMap.clear();

        data.forEach(c => {
            citiesMap.set(String(c.cityId), {
                name: c.name,
                regionId: String(c.regionId)
            });
        });

        data.forEach(c => {
            if (String(c.regionId) === String(regionId)) {
                const opt = document.createElement("option");
                opt.value = c.cityId;
                opt.textContent = c.name;
                citySel.appendChild(opt);
            }
        });

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

        if (regionId) citySel.disabled = false;

    } catch (e) {
        console.error("Errore loadCities:", e);
    }
}




// -------- EMPLOYMENT TYPES --------
async function loadEmpTypes() {
    try {
        const res = await fetch('servlet/emptypes');
        const json = await res.json();
        const types = json.data || [];

        empTypesMap.clear();
        types.forEach(t => empTypesMap.set(t.empTypeId, t.name));

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
        console.error("Errore loadEmpTypes:", err);
    }
}

//WORKSCHED 
async function loadWorkSched() {
    try {
        var res = await fetch(`servlet/workscheds`);
        var json = await res.json();
        var data = json.data || [];

        workSchedMap.clear();

        //popolo la mappa degli orari di lavoro
        data.forEach(function (c) {
            workSchedMap.set(String(c.workSchedId), {
                name: c.name
            });
        });

        //popolo la lista degli orari di lavoro della creazione della job opening
        var workSchedjobOpCreate = document.getElementById("workSchedIdjobOpCreate");

        data.forEach(function (c) {
            var opt = document.createElement("option");
            opt.value = c.workSchedId;
            opt.textContent = c.name;
            workSchedjobOpCreate.appendChild(opt);
        });

        //popolo la lista degli orari di lavoro del filtro
        var filterWorkSched = document.getElementById("filterWorkSched");

        data.forEach(function (c) {
            var opt = document.createElement("option");
            opt.value = c.workSchedId;
            opt.textContent = c.name;
            filterWorkSched.appendChild(opt);
        });

    } catch (e) {
        console.error("Errore loadWorkSched:", e);
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
    const emptypeName = empTypesMap.get(job.empTypeId) || 'N/D';

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

        <div class="card h-100 p-4 job-clickable" onclick="openJobDetails('${job.jobOpeningId}')"> 

            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="mb-1">${job.title}</h5>
              <span class="badge rounded-pill bg-light text-primary small">${emptypeName}</span>
            </div>

            <div class="text-muted small mb-2">
              <i class="bi bi-geo-alt"></i> ${cityName.name}
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

                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); openApplyModal('${jobId}')"> 
                    Candidati
                </button>

            </div>

          </div>
        </div>
    `;
}


// =====================================================
// MODALE DETTAGLI JOBS 
// =====================================================
function openJobDetails(jobId) {

    const job = allJobs.find(j => String(j.jobOpeningId) === String(jobId));
    if (!job) return;

    const city = citiesMap.get(String(job.cityId));
    const contract = empTypesMap.get(job.empTypeId);

    const skillIds = jobSkillsMap.get(jobId) || [];
    const skillNames = skillIds.map(id => skillsMap.get(id)).filter(Boolean);
    const workSchedName = workSchedMap.get(String(job.workSchedId))
        ? workSchedMap.get(String(job.workSchedId)).name
        : "N/D";

    document.getElementById("jobDetailTitle").textContent = job.title;
    document.getElementById("jobDetailDescription").textContent = job.description;
    document.getElementById("jobDetailCity").textContent = city ? city.name : "N/D";
    document.getElementById("jobDetailContract").textContent = contract || "N/D";
    document.getElementById("jobDetailRal").textContent = job.ralFrom + " - " + job.ralTo;
    document.getElementById("jobDetailWorkSched").textContent = workSchedName;

    const skillsWrapper = document.getElementById("skillsWrapper");
    const container = document.getElementById("jobDetailSkills");

    container.innerHTML = "";

    skillNames.forEach(s => {
        const pill = document.createElement("span");
        pill.className = "badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2";
        pill.textContent = s;
        container.appendChild(pill);
    });

    if (skillNames.length === 0) {
        skillsWrapper.style.display = "none";
    } else {
        skillsWrapper.style.display = "block";
    }


    document.getElementById("jobDetailApplyBtn").onclick = () => {
        openApplyModal(job.jobOpeningId);
    };

    const modal = new bootstrap.Modal(document.getElementById("jobDetailModal"));
    modal.show();
}


// =====================================================
// APERTURA MODALE CANDIDATURA DA LOGGATO O DA REGISTRATO 
// =====================================================
async function openApplyModal(jobId) {
    // controllo login
    const logged = await checkUserLogged();

    if (!logged) { //SE NON LOGGATO LO MANDO ALLA REGISTRAZIONE
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('registerModal')
        ).show();

        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('jobDetailModal')).hide();

        return;
    }

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById('jobDetailModal')).hide();


    //SE LOGGATO GLI APRO IL MODALE DA LOGGATO
    const job = allJobs.find(j => String(j.jobOpeningId) === String(jobId));
    document.getElementById("applyJobId").value = jobId;
    document.getElementById("applyJobTitle").textContent = job.title;

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById('applyModal')
    ).show();
}



// =====================================================
// SUBMIT APPLY FORM 
// =====================================================
if (document.getElementById("applyForm")) {

    document.getElementById("applyForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const jobId = document.getElementById("applyJobId").value;
        const score = document.getElementById("applyStudio").value;
        const lettera = document.getElementById("applyLettera").value;

        if (!score || !lettera) {
            alert("Compila tutti i campi!");
            return;
        }

        const payload = {
            jobOpeningId: parseInt(jobId, 10),
            score: parseInt(score, 10),
            letter: lettera
        };

        try {
            const res = await fetch("servlet/jobapplications/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (!json.success) {
                throw new Error(json.message || "Errore nell'invio candidatura");
            }

            alert("Candidatura inviata con successo!");

            bootstrap.Modal.getOrCreateInstance(
                document.getElementById("applyModal")
            ).hide();

        } catch (err) {
            console.error("Errore candidatura:", err);
            alert("Errore: " + err.message);
        }
    });
}


// =============================================================
// STAMPA JOBS NEL GRID
// =============================================================
function renderJobs(list) {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;

    // TOLGO ANNUNCI CHIUSI
    list = list.filter(job => job.isOpen == "1");

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
// CHECK USER LOGGED
// =====================================================

async function checkUserLogged() {
    try {
        const res = await fetch('servlet/sessionStatus');
        const json = await res.json();
        return json?.message?.isLogged === true;
    } catch (e) {
        console.error("Errore checkUserLogged:", e);
        return false;
    }
}

// =====================================================
// CHECK ADMIN LOGGED
// =====================================================

async function checkAdminLogged() {
    try {
        const res = await fetch('servlet/sessionStatus');
        const json = await res.json();
        if (json?.message?.isLogged && json?.message?.role == 'admin') {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.error("Errore checkUserLogged:", e);
        return false;
    }
}

function hideButtons() {
    document.getElementById("login-buttons-home").style.display = "none";
    document.getElementById("login-buttons").style.display = "none";
    document.getElementById("profile-btn").style.display = "block";
    document.getElementById("logout-btn").style.display = "block";
    document.getElementById("reg-btn").style.display = "none";
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("candidature-btn").style.display = "block";

}


// =====================================================
// LOGOUT
// =====================================================


if (document.getElementById("logout-btn")) {
    document.getElementById("logout-btn").onclick = async () => {
        try {
            const res = await fetch('servlet/logout', {
                method: "POST"
            });
            if (res.ok) {
                window.location.href = "prova.html";
            }
        } catch (e) {
            console.error("Errore logout:", e);
            alert("Errore durante il logout: " + e.message);
        }
    };
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
                bootstrap.Modal.getOrCreateInstance(document.getElementById("loginModal")).hide();
        
                hideButtons();
        
        
            } catch (e) {
                console.error("Errore login:", e);
                alert(e.message);
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

const loginFromRegister = document.getElementById("login-from-register");

if (loginFromRegister) {
    loginFromRegister.addEventListener("click", () => {
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('registerModal')
        ).hide();
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('loginModal')
        ).show();
    });
}



//Country on change
if (document.getElementById("registerCountry")) {
    registerCountry.onchange = () => {
        const cid = registerCountry.value;
        loadRegions(cid);
    };
}


//Region on change
if (document.getElementById("registerRegion")) {
    registerRegion.onchange = () => {
        const rid = registerRegion.value;
        loadCities(rid);
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
        bootstrap.Modal.getOrCreateInstance(document.getElementById("loginModal")).hide();

        hideButtons();


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

    if (await checkUserLogged()) {
        hideButtons();
    }

    if (await checkAdminLogged()) {
        window.location.href = "admin.html";
        return;
    }

     ;
    await Promise.all([
        loadCountries(),
        loadEmpTypes(),
        loadSkills(),
        loadWorkSched(),
        loadJobSkills(),
        loadCities(),
        loadRegions(),
    ]);

    await loadJobs();



    updateJobsCount();
});
