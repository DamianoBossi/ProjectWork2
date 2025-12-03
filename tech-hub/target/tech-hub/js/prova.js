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

let myApplications = [];       // le mie candidature-

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


        // PILLS DELLE SKILLS NELLA REGISTRAZIONE
        var skillsRegistration = document.getElementById("skillsContainer");
        skillsRegistration.innerHTML = "";
 
        skills.forEach(function(s) {
 
            var input = document.createElement("input");
            input.type = "checkbox";
            input.className = "btn-check";
            input.id = "skillsRegistration" + s.skillId;
            input.name = "skillsRegistration[]";
            input.value = s.skillId;
            input.autocomplete = "off";
 
            var label = document.createElement("label");
            label.className = "btn btn-primary";
            label.htmlFor = input.id;
            label.textContent = s.name;
 
            skillsRegistration.appendChild(input);
            skillsRegistration.appendChild(label);
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
        allJobs = allJobs.filter(job => job.isOpen == "1");

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

            <p class="mb-3 text-muted small job-description">${job.description}</p>

            <div class="small mb-3">
              <strong>Competenze richieste:</strong>
              ${skillNames.length ? skillNames.join(", ") : "Nessuna specificata"}
            </div>

            <div class="d-flex justify-content-between align-items-center mt-auto">
                
                <div class="small text-muted ${job.ralFrom && job.ralTo ? '' : 'd-none'}">
                    <i class="bi bi-wallet2"></i> ${job.ralFrom} - ${job.ralTo}
                </div>

                <button id="applyBtn" class="btn btn-sm ${isApplied(jobId) ? ' btn-success ' : ' btn-primary '}  ms-auto" ${isApplied(jobId) ? ' disabled = true ' : ' d-block '} onclick="event.stopPropagation(); openApplyModal('${jobId}')"> 
                    ${isApplied(jobId) ? 'Candidatura inviata' : 'Candidati'}
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

    // Reset button state first
    const applyBtn = document.getElementById("jobDetailApplyBtn");
    applyBtn.textContent = "Candidati";
    applyBtn.disabled = false;
    applyBtn.classList.remove("btn-success");
    applyBtn.classList.add("btn-primary");

    // Update button state based on application status
    if (isApplied(jobId)) {
        applyBtn.textContent = "Candidatura Inviata";
        applyBtn.disabled = true;
        applyBtn.classList.remove("btn-primary");
        applyBtn.classList.add("btn-success");
    }

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

    // APRI IL QUIZ
    const quizModal = new bootstrap.Modal(document.getElementById('quizModal'));
    current = 0;
    showQuestion(current);
        currentJobIdForQuiz = jobId; // Store jobId for quiz
    quizModal.show();
}



// =====================================================
// SUBMIT APPLY FORM 
// =====================================================
// SUBMIT QUIZ AND CREATE APPLICATION
// =====================================================
async function submitQuizAndApplication() {
    if (!currentJobIdForQuiz || !userId) {
        alert("Errore: dati mancanti. Ricarica la pagina.");
        return;
    }

    const payload = {
        userId: parseInt(userId, 10),
        jobOpeningId: parseInt(currentJobIdForQuiz, 10),
        totalScore: quizScore,
        letter: "Quiz candidatura - Score: " + quizScore
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

        alert(`Candidatura inviata con successo! Punteggio: ${quizScore}/${questions.length}`);

        // Chiudi il quiz modal
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById("quizModal")
        ).hide();

        // Ricarica i dati e aggiorna la vista
        await loadApplications();
        renderJobs(allJobs);

        // Reset quiz state
        current = 0;
        quizScore = 0;
        currentJobIdForQuiz = null;
        if (quizResult) quizResult.style.display = "none";

    } catch (err) {
        console.error("Errore candidatura:", err);
        alert("Errore: " + err.message);
    }
}

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
            userId: parseInt(userId, 10),
            jobOpeningId: parseInt(jobId, 10),
            totalScore: parseInt(score, 10),
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

            await loadJobs();
            await loadApplications();
            renderJobs(allJobs);

        } catch (err) {
            console.error("Errore candidatura:", err);
            alert("Errore: " + err.message);
        }
    });
}



// =====================================================
// LOAD APPLICATIONS
// =====================================================
async function loadApplications() {
  try {
    const res = await fetch('servlet/jobapplications/me');
    const json = await res.json();
    myApplications = json.data || [];
  } catch (e) {
    console.error("Errore loadJobs:", e);
  }
}

