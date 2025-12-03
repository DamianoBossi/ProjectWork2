// =====================================================
// MAPPE GLOBALI
// =====================================================
const countriesMap = new Map();
const regionsMap = new Map();
const citiesMap = new Map();
const empTypesMap = new Map();
const skillsMap = new Map();
const workSchedMap = new Map();

let allJobs = [];
let jobSkillsMap = new Map();

// =====================================================
// SKILLS, EMPTYPES, CITY, JOBS, WORKSCHEDS
// =====================================================
async function loadMaps() {
  try {
    // Skills
    let res = await fetch('servlet/skills');
    let json = await res.json();
    const skills = json.data || [];
    skillsMap.clear();
    skills.forEach(s => skillsMap.set(String(s.skillId), s.name));
    const filterSkill = document.getElementById('filterSkill');
    skills.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.skillId;
      opt.textContent = s.name;
      filterSkill.appendChild(opt);
    });

    // Employment types
    res = await fetch('servlet/emptypes');
    json = await res.json();
    const types = json.data || [];
    empTypesMap.clear();
    types.forEach(t => empTypesMap.set(t.empTypeId, t.name));
    const filterContract = document.getElementById('filterContract');
    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.empTypeId;
      opt.textContent = t.name;
      filterContract.appendChild(opt);
    });

    // Cities
    res = await fetch('servlet/cities');
    json = await res.json();
    const cities = json.data || [];
    citiesMap.clear();
    cities.forEach(c => citiesMap.set(String(c.cityId), { name: c.name }));
    const filterCity = document.getElementById('filterCity');
    cities.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.cityId;
      opt.textContent = c.name;
      filterCity.appendChild(opt);
    });

    // Job skills
    res = await fetch('servlet/jobopeningsskills');
    json = await res.json();
    const jobSkills = json.data || [];
    jobSkillsMap.clear();
    jobSkills.forEach(entry => {
      const jobId = String(entry.jobOpeningId);
      const skillId = String(entry.skillId);
      if (!jobSkillsMap.has(jobId)) jobSkillsMap.set(jobId, []);
      jobSkillsMap.get(jobId).push(skillId);
    });


    // Work Schedules



    
    //WORKSCHED 
    res = await fetch(`servlet/workscheds`);
    json = await res.json();
    data = json.data || [];

    workSchedMap.clear();

    //popolo la mappa degli orari di lavoro
    data.forEach(function (c) {
        workSchedMap.set(String(c.workSchedId), {
            name: c.name
        });
    });

  } catch (e) {
    console.error("Errore loadMaps:", e);
  }
}

// =====================================================
// LOAD JOBS
// =====================================================
async function loadJobs() {
  try {
    const res = await fetch('servlet/jobapplications/me');
    const json = await res.json();
    allJobs = json.data || [];
    renderJobs(allJobs);
  } catch (e) {
    console.error("Errore loadJobs:", e);
  }
}

// =====================================================
// CARD JOB
// =====================================================
function cardJob(job) {
  const city = citiesMap.get(String(job.cityId)) || 'N/D';
  const contract = empTypesMap.get(job.empTypeId) || 'N/D';
  const jobId = String(job.jobOpeningId);
  const applicationId = job.applicationId;
  const skillIds = jobSkillsMap.get(jobId) || [];
  const skillNames = skillIds.map(id => skillsMap.get(id)).filter(Boolean);
  debugger
  return `
    <div class="col-md-6 col-lg-4 job-card mb-3"
        data-id="${jobId}"
        data-applicationId="${job.applicationId || ''}"
        data-city="${job.cityId}"
        data-contract="${job.empTypeId}"
        data-skills="${skillIds.join(',')}">

        <div class="card h-100 p-3 job-clickable" onclick="openJobDetails('${job.jobOpeningId}', '${job.applicationId}')">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="mb-1">${job.title}</h5>
            <span class="badge rounded-pill bg-light text-primary small">${contract}</span>
          </div>
          <div class="text-muted small mb-2">
            <i class="bi bi-geo-alt"></i> ${city.name || city}
          </div>
          <p class="mb-2 text-muted small job-description">${job.description || ""}</p>
          <div class="small mb-2">
            <strong>Competenze:</strong> ${skillNames.length ? skillNames.join(", ") : "Nessuna specificata"}
          </div>

          
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <div class="small text-muted ${job.ralFrom && job.ralTo ? '' : 'd-none'}">
                <i class="bi bi-wallet2"></i> ${job.ralFrom} - ${job.ralTo}
            </div>
          </div>

          <div class="btn-container d-flex gap-2 ms-auto" >

          <button class="btn btn-danger fw-semibold" id="applicationDeleteBtn" onclick="event.stopPropagation(); openDeleteModal('${job.applicationId}')">Ritira candidatura</button>
          </div>
        </div>
      </div>
  `;
}

