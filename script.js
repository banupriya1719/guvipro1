const apiUrl = 'http://localhost:8080/api/employees';

let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchEmployees();
  document.getElementById('employeeForm').addEventListener('submit', handleFormSubmit);
});

// Show loader
function toggleLoader(show) {
  document.getElementById('loader').style.display = show ? 'block' : 'none';
}

// Fetch the employee data
function fetchEmployees() {
  toggleLoader(true);
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#employeeTable tbody');
      tbody.innerHTML = '';
      data.forEach((emp, i) => {
        const row = `
          <tr>
            <td>${i + 1}</td>
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.department}</td>
            <td>${emp.salary}</td>
            <td>
              <button class="btn btn-info btn-sm" onclick="viewEmployee('${emp.id}')">View</button>
              <button class="btn btn-warning btn-sm" onclick="editEmployee('${emp.id}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${emp.id}')">Delete</button>
            </td>
          </tr>`;
        tbody.insertAdjacentHTML('beforeend', row);
      });
    })
    .catch(err => showFormAlert('Error loading employees.'))
    .finally(() => toggleLoader(false));
}

// Show alert message
function showFormAlert(message) {
  const alertBox = document.getElementById('formAlert');
  alertBox.textContent = message;
  alertBox.classList.remove('d-none');
}

// Clear alert
function clearFormAlert() {
  const alertBox = document.getElementById('formAlert');
  alertBox.textContent = '';
  alertBox.classList.add('d-none');
}

// Handle form submit for adding/updating employee
function handleFormSubmit(e) {
  e.preventDefault();
  clearFormAlert();

  const employee = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    department: document.getElementById('department').value.trim(),
    salary: parseFloat(document.getElementById('salary').value)
  };

  if (!validateForm(employee)) return;

  const method = editingId ? 'PUT' : 'POST';
  const url = editingId ? `${apiUrl}/${editingId}` : apiUrl;

  toggleLoader(true);
  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee)
  })
    .then(async res => {
      if (!res.ok) {
        const error = await res.json();
        if (typeof error === 'object') {

          // Show field errors
          Object.keys(error).forEach(field => {
            const errEl = document.getElementById(field + 'Error');
            if (errEl) errEl.textContent = error[field];
          });
        } else {
          showFormAlert(error);
        }
        throw new Error("Validation failed");
      }
      return res.json();
    })
    .then(() => {
      fetchEmployees();
      resetForm();
    })
    .catch(err => {
      if (err.message !== "Validation failed") showFormAlert("Something went wrong.");
    })
    .finally(() => toggleLoader(false));
}

// Validate the employee form (frontend validation)
function validateForm(emp) {
  let valid = true;
  document.getElementById('nameError').textContent = emp.name ? '' : 'Name is required';
  document.getElementById('emailError').textContent =
    !emp.email ? 'Email is required' :
    !/\S+@\S+\.\S+/.test(emp.email) ? 'Invalid email format' : '';
  document.getElementById('departmentError').textContent = emp.department ? '' : 'Department is required';
  document.getElementById('salaryError').textContent = emp.salary > 0 ? '' : 'Salary must be positive';

  if (!emp.name || !emp.email || !emp.department || emp.salary <= 0 || !/\S+@\S+\.\S+/.test(emp.email)) {
    valid = false;
  }
  return valid;
}

//Edit employee
function editEmployee(id) {
  fetch(`${apiUrl}/${id}`)
    .then(res => res.json())
    .then(emp => {
      document.getElementById('name').value = emp.name;
      document.getElementById('email').value = emp.email;
      document.getElementById('department').value = emp.department;
      document.getElementById('salary').value = emp.salary;

      editingId = id;
      document.getElementById('submitBtn').textContent = 'Update Employee';
      document.getElementById('formTitle').textContent = 'Edit Employee';
    });
}

//Reset Form
function resetForm() {
  document.getElementById('employeeForm').reset();
  document.getElementById('submitBtn').textContent = 'Add Employee';
  document.getElementById('formTitle').textContent = 'Add Employee';
  editingId = null;

  ['nameError', 'emailError', 'departmentError', 'salaryError'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  clearFormAlert();
}

//Delete employee
function deleteEmployee(id) {
  if (confirm('Are you sure you want to delete this employee?')) {
    toggleLoader(true);
    fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
      .then(() => fetchEmployees())
      .catch(() => showFormAlert('Error deleting employee.'))
      .finally(() => toggleLoader(false));
  }
}

//View employee details 
function viewEmployee(id) {
  fetch(`${apiUrl}/${id}`)
    .then(res => res.json())
    .then(emp => {
      document.getElementById('viewName').textContent = emp.name;
      document.getElementById('viewEmail').textContent = emp.email;
      document.getElementById('viewDepartment').textContent = emp.department;
      document.getElementById('viewSalary').textContent = emp.salary;

      const modal = new bootstrap.Modal(document.getElementById('viewModal'));
      modal.show();
    });
}
