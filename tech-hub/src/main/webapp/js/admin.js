//TODO: METTERE CONTROLLI FRONTEND PER VERIFICARE CHE LE COSE INSERITE NELLA CREAZIONE DELLA JOB OP SIANO SENSATE
//TODO: aggiungere errori se le fetch restituiscono un json ben formato ma con success a false

var allJobOpenings = [];

//MAPPE GLOBALI
var citiesMap = new Map(); // cityId -> name 
var empTypesMap = new Map(); // emptypeId -> name 
var workSchedMap = new Map(); // workSchedId -> name 
var skillsMap = new Map(); // skillId   -> name

let allJobs = [];               // tutti i job
let jobSkillsMap = new Map();   // jobOpeningId -> array(skillId)

//SKILLS
async function loadSkills() {
    try {
        var res = await fetch(`servlet/skills`);
        var json = await res.json();

        if (!json.success) throw new Error("Errore nel caricamento delle skills");

        var skills = json.data || [];

        skillsMap.clear();
        skills.forEach(s => skillsMap.set(String(s.skillId), s.name));

        var skillsJobOpCreate = document.getElementById("skillsContainer");
        skillsJobOpCreate.innerHTML = "";

        skills.forEach(function(s) {
 
            var input = document.createElement("input");
            input.type = "checkbox";
            input.className = "btn-check";
            input.id = "skillsJobOpCreate" + s.skillId;
            input.name = "skillsJobOpCreate[]";
            input.value = s.skillId;
            input.autocomplete = "off";
 
            var label = document.createElement("label");
            label.className = "btn btn-primary";
            label.htmlFor = input.id;
            label.textContent = s.name;
 
            skillsJobOpCreate.appendChild(input);
            skillsJobOpCreate.appendChild(label);
        });

        //popolo la lista delle skill del filtro
        var filterSkill = document.getElementById("filterSkill");

        skills.forEach(function(s) {
            var opt = document.createElement("option");
            opt.value = s.skillId;
            opt.textContent = s.name;
            filterSkill.appendChild(opt);
        });
    } catch (e) { 
        console.error("Errore loadSkills:", e); 
    }
}

