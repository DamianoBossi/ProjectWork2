// ==============================
// ANIMAZIONE CARDS (WHY SECTION) FUNZIONA NON TOCCARE!
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








// ====================================
// FUNZIONI PER GESTIRE LE SKILL (SOFT/HARD)    FUNZIONA, NON TOCCARE!
// ====================================
function addSkill(inputId, listId) {
    const input = document.getElementById(inputId);
    const val = input.value.trim();
    if (!val) return;

    const ul = document.getElementById(listId);
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = val;

    // Icona di chiusura (rimozione)
    const closeIcon = document.createElement('span');
    closeIcon.innerHTML = '&times;';
    closeIcon.className = 'ms-2 text-danger fw-bold';
    closeIcon.style.cursor = 'pointer';

    // Logica di rimozione cliccando sull’elemento o sull’icona
    const removeElement = () => li.remove();
    li.addEventListener('click', removeElement);
    closeIcon.addEventListener('click', removeElement);

    li.appendChild(closeIcon);
    ul.appendChild(li);
    input.value = '';
}

// Aggiunta listener ai pulsanti skill (solo se esistono)
if (document.getElementById('addSoftSkillBtn')) {
    document.getElementById('addSoftSkillBtn')
        .addEventListener('click', () => addSkill('softSkillInput', 'softSkillsList'));
}

if (document.getElementById('addHardSkillBtn')) {
    document.getElementById('addHardSkillBtn')
        .addEventListener('click', () => addSkill('hardSkillInput', 'hardSkillsList'));
}





// ===================================
// FORM DI REGISTRAZIONE (FETCH SIMULATA) FUNZIONA E MANDA I DATI, NON TOCCARE!
// ===================================
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const firstName = document.getElementById('registerFirstName').value.trim();
        const lastName = document.getElementById('registerLastName').value.trim();
        const dob = document.getElementById('registerDob').value;
        const birthCity = document.getElementById('registerBirthCity').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const cvInput = document.getElementById('registerCv');

        const skills = [
            ...Array.from(document.querySelectorAll('#softSkillsList li')).map(li => li.childNodes[0].textContent.trim()), //unione degli array soft e hard skills (come da diagramma ER)
            ...Array.from(document.querySelectorAll('#hardSkillsList li')).map(li => li.childNodes[0].textContent.trim())
        ];

        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('dob', dob);
        formData.append('birthCity', birthCity);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('skills', JSON.stringify(skills));

        if (cvInput.files.length > 0) {
            formData.append('cv', cvInput.files[0]);
        }

        try {
            const response = await fetch('https://webhook.site/d763eb45-29b9-45a0-b739-e49cc6c61bbb', { //qui andrebbe messo l'url corretto, per prova utilizziamo webhook
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Errore durante la registrazione (status ' + response.status + ')'); 
            }

            const result = await response.json();
            alert('Registrazione completata! Benvenuto ' + (result.firstName || firstName));

            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('registerModal'));
            modal.hide();

            document.getElementById('registerForm').reset();
            document.getElementById('softSkillsList').innerHTML = '';
            document.getElementById('hardSkillsList').innerHTML = '';

        } catch (error) {
            console.error('Errore:', error);
            alert('Errore durante la registrazione: ' + error.message); //con webhook darà sempre errore perché la connessione è bloccata, ma effettivamente fa vedere i dati della registrazione
        }
    });
}






// ==============================
// GESTIONE SEZIONI (HOME / JOBS)  FUNZIONA, NON TOCCARE!
// ==============================
const homeContent = document.getElementById('homeContent');
const jobSection = document.getElementById('jobSection');

