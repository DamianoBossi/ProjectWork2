
var countriesMap = new Map(); // countryId -> { name }
var regionsMap = new Map(); // regionId -> { name, countryId }
var citiesMap = new Map(); // cityId -> { name, regionId }
var skillsMap = new Map(); // skillId -> name

var myFirstName = "";
var myLastName = "";
var myEmail = "";
var myBirthDate = "";
var myCountry = 0;
var myRegion = 0;
var myCity = 0;
var myAddress = "";
var mySkills = [];
//TODO: var myCV = "";

async function initializeProfile() {
    try {
        const res = await fetch('servlet/user/me');
        const json = await res.json();
        const data = json.data || [];

        //TODO: per i prox if era meglio forse lanciare errore
        const firstNameSel = document.getElementById("profileCountry");
        if (!firstNameSel) return;
        const lastNameSel = document.getElementById("profileCountry");
        if (!lastNameSel) return;
        const emailSel = document.getElementById("profileCountry");
        if (!emailSel) return;
        const birthDateSel = document.getElementById("profileCountry");
        if (!birthDateSel) return;
        const countrySel = document.getElementById("profileCountry");
        if (!countrySel) return;
        const regionSel = document.getElementById("profileCountry");
        if (!regionSel) return;
        const citySel = document.getElementById("profileCountry");
        if (!citySel) return;
        const addressSel = document.getElementById("profileCountry");
        if (!addressSel) return;
        const skillsSel = document.getElementById("profileCountry");
        if (!skillsSel) return;
        /*TODO: const cvSel = document.getElementById("profileCountry");
        if (!cvSel) return;*/

        myFirstName = data.firstName;
        myLastName = data.firstName;
        myEmail = data.email;
        myBirthDate = data.birthDate;
        myCountry = data.country;
        myRegion = data.region;
        myCity = data.city;
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
        if (!sel) return;

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
async function loadRegions(countryId) {

    const sel = document.getElementById("profileRegion");
    const citySel = document.getElementById("profileCity");

    try {
        const res = await fetch(`servlet/regions`);
        const json = await res.json();
        const data = json.data || [];

        regionsMap.clear();

        data.forEach(r => {
            regionsMap.set(String(r.regionId), {
                name: r.name,
                countryId: String(r.countryId)
            });
        });

        data.forEach(r => {
            if (String(r.countryId) === String(countryId)) {
                const opt = document.createElement("option");
                if (r.regionId == myRegion) {
                    opt.selected = true
                }
                opt.value = r.regionId;
                opt.textContent = r.name;
                sel.appendChild(opt);
            }
        });

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

        var skillsProfile = document.getElementById("skillsContainer");
        skillsProfile.innerHTML = "";

        skills.forEach(function(s) {
 
            var input = document.createElement("input");
            input.type = "checkbox";
            input.className = "btn-check";
            input.id = "skillsProfile" + s.skillId;
            input.name = "skillsProfile[]";
            input.value = s.skillId;
            input.autocomplete = "off";
 
            var label = document.createElement("label");
            label.className = "btn btn-primary";
            label.htmlFor = input.id;
            label.textContent = s.name;
 
            skillsProfile.appendChild(input);
            skillsProfile.appendChild(label);
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
    await loadCountries();
    var countrySelect = document.getElementById("profileCountry");
    await loadRegions(countrySelect.value);
    var regionSelect = document.getElementById("profileRegion");
    await loadCities(regionSelect.value);

    await loadSkills();

    document.getElementById("profileCountry").addEventListener("change", async function () {
        countrySelect = document.getElementById("profileCountry");
        myCountry = countrySelect.value;
        await loadRegions(myCountry);
    });

    document.getElementById("profileRegion").addEventListener("change", async function () {
        regionSelect = document.getElementById("profileRegion");
        myRegion = regionSelect.value;
        await loadCities(myRegion);
    });
});

//TODO: quando invierò le modifiche ricordarsi di fare controllo che ci siano state effettivamente modifiche