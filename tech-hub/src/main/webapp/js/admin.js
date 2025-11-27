//TODO: METTERE CONTROLLI FRONTEND PER VERIFICARE CHE LE COSE INSERITE NELLA CREAZIONE DELLA JOB OP SIANO SENSATE

var allJobOpenings = [];

//MAPPE GLOBALI
var skillsMap = new Map(); // skillId -> name 
var citiesMap = new Map(); // cityId -> name 
var empTypesMap = new Map(); // emptypeId -> name 
var workSchedMap = new Map(); // workSchedId -> name 
var skillsMap = new Map(); // skillId   -> name

let allJobs = [];               // tutti i job
let jobSkillsMap = new Map();   // jobOpeningId -> array(skillId)

//array JS con gli id delle skill inserite nel form
var skillsList = [];

//SKILLS
async function loadSkills() {
    try {
        var res = await fetch(`servlet/skills`);
        var json = await res.json();
        var skills = json.data || [];

        skillsMap.clear();

        //popolo la mappa delle skill   
        skillsMap.clear();
        skills.forEach(s => skillsMap.set(String(s.skillId), s.name));

        //popolo la lista di città della creazione della job opening
        var skillsjobOpCreate = document.getElementById("skillsjobOpCreate");

        skills.forEach(function(c) {
            var opt = document.createElement("option");
            opt.value = c.skillId;
            opt.textContent = c.name;
            skillsjobOpCreate.appendChild(opt);
        });

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
    } catch (e) { 
        console.error("Errore loadSkills:", e); 
    }
}

