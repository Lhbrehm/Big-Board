const FILE = 'prospects.csv';
const DELIM = "\t";

// Small cleanup for Notes
const clean = s => String(s ?? "").replace(/\t/g, " ").trim();

function generateHeaders(fields) {
    console.log('Headers being generated:', fields); // Debug log
    const visibleFields = fields.filter(field => field !== 'Notes');
    return `
        <tr>
            <th></th>
            ${visibleFields.map(field => `<th>${field}</th>`).join('')}
        </tr>
    `;
}

function rowHTML(r, fields) {
    const visibleFields = fields.filter(field => field !== 'Notes');
    const row = `
        <tr data-notes="${clean(r.Notes)}">
            <td class="details-control"></td>
            ${visibleFields.map(field => {
                const value = r[field] ?? "";
                return `<td${field === 'Rank' || field === 'Position' ? ' class="center"' : ''}>${
                    field === 'Name' 
                        ? `<a href="#" class="player-link">${value}</a>` 
                        : value
                }</td>`;
            }).join('')}
        </tr>
    `;
    console.log('Row cell count:', (row.match(/<td/g) || []).length); // Debug log
    return row;
}

// Build HTML row (with notes button)
function rowHTML(r){
  return `
    <tr data-notes="${clean(r.Notes)}">
        <td class="details-control"></td>
        <td class="center">${r.Rank ?? ""}</td>
        <td><span class="player-link" data-notes="${(r.Notes ?? "").replace(/"/g, '&quot;')}">${r.Name ?? ""}</span></td>
        <td class="center">${r.Position ?? ""}</td>
        <td>${r.Usage ?? ""}</td>
        <td>${r.Archetype ?? ""}</td>
        <td>${r.School ?? ""}</td>
    </tr>
  `;
}

Papa.parse(FILE, {
  download: true,
  header: true,
  delimiter: DELIM,
  dynamicTyping: true,
  skipEmptyLines: "greedy",
  transformHeader: h => (h||"").trim(),
  complete: (res) => {
    const fields = res.meta.fields;
    const rows = res.data.filter(r => r && (r.Name || r.Rank));
    
    const thead = document.querySelector('#board thead');
    const tbody = document.querySelector('#board tbody');
    
    thead.innerHTML = generateHeaders(fields);
    tbody.innerHTML = rows.map(r => rowHTML(r, fields)).join('');
    
    console.log('Header count:', thead.querySelectorAll('th').length); // Debug log
    console.log('First row cell count:', tbody.querySelector('tr').querySelectorAll('td').length); // Debug log
    
    // Initialize DataTable
    const table = new DataTable('#board', {
      paging: true,
      pageLength: 25,
      lengthChange: false,
      searching: true,
      ordering: true,
      info: false,
      order: [[1, 'asc']],
      columnDefs: [
        { targets: 0, orderable: false, className: 'details-control' },
        { targets: [1,3], className: 'center' }
      ]
    });

    // Handle clicks
    tbody.addEventListener('click', (e) => {
      const link = e.target.closest('.player-link');
      if (link) {
        e.preventDefault();
        const notes = link.getAttribute('data-notes') || 'No notes yet.';
        document.getElementById('notes-content').textContent = notes;
        document.getElementById('notes-modal').style.display = 'block';
      }
    });
  },
  error: (err) => { 
    console.error('Failed to load data:', err);
    alert('Failed to load prospects data');
  }
});

// Close modal
document.querySelector('.close-x').addEventListener('click', () => {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('notes-modal').style.display = 'none';
});

// Add click handler for overlay to close modal
document.getElementById('modal-overlay').addEventListener('click', () => {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('notes-modal').style.display = 'none';
});