const FILE = 'prospects.csv';
const DELIM = "\t";

// Small cleanup for Notes
const clean = s => String(s ?? "").replace(/\t/g, " ").trim();

// Build HTML row (with notes button)
function rowHTML(r){
  return `
    <tr data-notes="${clean(r.Notes)}">
      <td class="details-control"></td>
      <td class="center">${r.Rank ?? ""}</td>
      <td><a href="#" class="player-link" data-notes="${clean(r.Notes)}">${r.Name ?? ""}</a></td>
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
    const rows = res.data.filter(r => r && (r.Name || r.Rank));
    const tbody = document.querySelector('#board tbody');
    tbody.innerHTML = rows.map(rowHTML).join('');

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
        document.getElementById('modal-overlay').style.display = 'block';
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