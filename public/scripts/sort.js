function sortTableByColumn(table, column, asc = true) {
    const dirModifier = asc ? 1 : -1;
    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll("tr"));
    const sortedRows = rows.sort((a, b) => {
      const aCol = a.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
      const bCol = b.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
      return aCol > bCol ? (1 * dirModifier) : -(1 * dirModifier);
    });
  
    while (tBody.firstChild) {
      tBody.removeChild(tBody.firstChild);
    }
  
    tBody.append(...sortedRows);
  
    table.querySelectorAll("th").forEach(th => {
      th.classList.remove("th-sort-asc", "th-sort-desc");
    });
  
    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle("th-sort-asc", asc);
  
    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle("th-sort-desc", !asc);
  
  }
  
  document.querySelectorAll(".table-sortable th").forEach(headerCell => {
    headerCell.addEventListener("click", () => {
      const tableElement = headerCell.parentElement.parentElement.parentElement;
      const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
      const currentIsAscending = headerCell.classList.contains("th-sort-asc");
  
      sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
    });
  });