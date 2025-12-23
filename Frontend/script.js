const API_URL = "http://localhost:5000/api/Users";
let selectedUserId = null;

//ADD USER
function addUser() {
    const user = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phoneNo: document.getElementById("phone").value,   
        adress: document.getElementById("address").value   
    };

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(res => res.json())
    .then(() => {
        alert("User added");
        loadUsers();
    });
}

//LOAD USERS
function loadUsers() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            const tableBody = document.getElementById("usersTableBody");
            tableBody.innerHTML = "";

            data.forEach((u, index) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${u.phoneNo}</td>
                    <td>${u.adress}</td>
                    <td>
                        <button onclick="editUser(${u.id})">Edit</button>
                        <button onclick="deleteUser(${u.id})">Delete</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        });
}



//EDIT USER
function editUser(id) {
    fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(user => {
            selectedUserId = user.id;

            document.getElementById("name").value = user.name;
            document.getElementById("email").value = user.email;
            document.getElementById("phone").value = user.phoneNo;  
            document.getElementById("address").value = user.adress;  
        });
}

//UPDATE USER
function updateUser() {
    if (selectedUserId === null) {
        alert("Select a user to update");
        return;
    }

    const updatedUser = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phoneNo: document.getElementById("phone").value,  
        adress: document.getElementById("address").value 
    };

    fetch(`${API_URL}/${selectedUserId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
    })
    .then(() => {
        alert("User updated");
        selectedUserId = null;
        loadUsers();
    });
}

//DELETE USER
function deleteUser(id) {
    fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    })
    .then(() => loadUsers());
}

//UPLOAD EXCEL-SHEET
function uploadExcel() {
    const fileInput = document.getElementById("excelFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an Excel file");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:5000/api/Users/upload-excel", {
        method: "POST",
        body: formData
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        loadUsers(); // refresh table
    })
    .catch(err => console.error(err));
}

