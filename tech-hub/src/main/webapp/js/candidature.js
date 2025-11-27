    // Logout
    document.getElementById("logoutBtn").addEventListener("click", function () {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      window.location.href = "prova.html";
    });

    
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


//EMPTYPES
async function loadEmpTypes() {
    try {
        var res = await fetch(`servlet/emptypes`);
        var json = await res.json();
        var data = json.data || [];

        empTypesMap.clear();

        //popolo la mappa dei tipi di contratto
        data.forEach(t => empTypesMap.set(t.empTypeId, t.name));

        //popolo la lista di città della creazione della job opening
        var empTypejobOpCreate = document.getElementById("empTypeIdjobOpCreate");

        data.forEach(function(c) {
            var opt = document.createElement("option");
            opt.value = c.empTypeId;
            opt.textContent = c.name;
            empTypejobOpCreate.appendChild(opt);
        });

        //popolo la lista dei tipi di contratto del filtro
        var filterEmpType = document.getElementById("filterEmpType");

        data.forEach(function(c) {
            var opt = document.createElement("option");
            opt.value = c.empTypeId;
            opt.textContent = c.name;
            filterEmpType.appendChild(opt);
        });

    } catch (e) {
        console.error("Errore loadEmpTypes:", e);
    }
}