const FILE = 'prospects.csv';
const DELIM = "\t";

// Small cleanup for Notes
const clean = s => String(s ?? "").replace(/\t/g, " ").trim();

// Build HTML row (with notes button)
function rowHTML(r){
  return `
    <tr data-notes="${clean(r.Notes)}">
      <td></td> <!-- expand control cell -->  
      <td class="center">${r.Rank ?? ""}</td>
      <td>${r.Name ?? ""}</td>
      <td class="center">${r.Position ?? ""}</td>
      <td>${r.Usage ?? ""}</td>
      <td>${r.Archetype ?? ""}</td>
      <td>${r.School ?? ""}</td>
      <td>
        <button class="view-notes-btn" data-notes="${clean(r.Notes)}">View Notes</button>
      </td>
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

    // Destroy previous DataTable if exists
    if ($.fn.DataTable.isDataTable('#board')) {
      $('#board').DataTable().destroy();
    }

    const table = new DataTable('#board', {
      paging: true, pageLength: 25, lengthChange: false,
      searching: true, ordering: true, info: false,
      order: [[1,'asc']],
      columnDefs: [
        { targets: 0, orderable: false, className: 'details-control' },
        { targets: [1,3], className: 'center' }
      ]
    });

    // Expand/collapse child row with Notes
    const formatNotes = (tr) => {
      const notes = tr.getAttribute('data-notes') || 'No notes yet.';
      return `<div class="dt-notes">${notes}</div>`;
    };

    tbody.addEventListener('click', (e) => {
      // Expand control
      const cell = e.target.closest('td.details-control');
      if (cell) {
        const tr = cell.closest('tr');
        const row = table.row(tr);
        if (row.child.isShown()) {
          row.child.hide(); tr.classList.remove('shown');
        } else {
          row.child(formatNotes(tr)).show(); tr.classList.add('shown');
        }
        return;
      }
      // View Notes button
      const btn = e.target.closest('.view-notes-btn');
      if (btn) {
        const notes = btn.getAttribute('data-notes') || 'No notes yet.';
        document.getElementById('notes-content').textContent = notes;
        document.getElementById('notes-modal').style.display = 'block';
      }
    });
  },
  error: (err) => { console.error(err); alert('Failed to load data'); }
});

// Close modal
document.getElementById('close-notes').addEventListener('click', () => {
  document.getElementById('notes-modal').style.display = 'none';
});