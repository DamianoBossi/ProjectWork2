  
    // Dati in memoria
    let jobs = []; // array di oggetti job caricati dal backend
    const emptypesMap = new Map();
    const citiesMap = new Map();

    // --- HELPERS ---
    function getActiveFilters() {
      return {
        text: (document.getElementById('filterText').value || '').trim().toLowerCase(),
        city: document.getElementById('filterCity').value,
        contract: document.getElementById('filterContract').value
      };
    }

    // --- CREAZIONE NUOVO ANNUNCIO ---
    document.getElementById('createJobForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      try {
        const title = (document.getElementById('TITLE').value || '').trim() || null;
        const description = (document.getElementById('DESCRIPTION').value || '').trim() || null;
        const ralFromRaw = document.getElementById('RALFROM').value;
        const ralToRaw = document.getElementById('RALTO').value;
        const ralFrom = ralFromRaw === '' ? null : Number(ralFromRaw);
        const ralTo = ralToRaw === '' ? null : Number(ralToRaw);

        const isOpen = document.getElementById('ISOPEN').value === '1';

        // EMPTYTYPEID rimosso: empTypeId impostato a null
        const empTypeId = null;
        const cityId = document.getElementById('CITYID').value ? Number(document.getElementById('CITYID').value) : null;
        const contractId = document.getElementById('CONTRACTID').value ? Number(document.getElementById('CONTRACTID').value) : null;
        const closingDate = document.getElementById('CLOSINGDATE').value || null;

        const payload = {
          title,
          description,
          ralFrom,
          ralTo,
          isOpen,
          empTypeId,
          cityId,
          contractId,
          closingDate
        };

        // valida minima lato client
        if (!title || !closingDate) {
          alert('Compila i campi obbligatori: Titolo e Data di Chiusura.');
          return;
        }

        try {
          const res = await fetch('servlet/jobopenings/create', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!res.ok) throw new Error('Errore nella chiamata al server: ' + res.status);

          const json = await res.json();

          if (!json.success) throw new Error(json.message || "Creazione posizione lavorativa fallita");

          alert("Posizione lavorativa creata con successo!");
          await loadJobs();
          renderJobs();

        } catch (err) {
          console.error("Errore creazione posizione lavorativa:", err);
          alert("Errore: " + (err.message || err));
        }
      } catch (err) {
        console.error("Errore creazione posizione lavorativa:", err);
        alert("Errore: " + (err.message || err));
      }
    });

    // EVENTI FILTRI
    document.getElementById('filterText').addEventListener('input', renderJobs);
    document.getElementById('filterCity').addEventListener('change', renderJobs);
    document.getElementById('filterContract').addEventListener('change', renderJobs);
    document.getElementById('resetFilters').addEventListener('click', function () {
      document.getElementById('filterText').value = '';
      document.getElementById('filterCity').value = '';
      document.getElementById('filterContract').value = '';
      renderJobs();
    });

    // RENDER ANNUNCI (applica filtri attivi)
    function renderJobs() {
      const jobList = document.getElementById('jobList');
      jobList.innerHTML = '';

      const filters = getActiveFilters();

      const filtered = jobs.filter(job => {
        if (filters.text) {
          const hay = ((job.title || '') + ' ' + (job.description || '') + ' ' + (job.category || '')).toLowerCase();
          if (!hay.includes(filters.text)) return false;
        }
        if (filters.city) {
          if (String(job.cityId || job.city) !== String(filters.city)) return false;
        }
        if (filters.contract) {
          if (String(job.contractId || job.contract) !== String(filters.contract)) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        jobList.innerHTML = '<div class="text-center py-4 text-muted">Nessun annuncio corrisponde ai filtri.</div>';
        return;
      }

      filtered.forEach((job) => {
        const statusText = job.isOpen || job.status === 'Aperto' ? 'Aperto' : 'Chiuso';
        const badgeClass = statusText === 'Aperto' ? 'bg-success' : 'bg-secondary';
        const candidatesCount = Array.isArray(job.candidates) ? job.candidates.length : 0;
        const categoryText = job.category || ''; 
        const cityText = job.cityName || citiesMap.get(String(job.cityId))?.name || job.city || '';

        const jobCard = document.createElement('div');
        jobCard.classList.add('accordion-item');
        jobCard.innerHTML = `
          <h2 class="accordion-header" id="heading${job.id}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${job.id}" aria-expanded="false" aria-controls="collapse${job.id}">
              ${escapeHtml(job.title || '—')} &nbsp; <span class="badge ${badgeClass} ms-2">${statusText}</span>
            </button>
          </h2>
          <div id="collapse${job.id}" class="accordion-collapse collapse" aria-labelledby="heading${job.id}">
            <div class="accordion-body">
              <p><strong>Categoria:</strong> ${escapeHtml(categoryText)}</p>
              <p><strong>Sede:</strong> ${escapeHtml(cityText)}</p>
              <p><strong>Contratto:</strong> ${escapeHtml(job.contractName || job.contract || '')}</p>
              <p><strong>Descrizione:</strong> ${escapeHtml(job.description || '')}</p>
              <div class="d-flex gap-2 mt-3">
                <button class="btn btn-outline-primary btn-sm btn-icon" onclick="toggleJobStatus(${job.id})">
                  <i class="bi bi-pencil-square"></i> ${statusText === 'Aperto' ? 'Chiudi Annuncio' : 'Riapri Annuncio'}
                </button>
                <button class="btn btn-outline-primary btn-sm btn-icon" onclick="viewCandidates(${job.id})">
                  <i class="bi bi-people-fill"></i> Visualizza Candidati (${candidatesCount})
                </button>
              </div>
            </div>
          </div>
        `;
        jobList.appendChild(jobCard);
      });
    }

    function toggleJobStatus(id) {
      const job = jobs.find(j => j.id === id);
      if (job) {
        job.isOpen = !job.isOpen;
        renderJobs();
      }
    }

    function viewCandidates(id) {
      const job = jobs.find(j => j.id === id);
      const candidateList = document.getElementById('candidateList');
      candidateList.innerHTML = '';
      if (job && Array.isArray(job.candidates) && job.candidates.length) {
        job.candidates.forEach(c => {
          const li = document.createElement('li');
          li.className = 'list-group-item';
          li.textContent = `${c.name || '—'} - ${c.email || '—'}`;
          candidateList.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = 'Nessun candidato per questo annuncio.';
        candidateList.appendChild(li);
      }
      const modalEl = document.getElementById('candidatesModal');
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }

    function escapeHtml(text) {
      return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    // -------- EMPLOYMENT TYPES (popola CONTRACTID e filterContract) --------
    async function loadEmptypes() {
      try {
        const res = await fetch('servlet/emptypes');
        if (!res.ok) throw new Error('Errore fetch emptypes: ' + res.status);
        const json = await res.json();
        const types = json.data || [];

        emptypesMap.clear();
        types.forEach(t => emptypesMap.set(String(t.empTypeId), t.name));

        const contractSelect = document.getElementById('CONTRACTID');
        const filterContract = document.getElementById('filterContract');

        if (contractSelect) {
          contractSelect.innerHTML = '<option value="">Contratto</option>';
          types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.empTypeId;
            opt.textContent = t.name;
            contractSelect.appendChild(opt);
          });
        }
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
        console.error("Errore loadEmptypes:", err);
      }
    }

    // -------- CITTA' --------
    async function loadCities() {
      try {
        const res = await fetch('servlet/cities');
        if (!res.ok) throw new Error('Errore fetch cities: ' + res.status);
        const json = await res.json();
        const data = json.data || [];

        citiesMap.clear();
        data.forEach(c => {
          citiesMap.set(String(c.cityId), { name: c.name, regionId: String(c.regionId) });
        });

        const citySel = document.getElementById("CITYID");
        const filterCity = document.getElementById("filterCity");

        if (citySel) {
          citySel.innerHTML = `<option value="">Seleziona città</option>`;
          data.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.cityId;
            opt.textContent = c.name;
            citySel.appendChild(opt);
          });
        }

        if (filterCity) {
          filterCity.innerHTML = `<option value="">Sede (Tutte)</option>`;
          data.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.cityId;
            opt.textContent = c.name;
            filterCity.appendChild(opt);
          });
        }
      } catch (e) {
        console.error("Errore loadCities:", e);
      }
    }

    // -------- JOBS (caricamento) --------
    async function loadJobs() {
      try {
        const res = await fetch('servlet/jobopenings');
        if (!res.ok) throw new Error('Errore fetch jobopenings: ' + res.status);
        const json = await res.json();
        jobs = (json.data || []).map(j => ({
          id: j.id,
          title: j.title,
          description: j.description,
          isOpen: j.isOpen === true || j.status === 'Aperto' || j.status === 'OPEN',
          status: j.status || (j.isOpen ? 'Aperto' : 'Chiuso'),
          empTypeId: j.empTypeId || null,
          category: j.category || null,
          cityId: j.cityId || j.CITYID || null,
          cityName: j.cityName || j.city || '',
          contractId: j.contractId || j.CONTRACTID || null,
          contractName: j.contractName || j.contract || '',
          ralFrom: j.ralFrom || j.RALFROM || null,
          ralTo: j.ralTo || j.RALTO || null,
          closingDate: j.closingDate || j.CLOSINGDATE || null,
          candidates: j.candidates || []
        }));
      } catch (err) {
        console.error('Errore loadJobs:', err);
        jobs = [];
      }
    }

    // Inizializzazione pagina
    async function init() {
      await Promise.allSettled([loadEmptypes(), loadCities(), loadJobs()]);
      renderJobs();
    }

    init();

