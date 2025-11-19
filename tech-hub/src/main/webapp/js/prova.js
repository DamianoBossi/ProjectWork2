// =====================================================
// ANIMAZIONE CARD WHY SECTION
// =====================================================
const cards = document.querySelectorAll('.why-card');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.3 });

cards.forEach(card => observer.observe(card));


// =====================================================
// MAPPE GLOBALI
// =====================================================
const countriesMap = new Map(); // countryId -> name
const regionsMap = new Map();   // regionId -> name
const citiesMap = new Map();    // cityId -> name
const skillsMap = new Map();    // skillId -> name

let allJobs = [];
let jobSkillsMap = new Map();


// =====================================================
// LOAD COUNTRIES
// =====================================================
async function loadCountries() {
    try {
        const res = await fetch("servlet/countries");
        const json = await res.json();
        const data = json.data || [];

        countriesMap.clear();

        const sel = document.getElementById("registerCountry");
        sel.innerHTML = `<option value="">Seleziona paese</option>`;

        data.forEach(c => {
            countriesMap.set(String(c.countryId), c.name);

            const opt = document.createElement("option");
            opt.value = c.countryId;
            opt.textContent = c.name;
            sel.appendChild(opt);
        });

    } catch (e) { console.error("Errore loadCountries:", e); }
}


// =====================================================
// LOAD REGIONS 
// =====================================================
async function loadRegions(countryId) {
    if (!countryId) return;

    try {
        const res = await fetch(`servlet/regions?countryId=${countryId}`);
        const json = await res.json();
        const data = json.data || [];

        const sel = document.getElementById("registerRegion");
        sel.innerHTML = `<option value="">Seleziona regione</option>`;

        regionsMap.clear();

        data.forEach(r => {
            regionsMap.set(String(r.regionId), r.name);

            const opt = document.createElement("option");
            opt.value = r.regionId;
            opt.textContent = r.name;
            sel.appendChild(opt);
        });

        sel.disabled = false;
        document.getElementById("registerCity").disabled = true;

    } catch (e) { console.error("Errore loadRegions:", e); }
}


// =====================================================
// LOAD CITIES 
// =====================================================
async function loadCities(regionId) {
    if (!regionId) return;

    try {
        const res = await fetch(`servlet/cities?regionId=${regionId}`);
        const json = await res.json();
        const data = json.data || [];

        const sel = document.getElementById("registerCity");
        sel.innerHTML = `<option value="">Seleziona città</option>`;

        citiesMap.clear();

        data.forEach(c => {
            citiesMap.set(String(c.cityId), c.name);

            const opt = document.createElement("option");
            opt.value = c.cityId;
            opt.textContent = c.name;
            sel.appendChild(opt);
        });

        sel.disabled = false;

    } catch (e) { console.error("Errore loadCities:", e); }
}


// =====================================================
// LOAD SKILLS
// =====================================================
async function loadSkills() {
    try {
        const res = await fetch("servlet/skills");
        const json = await res.json();
        const data = json.data || [];

        skillsMap.clear();

        const filterSkill = document.getElementById("filterSkill");
        filterSkill.innerHTML = `<option value="">Skill (tutte)</option>`;

        data.forEach(s => {
            skillsMap.set(String(s.skillId), s.name);

            const opt = document.createElement("option");
            opt.value = s.skillId;
            opt.textContent = s.name;
            filterSkill.appendChild(opt);
        });

    } catch (e) { console.error("Errore loadSkills:", e); }
}


// =====================================================
// LOAD JOBS + RELATED SKILLS
// =====================================================
async function loadJobSkills() {
    try {
        const res = await fetch("servlet/jobopeningsskills");
        const json = await res.json();
        const data = json.data || [];

        jobSkillsMap.clear();

        data.forEach(row => {
            const jobId = String(row.jobOpeningId);
            if (!jobSkillsMap.has(jobId)) jobSkillsMap.set(jobId, []);
            jobSkillsMap.get(jobId).push(String(row.skillId));
        });

    } catch (e) { console.error("Errore loadJobSkills:", e); }
}


