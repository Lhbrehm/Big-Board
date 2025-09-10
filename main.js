const FILE = 'prospects.csv';
const DELIM = "\t";

// Small cleanup for Notes
const clean = s => String(s ?? "").replace(/\t/g, " ").trim();

// Build HTML row (NO notes cell)
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

// Parse file, render table, wire expand
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

    const table = new DataTable('#board', {
      paging: true, pageLength: 25, lengthChange: false,
      searching: true, ordering: true, info: false,
      order: [[1,'asc']], // col 0 is expand control
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

    document.querySelector('#board tbody').addEventListener('click', (e) => {
      const cell = e.target.closest('td.details-control');
      if (!cell) return;
      const tr = cell.closest('tr');
      const row = table.row(tr);

      if (row.child.isShown()) {
        row.child.hide(); tr.classList.remove('shown');
      } else {
        row.child(formatNotes(tr)).show(); tr.classList.add('shown');
      }
    });
  },
  error: (err) => { console.error(err); alert('Failed to load data'); }
});

document.querySelector('#board tbody').addEventListener('click', (e) => {
  const btn = e.target.closest('.view-notes-btn');
  if (btn) {
    const notes = btn.getAttribute('data-notes') || 'No notes yet.';
    document.getElementById('notes-content').textContent = notes;
    document.getElementById('notes-modal').style.display = 'block';
  }
});

// Close modal
document.getElementById('close-notes').addEventListener('click', () => {
  document.getElementById('notes-modal').style.display = 'none';
});