// =====================================================
// CONTROLLO CANDIDATURA GIA' INVIATA
// =====================================================
function isApplied(jobId){
    return myApplications.some(app => String(app.jobOpeningId) === String(jobId));
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

 
    // PRENDI LE SKILL SELEZIONATE
    var checkedSkills = document.querySelectorAll('input[name="skillsRegistration[]"]:checked');
    var skills = [];
 
    for (var i = 0; i < checkedSkills.length; i++) {
        skills.push(parseInt(checkedSkills[i].value));
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
        skills: skills
    };

    try {


        const cvInput = document.getElementById('registerCv');
        if (cvInput && cvInput.files && cvInput.files.length > 0) {
            const file = cvInput.files[0];
            const MAX_BYTES = 10 * 1024 * 1024;
            if (file.size > MAX_BYTES) {
                alert("Il file CV è troppo grande (max 10 MB).");
                return;
            }
            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                alert("Carica un file PDF valido.");
                return;
            }
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result;
                    if (typeof result == "string") {
                        const parts = result.split(",");
                        resolve(parts.length > 1 ? parts[1] : parts[0]);
                    } else {
                        const bytes = new Uint8Array(result);
                        let binary = "";
                        const chunkSize = 0x8000;
                        for (let i = 0; i < bytes.length; i += chunkSize) {
                            binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
                        }
                        resolve(btoa(binary));
                    }
                };
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(file);
            });
            payload.cv = base64;
        }
        //TODO: else dare errore?!

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
            await loadUser();
            await loadApplications();
    
    
    
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
        await loadUser();
        await loadApplications();
        await loadJobs();
        renderJobs(allJobs);


    } catch (e) {
        console.error("Errore login:", e);
        alert(e.message);
    }
}

if (document.getElementById("loginForm")) {
    loginForm.addEventListener("submit", handleLogin);
}

// =============================================================
// LOAD USER
// =============================================================

async function loadUser() {
    try {
        const res = await fetch('servlet/users/me');
        const json = await res.json();
        const dataRaw = json.data || [];
        const data = dataRaw[0];

        userId = data.userId;
    } catch (e) {
        console.error(e.message);
    }
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
// QUIZ LOGIC
// =============================================================
const questions = document.querySelectorAll(".question-box");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const quizForm = document.getElementById("quizForm");
const quizResult = document.getElementById("quizResult");
const errorMsg = document.getElementById("errorMsg");
let current = 0;
let quizScore = 0;
let currentJobIdForQuiz = null;

function showQuestion(index) {
    if (!questions.length) return;
    questions.forEach((q, i) => q.style.display = i === index ? "block" : "none");
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.style.display = index === questions.length - 1 ? "none" : "inline-block";
    if (submitBtn) submitBtn.style.display = index === questions.length - 1 ? "inline-block" : "none";
    if (errorMsg) errorMsg.textContent = "";
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        const radios = questions[current].querySelectorAll("input[type=radio]");
        if (![...radios].some(r => r.checked)) {
            if (errorMsg) errorMsg.textContent = "Seleziona una risposta!";
            return;
        }
        current++;
        showQuestion(current);
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        current--;
        showQuestion(current);
    });
}

if (quizForm) {
    quizForm.addEventListener("submit", function (e) {
        e.preventDefault();
        quizScore = 0;
        questions.forEach(q => {
            const selected = q.querySelector("input[type=radio]:checked");
            if (selected && selected.value === "1") quizScore++;
        });
        if (quizResult) {
            quizResult.textContent = `Hai totalizzato ${quizScore} su ${questions.length}`;
            quizResult.style.display = "block";
        }

        // Invia candidatura con quiz score
        submitQuizAndApplication();
    });
}

// Initialize first question on page load
if (questions.length > 0) {
    showQuestion(0);
}


// =============================================================
// DOM READY
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {

    if (await checkUserLogged()) {
        await loadUser();
        await loadApplications();
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


    // === EmailJS configuration ===
    // Replace the placeholders below with your actual EmailJS Service ID, Template ID and Public Key
    const EMAILJS_SERVICE_ID = 'service_8b0l85h';
    const EMAILJS_TEMPLATE_ID = 'template_nfg47xa';
    const EMAILJS_PUBLIC_KEY = '5QMP3eiIASpGIS_E0';

    // Initialize EmailJS if SDK loaded
    if (window.emailjs && typeof emailjs.init === 'function') {
        try {
            emailjs.init(EMAILJS_PUBLIC_KEY);
        } catch (err) {
            console.warn('EmailJS init failed:', err);
        }
    }

    // Candidatura spontanea: invio email tramite EmailJS
    const candidaturaForm = document.getElementById('candidaturaForm');
    if (candidaturaForm) {
        candidaturaForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const nome = document.getElementById('nome')?.value.trim();
            const cognome = document.getElementById('cognome')?.value.trim();
            const emailAddr = document.getElementById('email')?.value.trim();
            const telefono = document.getElementById('telefono')?.value.trim();
            const titoloStudio = document.getElementById('titoloStudio')?.value.trim();
            const lettera = document.getElementById('lettera')?.value.trim();

            if (!nome || !cognome || !emailAddr || !lettera) {
                alert('Compila i campi obbligatori: nome, cognome, email e lettera di presentazione.');
                return;
            }

            // Send email using EmailJS - uses form field names to populate template variables
            try {
                if (!window.emailjs || typeof emailjs.sendForm !== 'function') {
                    throw new Error('EmailJS SDK non caricato correttamente. Verificare l\'inclusione del CDN.');
                }

                await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, candidaturaForm);

                alert('Candidatura inviata. Ho inviato una mail di conferma.');
                candidaturaForm.reset();
                bootstrap.Modal.getOrCreateInstance(document.getElementById('candidaturaModal')).hide();
            } catch (err) {
                console.error('Errore invio EmailJS:', err);
                alert('Errore nell\'invio dell\'email. Controlla console e i tuoi ID EmailJS.');
            }
        });
    }

    updateJobsCount();
});
