//TODO: METTERE CONTROLLI FRONTEND PER VERIFICARE CHE LE COSE INSERITE NELLA CREAZIONE DELLA JOB OP SIANO SENSATE

var allJobOpenings = [];

//MAPPE GLOBALI
var skillsMap = new Map(); // skillId -> name 
var citiesMap = new Map(); // cityId -> name 
var empTypesMap = new Map(); // emptypeId -> name 
var workSchedMap = new Map(); // workSchedId -> name 
var skillsMap = new Map(); // jobOpeningId -> array di skillId

//array JS con gli id delle skill inserite nel form
var skillsList = [];

//SKILLS
async function loadSkills() {
    try {
        var res = await fetch(`servlet/skills`);
        var json = await res.json();
        var data = json.data || [];

        skillsMap.clear();

        //popolo la mappa delle skill   
        data.forEach(function(s) {
            skillsMap.set(s.skillId, { name: s.name });
        });

        //popolo la lista di città della creazione della job opening
        var skillsjobOpCreate = document.getElementById("skillsjobOpCreate");

        data.forEach(function(c) {
            var opt = document.createElement("option");
            opt.value = c.skillId;
            opt.textContent = c.name;
            skillsjobOpCreate.appendChild(opt);
        });

        //popolo la lista delle skill del filtro
        var filterSkills = document.getElementById("filterSkills");

        data.forEach(function(s) {
            var opt = document.createElement("option");
            opt.value = s.skillId;
            opt.textContent = s.name;
            filterSkills.appendChild(opt);
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
        data.forEach(function(c) {
            empTypesMap.set(c.empTypeId, {
                name: c.name
            });
        });

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

//CREAZIONE NUOVO ANNUNCIO 
document.getElementById('createJobOpeningForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    var title = document.getElementById('titlejobOpCreate').value.trim() || null;
    var description = document.getElementById('descriptionjobOpCreate').value.trim() || null;
    var ralFrom = document.getElementById('ralFromjobOpCreate').value.trim() || null;
    var ralTo = document.getElementById('ralTojobOpCreate').value.trim() || null;
    var isOpen = Boolean(document.getElementById('isOpenjobOpCreate').value) || null;
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

// DOM READY
document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadSkills(),
        loadCities(),
        loadEmpTypes(),
        loadWorkSched(),
    ]);

    //await loadJobs();

    //updateJobsCount();
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