//CITIES
async function loadCities() {
    try {
        var res = await fetch(`servlet/cities`);
        var json = await res.json();

        if (!json.success) throw new Error("Errore nel caricamento delle città");

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

        if (!json.success) throw new Error("Errore nel caricamento dei tipi di contratto");

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

        if (!json.success) throw new Error("Errore nel caricamento degli orari di lavoro");

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

        if (!json.success) throw new Error("Errore nel caricamento delle skills delle posizioni lavorative");

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

        if (!json.success) throw new Error("Errore nel caricamento delle posizioni lavorative");

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

            <p class="mb-3 text-muted small job-description">${job.description}</p>

            <div class="small mb-3">
              <strong>Competenze richieste:</strong>
              ${skillNames.length ? skillNames.join(", ") : "Nessuna specificata"}
            </div>

            <div class="small mb-3">
                <strong>Stato annuncio:</strong>
                ${job.isOpen == '1' ? '<span class="badge bg-success align-bottom">Aperto</span>' : '<span class="badge bg-warning align-bottom">Chiuso</span>'}
            </div>

            <div class="d-flex justify-content-between align-items-center mt-auto">
              <div class="small text-muted ${job.ralFrom && job.ralTo ? '' : 'd-none'}">
                <i class="bi bi-wallet2"></i> ${job.ralFrom} - ${job.ralTo} €
              </div>

              <div class="btn-container d-flex gap-2 ms-auto" >
                <button class="btn btn-sm ${job.isOpen == '1' ? 'btn-success' : 'btn-warning'}" onclick="event.stopPropagation(); toggleJobStatus('${jobId}')">
                ${job.isOpen == '1' ? '<i class="bi bi-unlock"></i>' : '<i class="bi bi-lock"></i>'}
                </button>

                <button class="btn btn-sm btn-danger fw-semibold" id="jobDeleteBtn"  onclick="event.stopPropagation(); openDeleteModal('${jobId}')">Elimina
                </button>
              </div>
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
    document.getElementById("jobDetailDescription").style.whiteSpace = "pre-wrap";
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

    loadRanking(jobId);


    /*
    document.getElementById("jobDetailApplyBtn").onclick = () => {
        openApplyModal(job.jobOpeningId);
    };

    */
    const modal = new bootstrap.Modal(document.getElementById("jobDetailModal"));
    const modalEl = document.getElementById('jobDeleteModal');
    modalEl.setAttribute('data-job-id', jobId);
    modal.show();
}

var candidateCVPath = "";

// =========================
// MODALE DETTAGLI CANDIDATO
// =========================
async function openCandidateModal(jobId, position) {
    const job = allJobs.find(j => String(j.jobOpeningId) === String(jobId));
    if (!job) return;

    try {
        const res = await fetch(`servlet/jobapplications?jobOpeningId=${jobId}`);
        const json = await res.json();
        if (!json.success) throw new Error("Errore nel caricamento dei dettagli del candidato");
        let list = json.data || [];
        
        list.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
        const candidate = list[position - 1];
        
        if (!candidate) return;

        // Fetch dettagli utente da UserShow
        const userRes = await fetch(`servlet/users/${candidate.userId}`);
        const userData = await userRes.json();
        const user = userData.data[0] || {};

        // Popolo la modale con i dati del candidato
        document.getElementById('candidateDetailName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('candidateDetailCity').textContent = candidate.cityName;

        const emailEl = document.getElementById('candidateDetailEmail');
        if (user.email) {
            emailEl.textContent = user.email;
            emailEl.href = `mailto:${user.email}`;
            emailEl.classList.remove('text-muted');
        } else {
            emailEl.textContent = 'N/D';
            emailEl.removeAttribute('href');
            emailEl.classList.add('text-muted');
        }
        document.getElementById('candidateDetailBirthDate').textContent = user.birthDate || 'N/D';
        document.getElementById('candidateDetailAddress').textContent = user.address || 'N/D';

        const skillNames = user.skills.map(id => skillsMap.get(id)).filter(Boolean);

        const skillsWrapper = document.getElementById("userSkillsWrapper");
        const container = document.getElementById("userDetailSkills");
    
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
    

        if (user.cvFilePath && user.cvFilePath.trim() !== "") 
            candidateCVPath = "http://localhost:8081" + user.cvFilePath;

        // Apro la modale
        const modal = new bootstrap.Modal(document.getElementById('candidateDetailModal'));
        modal.show();
    } catch (err) {
        console.error('Errore caricamento candidato:', err);
    }
}

document.getElementById('candidateDetailCV').addEventListener('click', function () {
    if (candidateCVPath && candidateCVPath.trim() !== "") {
        window.open(candidateCVPath, '_blank');
    }
});

// =========================
// CLASSIFICA CANDIDATI 
// =========================
async function loadRanking(jobId) {
    try {
        const res = await fetch(`servlet/jobapplications?jobOpeningId=${jobId}`);
        const json = await res.json();
        if (!json.success) throw new Error("Errore nel caricamento della classifica dei candidati");

        const list = json.data || [];

        // ORDINA IN MANIERA DECRESCENTE
        list.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

        const jobDetailsCandidatesDiv = document.getElementById("jobDetailCandidates");
        const rankingDiv = document.getElementById("jobDetailRanking");
        const podiumDiv = document.getElementById("jobDetailPodium");
        const allCandidatesHeader = document.getElementById('jobDetailAllCandidatesHeader');

        rankingDiv.innerHTML = "";
        podiumDiv.innerHTML = "";

        //SE NON CI SONO CANDIDATI
        const noCandidatesEl = document.getElementById('jobDetailNoCandidates');
        if (list.length === 0) {
            // Mostra messaggio dedicato e pulisci gli altri contenitori
            if (noCandidatesEl) noCandidatesEl.classList.remove('d-none');
            if (podiumDiv) podiumDiv.innerHTML = "";
            if (rankingDiv) rankingDiv.innerHTML = "";
            if (allCandidatesHeader) allCandidatesHeader.classList.add('d-none');
            return;
        } 
            
        if (noCandidatesEl) noCandidatesEl.classList.add('d-none');  
        if (allCandidatesHeader) allCandidatesHeader.classList.remove('d-none');
     
        const first = list[0];
        const second = list[1];
        const third = list[2];

        podiumDiv.innerHTML = `
            <div class="podium-container d-flex justify-content-center align-items-end gap-4">

                <div class="podium-step podium-2 text-center">
                    ${second ? `
                        <div class="podium-rank rank-2">🥈</div>
                        <div class="fw-bold">${second.firstName} ${second.lastName}</div>
                        <div class="text-muted small">${second.cityName}</div>
                    ` : ""}
                </div>

                <div class="podium-step podium-1 text-center">
                    ${first ? `
                        <div class="podium-rank rank-1">🥇</div>
                        <div class="fw-bold">${first.firstName} ${first.lastName}</div>
                        <div class="text-muted small">${first.cityName}</div>
                    ` : ""}
                </div>

                <div class="podium-step podium-3 text-center">
                    ${third ? `
                        <div class="podium-rank rank-3">🥉</div>
                        <div class="fw-bold">${third.firstName} ${third.lastName}</div>
                        <div class="text-muted small">${third.cityName}</div>
                    ` : ""}
                </div>

            </div>
        `;

        //DAL QUARTO IN POI
        list.forEach((app, index) => {

            rankingDiv.innerHTML += `                     
                <div class="ranking-row d-flex align-items-center gap-3 p-2 border-bottom" style="cursor: pointer;" onclick="openCandidateModal('${jobId}', ${index + 1})">
                    <div class="rank-number">${index + 1}</div>
                    <div>
                        <strong>${app.firstName} ${app.lastName}</strong>
                        <br><span class="text-muted">${app.cityName}</span>
                    </div>
                    <div class="ms-auto fw-bold text-primary"><strong>Punteggio: ${app.totalScore} </strong></div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Errore ranking:", err);
    }
}


// =============================================================
// APRI/CHIUDI POSIZIONE LAVORATIVA
// =============================================================

function toggleJobStatus(jobId) {
    fetch(`servlet/jobopenings/update?jobOpeningId=${jobId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadJobs();
        } else {
            alert('Errore durante aggiornamento posizione lavorativa: ' + data.message);
        }
    });
}




// =============================================================
// MODALE CONFERMA CANCELLAZIONE JOB
// =============================================================

document.getElementById('jobDeleteDetailBtn').addEventListener('click', function () {
    const modalEl = document.getElementById('jobDeleteModal');
    const jobId = modalEl.getAttribute('data-job-id');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('jobDetailModal')).hide();
    openDeleteModal(jobId);
});



function openDeleteModal(jobId) {
    
    const modalEl = document.getElementById('jobDeleteModal');
    modalEl.setAttribute('data-job-id', jobId);
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}


document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    const modalEl = document.getElementById('jobDeleteModal');
    const jobId = modalEl.getAttribute('data-job-id'); 
    deleteJob(jobId);
});