//CITIES
async function loadCities() {
    try {
        var res = await fetch(`servlet/cities`);
        var json = await res.json();
        var data = json.data || [];

        citiesMap.clear();

        //popolo la mappa delle città
        data.forEach(function(c) {
            citiesMap.set(c.cityId, {
                name: c.name
            });
        });

        //popolo la lista di città della creazione della job opening
        var cityjobOpCreate = document.getElementById("cityIdjobOpCreate");

        data.forEach(function(c) {
            var opt = document.createElement("option");
            opt.value = c.cityId;
            opt.textContent = c.name;
            cityjobOpCreate.appendChild(opt);
        });

        //popolo la lista di città del filtro delle città
        var filterCity = document.getElementById("filterCity");

        data.forEach(function(c) {
            var opt = document.createElement("option");
            opt.value = c.cityId;
            opt.textContent = c.name;
            filterCity.appendChild(opt);
        });

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

//WORKSCHED
async function loadWorkSched() {
    try {
        var res = await fetch(`servlet/workscheds`);
        var json = await res.json();
        var data = json.data || [];

        workSchedMap.clear();

        //popolo la mappa degli orari di lavoro
        data.forEach(function(c) {
            workSchedMap.set(String(c.workSchedId), {
                name: c.name
            });
        });

        //popolo la lista degli orari di lavoro della creazione della job opening
        var workSchedjobOpCreate = document.getElementById("workSchedIdjobOpCreate");

        data.forEach(function(c) {
            var opt = document.createElement("option");
            opt.value = c.workSchedId;
            opt.textContent = c.name;
            workSchedjobOpCreate.appendChild(opt);
        });

        //popolo la lista degli orari di lavoro del filtro
        var filterWorkSched = document.getElementById("filterWorkSched");

        data.forEach(function(c) {
            var opt = document.createElement("option");
            opt.value = c.workSchedId;
            opt.textContent = c.name;
            filterWorkSched.appendChild(opt);
        });

    } catch (e) {
        console.error("Errore loadWorkSched:", e);
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




//STAMPA ANNUNCI


// =====================================================
// COUNTER JOBS
// =====================================================
function updateJobsCount() {
    const cards = document.querySelectorAll('.job-card');
    const visible = [...cards].filter(c => c.style.display !== 'none').length;
    const el = document.getElementById('jobsCount');
    if (el) el.textContent = `${visible} opportunità trovate`;
}


// =============================================================
// RENDER CARD LAVORO
// =============================================================
function cardJob(job) {

    const cityName = citiesMap.get(parseInt(job.cityId)) || 'N/D';
    const emptypeName = empTypesMap.get(job.empTypeId) || 'N/D';

    const jobId = String(job.jobOpeningId);

    const skillIds = jobSkillsMap.get(jobId) || [];
    const skillNames = skillIds
        .map(id => skillsMap.get(id))
        .filter(Boolean);
    debugger;
    return `
        <div class="col-md-6 col-lg-4 job-card"
            data-id="${jobId}"
            data-city="${job.cityId}"
            data-contract="${job.empTypeId}"
            data-skills="${skillIds.join(',')}"
            data-worksched="${job.workSchedId}"
            data-isopen="${job.isOpen}">

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

              <button class="btn btn-sm btn-primary" onclick="">
                Apri/Chiudi Posizione
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

    const city = citiesMap.get(parseInt(job.cityId));
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


    const ul = document.getElementById("jobDetailSkills");
    ul.innerHTML = "";
    skillNames.forEach(s => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = s;
        ul.appendChild(li);
    });

    document.getElementById("jobDetailApplyBtn").onclick = () => {
        openApplyModal(job.jobOpeningId);
    };

    const modal = new bootstrap.Modal(document.getElementById("jobDetailModal"));
    modal.show();
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
    const fContract = document.getElementById('filterEmpType')?.value || '';
    const fWorkSched = document.getElementById('filterWorkSched')?.value || '';
    const fOpen = document.getElementById('filterIsOpen')?.value || '';

    const cards = document.querySelectorAll('.job-card');

    cards.forEach(card => {
        const title = card.querySelector('h5').textContent.toLowerCase();
        const city = card.dataset.city || '';
        const contract = card.dataset.contract || '';
        const skills = card.dataset.skills
            ? card.dataset.skills.split(',').filter(s => s)
            : [];
        const workSched = card.dataset.worksched || '';
        const isOpen = card.dataset.isopen || '';

        const matchSearch = search ? (title.includes(search) || card.textContent.toLowerCase().includes(search)) : true;
        const matchCity = fCity ? (city === fCity) : true;
        const matchContract = fContract ? (contract === fContract) : true;
        const matchSkill = fSkill ? skills.includes(fSkill) : true;
        const matchWorkSched = fWorkSched ? (workSched === fWorkSched) : true;
        const matchIsOpen = fOpen ? (isOpen === fOpen) : true;

        if (matchSearch && matchCity && matchContract && matchSkill && matchWorkSched && matchIsOpen) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });

    updateJobsCount();
}

// HANDLER BOTTONE CREA NUOVO ANNUNCIO 
document.getElementById('create-btn').addEventListener('click', function () {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
});



//CREAZIONE NUOVO ANNUNCIO 
document.getElementById('createJobOpeningForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    var title = document.getElementById('titlejobOpCreate').value.trim() || null;
    var description = document.getElementById('descriptionjobOpCreate').value.trim() || null;
    var ralFrom = document.getElementById('ralFromjobOpCreate').value.trim() || null;
    var ralTo = document.getElementById('ralTojobOpCreate').value.trim() || null;
    var isOpen = document.getElementById('isOpenjobOpCreate').value === "true";
    var empTypeId = parseInt(document.getElementById('empTypeIdjobOpCreate').value) || null;
    var workSchedId = parseInt(document.getElementById('workSchedIdjobOpCreate').value) || null;
    var cityId = parseInt(document.getElementById('cityIdjobOpCreate').value) || null;
    var closingDate = String(document.getElementById('closingDatejobOpCreate').value) || null;
    
    // PRENDI LE SKILL SELEZIONATE
    var skillsSelect = document.getElementById('skillsjobOpCreate');
    var skills = [];

    for (var i = 0; i < skillsSelect.options.length; i++) {
        var option = skillsSelect.options[i];
        if (option.selected) {
            skills.push(parseInt(option.value));
        }
    }


    var payload = {
        title,
        description,
        ralFrom,
        ralTo,
        isOpen,
        empTypeId,
        workSchedId,
        cityId,
        closingDate,
        skills
    };

    try {
        var res = await fetch('servlet/jobopenings/create', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        var json = await res.json();

        if (!json.success) throw new Error(json.message || "Creazione posizione lavorativa fallita");

        alert("Posizione lavorativa creata con successo!");

        location.reload();

    } catch (err) {
        console.error("Errore creazione posizione lavorativa:", err);
        alert("Errore: " + err.message);
    }
});



// =====================================================
// CHECK ADMIN LOGGED
// =====================================================

async function checkAdminLogged() {
    try {
        const res = await fetch('servlet/sessionStatus');
        const json = await res.json();
        if(json?.message?.isLogged && json?.message?.role == 'admin'){
        return true;
        } else {
            return false;
        }
    } catch (e) {
        console.error("Errore checkUserLogged:", e);
        return false;
    }
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


// DOM READY
document.addEventListener("DOMContentLoaded", async () => {

    if (!(await checkAdminLogged())) {
        window.location.href = "prova.html";
        return;
    }

    await Promise.all([
        loadSkills(),
        loadCities(),
        loadEmpTypes(),
        loadWorkSched(),
        loadJobSkills(),
    ]);

    await loadJobs();

    updateJobsCount();
});

//CONSENTO SELEZIONE MULTIPLA CON UN SEMPLICE CLICK SX NELLA SELECT DELLE SKILLS NELLA CREAZIONE DELLA JOB OP:
const skillsSelect = document.getElementById('skillsjobOpCreate');

skillsSelect.addEventListener('mousedown', function(e) {
    e.preventDefault(); // previene la selezione standard

    const option = e.target;
    if (option.tagName == 'OPTION') {
        option.selected = !option.selected; // toggle selezione
    }

    // opzionale: triggera il change event se necessario
    const event = new Event('change', { bubbles: true });
    skillsSelect.dispatchEvent(event);
});