
var countriesMap = new Map(); // countryId -> { name }
var regionsMap = new Map(); // regionId -> { name, countryId }
var citiesMap = new Map(); // cityId -> { name, regionId }
var skillsMap = new Map(); // skillId -> name

var myFirstName = "";
var myLastName = "";
var myEmail = "";
var myBirthDate = "";
var myCountry = 0;
var oldCountry = myCountry;
var myRegion = 0;
var oldRegion = myRegion;
var myCity = 0;
var myAddress = "";
var mySkills = [];
//TODO: var myCV = "";

async function initializeProfile() {
    try {
        const res = await fetch('servlet/users/me');
        const json = await res.json();
        const dataRaw = json.data || [];
        const data = dataRaw[0];

        myFirstName = data.firstName;
        myLastName = data.lastName;
        myEmail = data.email;
        myBirthDate = data.birthDate;
        myCountry = data.countryId;
        oldCountry = myCountry;
        myRegion = data.regionId;
        oldRegion = myRegion;
        myCity = data.cityId;
        myAddress = data.address;
        mySkills = data.skills;
    } catch (e) {
        console.error("Errore loadCountries:", e);
    }
} 

// -------- COUNTRIES --------
async function loadCountries() {
    try {
        const res = await fetch('servlet/countries');
        const json = await res.json();
        const data = json.data || [];

        countriesMap.clear();

        const sel = document.getElementById("profileCountry");

        data.forEach(c => {
            countriesMap.set(String(c.countryId), c.name);

            const opt = document.createElement("option");
            if (c.countryId == myCountry) {
                opt.selected = true
            }
            opt.value = c.countryId;
            opt.textContent = c.name;
            sel.appendChild(opt);
        });

    } catch (e) {
        console.error("Errore loadCountries:", e);
    }
}

// -------- REGIONS --------
async function loadRegions() {

    const sel = document.getElementById("profileRegion");

    try {
        const res = await fetch(`servlet/regions`);
        const json = await res.json();
        const data = json.data || [];

        sel.innerHTML = "";
        regionsMap.clear();

        data.forEach(r => {
            regionsMap.set(String(r.regionId), {
                name: r.name,
                countryId: String(r.countryId)
            });
        });

        var optVuota = document.createElement("option");
        optVuota.id = "regOptVuota";
        optVuota.value = "";
        optVuota.disabled = true;
        optVuota.selected = true;
        optVuota.textContent = "Seleziona una regione";

        sel.appendChild(optVuota);

        data.forEach(r => {
            if (String(r.countryId) == String(myCountry)) {
                const opt = document.createElement("option");
                opt.value = r.regionId;
                opt.textContent = r.name;
                if (r.regionId == myRegion && myCountry == oldCountry) {
                    opt.selected = true
                }
                sel.appendChild(opt);
            }
        });

        oldCountry = myCountry;

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

        const citySel = document.getElementById("profileCity");
        citySel.innerHTML = "";

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
                if (c.cityId == myCity) {
                    opt.selected = true
                }
                opt.value = c.cityId;
                opt.textContent = c.name;
                citySel.appendChild(opt);
            }
        });

    } catch (e) {
        console.error("Errore loadCities:", e);
    }
}

//SKILLS
async function loadSkills() {
    try {
        var res = await fetch(`servlet/skills`);
        var json = await res.json();
        var skills = json.data || [];

        skillsMap.clear();

        //popolo la mappa delle skill   
        skills.forEach(function(s) {
            skillsMap.set(s.skillId, { name: s.name });
        });

        var profileSkills = document.getElementById("skillsContainer");
        profileSkills.innerHTML = "";

        skills.forEach(function(s) {
 
            var input = document.createElement("input");
            input.type = "checkbox";
            input.className = "btn-check";
            input.id = "profileSkills" + s.skillId;
            input.name = "profileSkills[]";
            input.value = s.skillId;
            input.autocomplete = "off";
 
            var label = document.createElement("label");
            label.className = "btn btn-primary";
            label.htmlFor = input.id;
            label.textContent = s.name;
 
            profileSkills.appendChild(input);
            profileSkills.appendChild(label);
        });
    } catch (e) { 
        console.error("Errore loadSkills:", e); 
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



// =====================================================
// EVENT LISTENER SU COUNTRY E REGION
// =====================================================
document.addEventListener("DOMContentLoaded", async function () {
    await initializeProfile();

    await loadCountries();
    await loadRegions();
    await loadCities(myRegion);
    await loadSkills();

    document.getElementById("profileCountry").addEventListener("change", async function () {
        var newCountrySelect = document.getElementById("profileCountry");
        myCountry = newCountrySelect.value;
        await loadRegions();
    });

    document.getElementById("profileRegion").addEventListener("change", async function () {
        //if (/*cambiato sel regione in altro*/) //allora rimuovo l'opt sel regione (sta roba devo farla anche per city)
        var newRegionSelect = document.getElementById("profileRegion");
        myRegion = newRegionSelect.value;
        await loadCities(myRegion);
    });


});

//TODO: quando invierò le modifiche ricordarsi di fare controllo che ci siano state effettivamente modifiche