// =============================================================
// CANCELLAZIONE JOB
// =============================================================
function deleteJob(jobId) {


    fetch(`servlet/jobopenings/${jobId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Posizione lavorativa eliminata con successo.');
            location.reload();
        } else {
            alert('Errore durante l\'eliminazione della posizione lavorativa: ' + data.message);
        }
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('jobDeleteModal')).hide();
}




// =============================================================
// STAMPA JOBS NEL GRID
// =============================================================
function renderJobs(list) {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = '';
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;"><p class="text-muted fs-5">Nessun risultato</p></div>';
    } else {
        grid.innerHTML = list.map(job => cardJob(job)).join("");
    }
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

    var title = document.getElementById('titlejobOpCreate').value? document.getElementById('titlejobOpCreate').value.trim() : null;
    var description = document.getElementById('descriptionjobOpCreate').value? document.getElementById('descriptionjobOpCreate').value.trim() : null;
    var ralFrom = document.getElementById('ralFromjobOpCreate').value? document.getElementById('ralFromjobOpCreate').value.trim() : null;
    var ralTo = document.getElementById('ralTojobOpCreate').value? document.getElementById('ralTojobOpCreate').value.trim() : null;
    var isOpen = document.getElementById('isOpenjobOpCreate').value? document.getElementById('isOpenjobOpCreate').value.trim()=="true" : null;
    var empTypeId = document.getElementById('empTypeIdjobOpCreate').value? parseInt(document.getElementById('empTypeIdjobOpCreate').value.trim()) : null;
    var workSchedId = document.getElementById('workSchedIdjobOpCreate').value? parseInt(document.getElementById('workSchedIdjobOpCreate').value.trim()) : null;
    var cityId = document.getElementById('cityIdjobOpCreate').value? parseInt(document.getElementById('cityIdjobOpCreate').value.trim()) : null;
    var closingDate = document.getElementById('closingDatejobOpCreate').value? String(document.getElementById('closingDatejobOpCreate').value.trim()) : null;
    
    // PRENDI LE SKILL SELEZIONATE
    var checkedSkills = document.querySelectorAll('input[name="skillsJobOpCreate[]"]:checked')? document.querySelectorAll('input[name="skillsJobOpCreate[]"]:checked') : [];
    var skills = [];

    for (var i = 0; i < checkedSkills.length; i++) {
        skills.push(parseInt(checkedSkills[i].value));
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
            headers: { "Content-Type": "application/json; charset=UTF-8" },
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

    //updateJobsCount();
});