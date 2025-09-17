const FILE = 'prospects.csv';
const DELIM = "\t";

// Small cleanup for Notes
const clean = s => String(s ?? "").replace(/\t/g, " ").trim();

function generateHeaders(fields) {
    // Filter out Notes from headers
    const visibleFields = fields.filter(field => field !== 'Notes');
    return `
        <tr>
            <th></th>  <!-- expand control -->
            ${visibleFields.map(field => `<th>${field}</th>`).join('')}
        </tr>
    `;
}

function rowHTML(r, fields) {
    const visibleFields = fields.filter(field => field !== 'Notes');
    return `
        <tr data-notes="${clean(r.Notes)}">
            <td class="details-control"></td>
            ${visibleFields.map(field => {
                const value = r[field] ?? "";
                const isName = field === 'Name';
                const isCenter = ['Rank', 'Position'].includes(field);
                const content = isName ? 
                    `<a href="#" class="player-link">${value}</a>` : 
                    value;
                return `<td${isCenter ? ' class="center"' : ''}>${content}</td>`;
            }).join('')}
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
        
        // Generate headers
        document.querySelector('#board thead').innerHTML = generateHeaders(fields);
        
        // Generate rows
        document.querySelector('#board tbody').innerHTML = rows.map(r => rowHTML(r, fields)).join('');

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
                { targets: 1, type: 'num' }
            ]
        });
    },
    error: (err) => { console.error(err); alert('Failed to load data'); }
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