// DOM Elements
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search-input');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');

let sortConfig = { column: null, direction: 'asc' };
let currentPage = 1;
const itemsPerPage = 10;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  renderTable(processData);
  setupEventListeners();
  updateNavigationButtons();
});

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  searchInput.addEventListener('input', handleSearch);
  
  // Sort functionality
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.sort;
      handleSort(column);
    });
  });

  // Navigation
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable(processData);
      updateNavigationButtons();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    const maxPages = Math.ceil(processData.length / itemsPerPage);
    if (currentPage < maxPages) {
      currentPage++;
      renderTable(processData);
      updateNavigationButtons();
    }
  });
}

// Update navigation buttons state
function updateNavigationButtons() {
  const maxPages = Math.ceil(processData.length / itemsPerPage);
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === maxPages;
}

// Render table with data
function renderTable(data) {
  tableBody.innerHTML = '';
  
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedData = data.slice(start, end);
  
  paginatedData.forEach(process => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${process.id}</td>
      <td>${process.reclamante}</td>
      <td>${process.assunto}</td>
      <td>${process.reclamado}</td>
      <td>
        <div class="date-cell">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${process.data}
        </div>
      </td>
      <td>
        <span class="status-badge status-${process.status}">
          ${getStatusLabel(process.status)}
        </span>
      </td>
      <td class="actions-column">
        <button class="action-view" data-id="${process.id}" title="Visualizar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </td>
    `;
    
    // Add event listener to view button
    row.querySelector('.action-view').addEventListener('click', () => {
      viewProcess(process.id);
    });
    
    tableBody.appendChild(row);
  });
  
  // Apply animation to rows
  const rows = tableBody.querySelectorAll('tr');
  rows.forEach((row, index) => {
    row.style.animation = `slideIn ${0.2 + index * 0.05}s forwards`;
  });
}

// Handle search functionality
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  
  const filteredData = processData.filter(process => {
    return (
      process.id.toLowerCase().includes(searchTerm) ||
      process.reclamante.toLowerCase().includes(searchTerm) ||
      process.assunto.toLowerCase().includes(searchTerm) ||
      process.reclamado.toLowerCase().includes(searchTerm) ||
      process.data.toLowerCase().includes(searchTerm) ||
      getStatusLabel(process.status).toLowerCase().includes(searchTerm)
    );
  });
  
  currentPage = 1;
  renderTable(filteredData);
  updateNavigationButtons();
}

// Handle sorting functionality
function handleSort(column) {
  const thElement = document.querySelector(`th[data-sort="${column}"]`);
  
  // Clear previous sort indicators
  document.querySelectorAll('th.sortable').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
  });
  
  let direction = 'asc';
  
  if (sortConfig.column === column) {
    direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
  }
  
  // Update sort configuration
  sortConfig = { column, direction };
  
  // Add indicator to the current sort column
  thElement.classList.add(`sort-${direction}`);
  
  // Sort the data
  const sortedData = [...processData].sort((a, b) => {
    let valueA = a[column];
    let valueB = b[column];
    
    // Special case for status column
    if (column === 'status') {
      valueA = getStatusOrder(a.status);
      valueB = getStatusOrder(b.status);
    }
    
    if (valueA < valueB) {
      return direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  renderTable(sortedData);
}

// Helper function to get status label
function getStatusLabel(status) {
  switch (status) {
    case 'rejected':
      return 'Rejeitado';
    case 'in-progress':
      return 'Andamento';
    case 'pending':
      return 'Pendente';
    case 'completed':
      return 'Completo';
    default:
      return 'Desconhecido';
  }
}

// Helper function to get status order for sorting
function getStatusOrder(status) {
  switch (status) {
    case 'completed': return 1;
    case 'in-progress': return 2;
    case 'pending': return 3;
    case 'rejected': return 4;
    default: return 5;
  }
}

// View process details
function viewProcess(id) {
  const process = processData.find(p => p.id === id);
  
  if (process) {
    alert(`Detalhes do Processo #${process.id}:\n
Reclamante: ${process.reclamante}
Assunto: ${process.assunto}
Reclamado: ${process.reclamado}
Data: ${process.data}
Status: ${getStatusLabel(process.status)}`);
  }
}