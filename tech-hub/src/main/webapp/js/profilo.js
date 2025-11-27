// =====================================================
// LOGOUT
// =====================================================
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  window.location.href = "prova.html";
});

const countriesMap = new Map(); // countryId -> { name }
const regionsMap = new Map(); // regionId  -> { name, countryId }
const citiesMap = new Map(); // cityId    -> { name, regionId }
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

debugger;

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


// =====================================================
// EVENT LISTENER SU COUNTRY E REGION   da chat
// =====================================================
document.addEventListener("DOMContentLoaded", async function () {
  await loadCountries();

  document.getElementById("registerCountry").addEventListener("change", function () {
    loadRegions(this.value);
  });

  document.getElementById("registerRegion").addEventListener("change", function () {
    loadCities(this.value);
  });
});