async function loadJobs() {
    try {
        const res = await fetch("servlet/jobopenings");
        const json = await res.json();
        allJobs = json.data || [];

        renderJobs(allJobs);

        document.getElementById("homeJobsCountPill").textContent = allJobs.length;
        document.getElementById("homeJobsCountCard").textContent = allJobs.length;

    } catch (e) { console.error("Errore loadJobs:", e); }
}


// =====================================================
// RENDER CARD
// =====================================================
function cardJob(job) {

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
            <h5>${job.title}</h5>

            <p class="text-muted">${job.description}</p>

            <div class="small mb-3">
              <strong>Competenze richieste:</strong> ${skillNames.length ? skillNames.join(", ") : "N/A"}
            </div>

            <button class="btn btn-primary btn-sm" onclick="openApplyModal('${job.title}')">
                Candidati
            </button>
          </div>
        </div>`;
}

function renderJobs(list) {
    jobsGrid.innerHTML = list.map(j => cardJob(j)).join("");
}


// =====================================================
// SKILLS LIST
// =====================================================
const skillsList = [];

function addSkill() {
    const input = document.getElementById("skillInput");
    const value = input.value.trim();
    if (!value) return;

    skillsList.push(value);

    const ul = document.getElementById("skillsList");
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = value;

    li.onclick = () => {
        const index = skillsList.indexOf(value);
        if (index !== -1) skillsList.splice(index, 1);
        li.remove();
    };

    ul.appendChild(li);
    input.value = "";
}

document.getElementById("addSkillBtn").onclick = addSkill;


// =====================================================
// REGISTER FORM
// =====================================================
async function handleRegisterSubmit(e) {
    e.preventDefault();

    const countryId = registerCountry.value || "";
    const regionId = registerRegion.value || "";
    const cityId   = registerCity.value || "";
    const address  = registerAddress.value.trim();

    const skillIds = [];
    for (const [id, name] of skillsMap.entries()) {
        if (skillsList.map(s => s.toLowerCase()).includes(name.toLowerCase()))
            skillIds.push(id);
    }

    const formData = new FormData();
    formData.append("firstName", registerFirstName.value.trim());
    formData.append("lastName", registerLastName.value.trim());
    formData.append("birthDate", registerDob.value);
    formData.append("email", registerEmail.value.trim());
    formData.append("password", registerPassword.value.trim());

    formData.append("countryId", countryId);
    formData.append("regionId", regionId);
    formData.append("cityId", cityId);
    formData.append("address", address);

    formData.append("skills", JSON.stringify(skillIds));

    if (registerCv.files[0]) {
        formData.append("cv", registerCv.files[0]);
    }

    try {
        const res = await fetch("servlet/users", { method: "POST", body: formData });
        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        alert("Registrazione completata!");
        registerForm.reset();
        skillsList.length = 0;
        skillsList.innerHTML = "";

        bootstrap.Modal.getOrCreateInstance(registerModal).hide();

    } catch (err) {
        alert("Errore: " + err.message);
    }
}

registerForm.addEventListener("submit", handleRegisterSubmit);


// =====================================================
// COUNTRY -> REGION -> CITY EVENTI
// =====================================================
registerCountry.onchange = () => {
    loadRegions(registerCountry.value);
};

registerRegion.onchange = () => {
    loadCities(registerRegion.value);
};


// =====================================================
// LOGIN
// =====================================================
async function handleLogin(e) {
    e.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
        const res = await fetch("servlet/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        alert("Benvenuto " + json.data.firstName);

    } catch (e) { alert(e.message); }
}

loginForm.addEventListener("submit", handleLogin);


// =====================================================
// SWITCH HOME/JOBS
// =====================================================
window.showJobsPage = function () {
    homeContent.style.display = "none";
    jobSection.style.display = "block";
};

window.showHomePage = function () {
    homeContent.style.display = "block";
    jobSection.style.display = "none";
};


// =====================================================
// DOM READY
// =====================================================
document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadCountries(),
        loadSkills(),
        loadJobSkills()
    ]);

    await loadJobs();
});