// =====================================================
// RENDER JOBS
// =====================================================
function renderJobs(list) {
  const grid = document.getElementById('jobsGrid');
  if (!grid) return;

  const today = new Date(); // data corrente

  list = list.filter(job => {
    const isOpen = job.isOpen == "1"; // solo aperti
    const closingDate = new Date(job.closingDate); // converte la stringa in Date
    return isOpen && closingDate >= today; // aperti e non scaduti
  });

  grid.innerHTML = list.map(j => cardJob(j)).join("");
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
    const skills = card.dataset.skills ? card.dataset.skills.split(',').filter(s => s) : [];

    const matchSearch = search ? title.includes(search) : true;
    const matchCity = fCity ? city === fCity : true;
    const matchContract = fContract ? contract === fContract : true;
    const matchSkill = fSkill ? skills.includes(fSkill) : true;

    card.style.display = (matchSearch && matchCity && matchContract && matchSkill) ? "" : "none";
  });

  updateJobsCount();
}

// =====================================================
// CONTATORE
// =====================================================
function updateJobsCount() {
  const cards = document.querySelectorAll('.job-card');
  const visible = [...cards].filter(c => c.style.display !== 'none').length;
  const el = document.getElementById('jobsCount');
  if (el) el.textContent = `${visible} opportunità trovate`;
}




// =====================================================
// MODALE DETTAGLI JOBS 
// =====================================================
function openJobDetails(jobId, applicationId) {

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

    const modal = new bootstrap.Modal(document.getElementById("jobDetailModal"));
    const modalEl = document.getElementById('applicationDeleteModal');
    modalEl.setAttribute('data-applicationId', applicationId);
    modal.show();

}




// =============================================================
// MODALE CONFERMA CANCELLAZIONE CANDIDATURA
// =============================================================

document.getElementById('applicationDeleteBtn').addEventListener('click', function () {
    const modalEl = document.getElementById('applicationDeleteModal');
    const applicationId = modalEl.getAttribute('data-applicationId');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('jobDetailModal')).hide();
    openDeleteModal(applicationId);
});



function openDeleteModal(applicationId) {
    const modalEl = document.getElementById('applicationDeleteModal');
    modalEl.setAttribute('data-applicationId', applicationId);
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}


document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    const modalEl = document.getElementById('applicationDeleteModal');
    const applicationId = modalEl.getAttribute('data-applicationId'); 
    deleteApplication(applicationId);
});



// =============================================================
// CANCELLAZIONE JOB
// =============================================================
function deleteApplication(applicationId) {
debugger

    fetch(`servlet/jobapplications/${applicationId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Candidatura ritirata con successo.');
            location.reload();
        } else {
            alert('Errore durante l\'eliminazione della candidatura: ' + data.message);
        }
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('applicationDeleteModal')).hide();
}








// =====================================================
// LOGOUT
// =====================================================
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    const res = await fetch('servlet/logout', { method: 'POST' });
    if (res.ok) window.location.href = 'prova.html';
  } catch (e) {
    console.error("Errore logout:", e);
  }
});

// =====================================================
// INIT JOBS PAGE
// Questa funzione inizializza la pagina "Posizioni Aperte":
// - carica mappe (skills, città, contratti)
// - carica tutte le offerte di lavoro
// - collega i filtri alla funzione filterJobs()
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadMaps();
  await loadJobs();

  ['jobSearch', 'filterSkill', 'filterContract', 'filterCity'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', filterJobs);
  });
});





/* nomi cambianti perché prova.js--> gestisce le posizioni aperte (job openings). Tutte le variabili, mappe e funzioni sono legate ai job
Nel JS di candidature--> invece gestisci le candidature (le persone che hanno fatto domanda). Quindi devi avere mappe, array e funzioni dedicate:

prova.js

allJobs
jobSkillsMap
loadJobs()
renderJobs()
filterJobs()

candidature.js

allCandidatures
candSkillsMap
loadCandidatures()
renderCandidatures()
filterCandidatures()

*/
