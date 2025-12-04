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
var myCVFilePath = "";

var initialFirstName, initialLastName, initialEmail, initialBirthDate, initialCountry, initialRegion, initialCity, initialAddress, initialCVFilePath;
var initialSkills = [];

async function initializeProfile() {
    try {
        const res = await fetch('servlet/users/me');
        const json = await res.json();
        const dataRaw = json.data || [];
        const data = dataRaw[0];

        myFirstName = data.firstName;
        initialFirstName = myFirstName
        myLastName = data.lastName;
        initialLastName = myLastName
        myEmail = data.email;
        initialEmail = myEmail;
        myBirthDate = data.birthDate;
        initialBirthDate = myBirthDate;
        myCountry = data.countryId;
        initialCountry = myCountry;
        oldCountry = myCountry;
        myRegion = data.regionId;
        initialRegion = myRegion;
        oldRegion = myRegion;
        myCity = data.cityId;
        initialCity = myCity;
        myAddress = data.address;
        initialAddress = myAddress
        mySkills = data.skills;
        initialSkills = mySkills;
        myCVFilePath = "localhost:8080" + data.cvFilePath;
        initialCVFilePath = myCVFilePath;
    } catch (e) {
        console.error("Errore initiaizeProfile:", e);
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

    } catch (e) {
        console.error("Errore loadRegions:", e);
    }
}


// -------- CITIES --------
async function loadCities() {
    const sel = document.getElementById("profileCity");

    try {
        const res = await fetch(`servlet/cities`);
        const json = await res.json();
        const data = json.data || [];

        sel.innerHTML = "";
        citiesMap.clear();

        data.forEach(r => {
            citiesMap.set(String(r.cityId), {
                name: r.name,
                regionId: String(r.regionId)
            });
        });

        var optVuota = document.createElement("option");
        optVuota.id = "citOptVuota";
        optVuota.value = "";
        optVuota.selected = true;
        optVuota.textContent = "Seleziona una città";

        sel.appendChild(optVuota);

        if (myCountry == oldCountry) {
            data.forEach(r => {
                if (String(r.regionId) == String(myRegion)) {
                    const opt = document.createElement("option");
                    opt.value = r.cityId;
                    opt.textContent = r.name;
                    if (r.cityId == myCity && myRegion == oldRegion && myCountry == oldCountry) {
                        opt.selected = true
                    }
                    sel.appendChild(opt);
                }
            });
        }

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
                window.location.href = "user.html";
            }
        } catch (e) {
            console.error("Errore logout:", e);
            alert("Errore durante il logout: " + e.message);
        }
    };
} 



//Popolamento DOM con i dati dell'utente
document.addEventListener("DOMContentLoaded", async function () {
    await initializeProfile();

    const profileOldCV = document.getElementById("profileOldCV");
    let raw = myCVFilePath.trim() || "";
    if (raw.length > 0){
        raw = "http://" + raw;
    }
    else {
        return;
    }
    let finalUrl;
    try {
        finalUrl = new URL(raw, window.location.href).href;
    } catch (err) {
        console.error("Impossibile parsare myCVFilePath:", raw, err);
        return;
    }
    profileOldCV.href = finalUrl;

    var profileFirstName = document.getElementById("profileFirstName");
    profileFirstName.value = myFirstName;

    var profileLastName = document.getElementById("profileLastName");
    profileLastName.value = myLastName;

    var profileEmail = document.getElementById("profileEmail");
    profileEmail.value = myEmail;
    profileEmail.setAttribute("disabled", true);

    var profileBirthDate = document.getElementById("profileBirthDate")
    profileBirthDate.value = myBirthDate;

    await loadCountries();
    await loadRegions();
    await loadCities();
    await loadSkills();

    document.getElementById("profileCountry").addEventListener("change", async function () {
        var newCountrySelect = document.getElementById("profileCountry");
        myCountry = newCountrySelect.value;
        await loadRegions();
        await loadCities();
        
        myCity = 0;
        oldCountry = myCountry;
        oldRegion = myRegion;
    });

    document.getElementById("profileRegion").addEventListener("change", async function () {
        //if (/*cambiato sel regione in altro*/) //allora rimuovo l'opt sel regione (sta roba devo farla anche per city)
        var newRegionSelect = document.getElementById("profileRegion");
        myRegion = newRegionSelect.value;
        await loadCities();

        myCity = 0;
        oldRegion = myRegion;
    });

    document.getElementById("profileCity").addEventListener("change", async function () {
        //if (/*cambiato sel regione in altro*/) //allora rimuovo l'opt sel regione (sta roba devo farla anche per city)
        var newCitySelect = document.getElementById("profileCity");
        myCity = newCitySelect.value;
    });

    var profileAddress = document.getElementById("profileAddress");
    profileAddress.value = myAddress;

    var profileSkills = document.getElementsByName("profileSkills[]");

    for (var i = 0; i < profileSkills.length; i++) {
        var cb = profileSkills[i];
        cb.checked = mySkills.includes(cb.value);
    }

});

//submit delle modifiche
var save = document.getElementById("profileForm")
save.addEventListener("submit", async function (e) {
    e.preventDefault();
    var profileFirstName = document.getElementById("profileFirstName")
    var profileLastName = document.getElementById("profileLastName")
    var profileBirthDate = document.getElementById("profileBirthDate");
    var profileCountry = document.getElementById("profileCountry");
    var profileRegion = document.getElementById("profileRegion");
    var profileCity = document.getElementById("profileCity");
    var profileAddress = document.getElementById("profileAddress");
    var profileSkillsArr = document.getElementsByName("profileSkills[]");
    var profileSkills = [];
    var profileNewCV = document.getElementById("profileNewCV");

    for (var i = 0; i < profileSkillsArr.length; i++) {
        if (profileSkillsArr[i].checked) {
            profileSkills.push(profileSkillsArr[i].value);
        }
    }

    //controllo se ci sono state effettivamente modifiche
    var isModified = false;

    // Controllo campi singoli
    if (
        profileFirstName.value.trim() != initialFirstName ||
        profileLastName.value.trim() != initialLastName ||
        profileBirthDate.value.trim() != initialBirthDate ||
        profileCountry.value != initialCountry ||
        profileRegion.value != initialRegion ||
        profileCity.value != initialCity ||
        profileAddress.value.trim() != initialAddress ||
        profileNewCV.files.length > 0
    ) {
        isModified = true;
    }

    // Controllo skills (ordine non importa)
    if (!isModified) {
        if (profileSkills.length != initialSkills.length) {
            isModified = true;
        } else {
            for (var i = 0; i < initialSkills.length; i++) {
                if (!profileSkills.includes(initialSkills[i])) {
                    isModified = true;
                    break;
                }
            }
        }
    }

    // Se tutto è uguale, ricarico
    if (!isModified) {
        location.reload();
        return;
    }

    var payload = {
        firstName: profileFirstName.value.trim(),
        lastName: profileLastName.value.trim(),
        birthDate: profileBirthDate.value.trim(),
        countryId: profileCountry.value,
        regionId: profileRegion.value,
        cityId: profileCity.value,
        address: profileAddress.value.trim(),
        skills: profileSkills
    };

    if (profileNewCV && profileNewCV.files && profileNewCV.files.length > 0) {
        const file = profileNewCV.files[0];
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

    try {
        var response = await fetch("servlet/users/me/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        var json = await response.json();
        
        if (!json.success) {
            alert(json.message || "Salvataggio dati fallito");
            throw new Error(json.message || "Salvataggio dati fallito");
        } 

        console.log("success", json.message);
        location.reload();

    } catch (err) {
        console.error(err);
    }

});