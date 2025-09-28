const FILE = 'prospects.csv';
const DELIM = "\t";
const PFF_API = 'https://www.pff.com/api/college/big_board';

// Small cleanup for Notes
const clean = s => String(s ?? "").replace(/\t/g, " ").trim();

// Fetch PFF data
async function getPFFRanks() {
    const params = new URLSearchParams({
        season: '2026',
        version: '3'
    });
    
    try {
        const response = await fetch(`${PFF_API}?${params}`);
        const data = await response.json();
        // Create map of name -> rank
        return data.reduce((map, player) => {
            map[player.name] = player.rank;
            return map;
        }, {});
    } catch (error) {
        console.error('Failed to fetch PFF data:', error);
        return {};
    }
}

// Build HTML row with PFF rank
function rowHTML(r, pffRanks){
    return `
        <tr data-notes="${clean(r.Notes)}">
            <td class="details-control"></td>
            <td class="center">${r.Rank ?? ""}</td>
            <td><a href="#" class="player-link">${r.Name ?? ""}</a></td>
            <td class="center">${r.Position ?? ""}</td>
            <td>${r.Usage ?? ""}</td>
            <td>${r.Archetype ?? ""}</td>
            <td>${r.School ?? ""}</td>
            <td class="center">${pffRanks[r.Name] ?? ""}</td>
        </tr>
    `;
}

// Main initialization
async function initTable() {
    const pffRanks = await getPFFRanks();
    
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
            tbody.innerHTML = rows.map(r => rowHTML(r, pffRanks)).join('');

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
        error: (err) => { console.error(err); alert('Failed to load data'); }
    });
}

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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTable);