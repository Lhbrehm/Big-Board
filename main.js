// Load prospects.csv and build the DataTable
Papa.parse('prospects.csv', {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: function(results) {
    const rows = results.data.filter(r => r && r.Name);

    const tbody = document.querySelector('#board tbody');
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.Rank ?? ''}</td>
        <td>${r.Name ?? ''}</td>
        <td>${r.Position ?? ''}</td>
        <td>${r.Usage ?? ''}</td>
        <td>${r.Archetype ?? ''}</td>
        <td>${r.School ?? ''}</td>
        <td>${r.Notes ?? ''}</td>
      </tr>
    `).join('');

    new DataTable('#board', {
      paging: true,
      searching: true,
      ordering: true,
      info: false,
      order: [[0, 'asc']]
    });
  },
  error: function(err) {
    console.error(err);
    alert('Failed to load prospects.csv');
  }
});