window.showJobsPage = function () {
    if (homeContent) homeContent.style.display = 'none';
    if (jobSection) jobSection.style.display = 'block';
    loadJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.showHomePage = function () {
    if (homeContent) homeContent.style.display = '';
    if (jobSection) jobSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};






// ===================================
// FETCH: CARICAMENTO DEI LAVORI DINAMICI    FINITA SERVE PER CARICARE LA GRIGLIA CON TUTTE LE OFFERTE DI LAVORO, NON TOCCARE!
// ===================================
async function loadJobs() {
    try {
        const response = await fetch('https://690b618f6ad3beba00f4b07b.mockapi.io/pj/Jobs');
        if (!response.ok) throw new Error('Errore nel caricamento dei job');

        const jobs = await response.json();
        const grid = document.getElementById("jobsGrid");
        if (!grid) return;

        grid.innerHTML = ""; // Svuota la griglia prima di ricaricare

        jobs.forEach(job => {
            grid.innerHTML += cardJob(job);
        });

        updateJobsCount();
    } catch (err) {
        console.error('Errore:', err);
    }
}






// ==============================
// TEMPLATE CARD LAVORO                FINITA SERVE PER GENERARE LE CARD DEI LAVORI, NON TOCCARE!
// ==============================
function cardJob(job) {
    return `       
        <div class="col-md-6 col-lg-4 job-card" 
            data-category="${job.id}" 
            data-city="${job.location_city}" 
            data-contract="${job.employment_type_id}">
          <div class="card h-100 p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="mb-1">${job.title}</h5>
              <span class="badge rounded-pill bg-light text-primary small">${job.employment_type_id}</span>
            </div>
            <div class="text-muted small mb-2"><i class="bi bi-geo-alt"></i> ${job.location_city}</div>
            <p class="mb-3 text-muted small">${job.description}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <div class="small text-muted"><i class="bi bi-wallet2"></i> ${job.ral_from} - ${job.ral_to}</div>
              <button class="btn btn-sm btn-primary" onclick="openApplyModal('${job.title}')">Candidati</button>
            </div>
          </div>
        </div>`;
}




// ==============================
// FETCH DEI JOBS PER CONTARLI --> RENDE DINAMICO IL NUMERO NELLA HOME, RICEVE L'ARRAY CON IL FETCH DA MOCKAPI E VEDE QUANTO E' LUNGO. FUNZIONA, NON TOCCARE!
// ==============================

async function fetchJobsCount() {
  try {
    const response = await fetch('https://690b618f6ad3beba00f4b07b.mockapi.io/pj/Jobs');
    if (!response.ok) throw new Error('Errore nel caricamento dei job');
    
    const jobs = await response.json();
    const countText = `${jobs.length} `;

    // Aggiorna entrambi se esistono
    const pill = document.getElementById('homeJobsCountPill');
    const card = document.getElementById('homeJobsCountCard');
    
    if (pill) pill.textContent = countText;
    if (card) card.textContent = countText;

    console.log('Jobs trovati:', jobs.length);
  } catch (err) {
    console.error('Errore:', err);
  }
}

document.addEventListener('DOMContentLoaded', fetchJobsCount);



// ==============================
// FILTRI E COUNTER DEI JOBS                   FUNZIONA ANCHE CON LA FETCH E I LAVORI PRESI DAL SERVLET, NON TOCCARE!
// ==============================
function updateJobsCount() {
    const cards = document.querySelectorAll('.job-card');
    const visible = Array.from(cards).filter(c => c.style.display !== 'none').length;
    const el = document.getElementById('jobsCount');
    if (el) el.textContent = visible + ' opportunità trovate';
}



function filterJobs() {
    const q = document.getElementById('jobSearch')?.value.toLowerCase() || '';
    const cat = document.getElementById('filterCategory')?.value || '';
    const contract = document.getElementById('filterContract')?.value || '';
    const city = document.getElementById('filterCity')?.value || '';
    const cards = document.querySelectorAll('.job-card');

    cards.forEach(card => {
        const title = card.querySelector('h5').textContent.toLowerCase();
        const category = card.getAttribute('data-category') || '';
        const cty = card.getAttribute('data-city') || '';
        const cont = card.getAttribute('data-contract') || '';

        const matchesContract = contract ? cont.toLowerCase().includes(contract.toLowerCase()) : true;
        const matchesQ = q ? (title.includes(q) || card.textContent.toLowerCase().includes(q)) : true;
        const matchesCat = cat ? (category === cat) : true;
        const matchesCity = city ? (cty === city) : true;

        if (matchesQ && matchesCat && matchesContract && matchesCity) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });

    updateJobsCount();
}







// ==============================
// SEZIONE DA MODIFICARE
// ==============================







// ==============================
// APERTURA MODALE CANDIDATURA  DA MODIFICARE!
// ==============================
function openApplyModal(role) {
    try {
        const modalEl = document.getElementById('registerModal');
        if (modalEl) {
            bootstrap.Modal.getOrCreateInstance(modalEl).show();
        } else {
            alert('Candidati per: ' + role);
        }
    } catch (e) {
        alert('Candidati per: ' + role);
    }
}


// ==============================
// FORM DI LOGIN (MODALE)          DA MODIFICARE CON POST!
// ==============================


async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  try {
    const res = await fetch('https://690b618f6ad3beba00f4b07b.mockapi.io/pj/Users');
    const utenti = await res.json();

    // Trova utente corrispondente
    const utente = utenti.find(u => u.email === email && u.password === password);

    if (utente) {
      alert(`Benvenuto, ${utente.name}!`);
      localStorage.setItem('utenteLoggato', JSON.stringify(utente));

    } else {
      alert('Email o password non corretti');
    }

  } catch (err) {
    console.error('Errore durante il login:', err);
    alert('Errore di connessione. Riprova.');
  }
}

document.getElementById('loginForm').addEventListener('submit', handleLogin);


// ==============================
// EVENTI INIZIALI FUNZIONA, NON TOCCARE!
// ==============================
document.addEventListener('DOMContentLoaded', fetchJobsCount);
document.addEventListener('DOMContentLoaded', updateJobsCount);
