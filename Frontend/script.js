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
            // Existing CRUD table
            const tableBody = document.getElementById("usersTableBody");
            tableBody.innerHTML = "";

            // Email table
            const emailTableBody = document.getElementById("emailUsersTableBody");
            emailTableBody.innerHTML = "";

            data.forEach((u, index) => {

                // -------- CRUD TABLE --------
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

                // -------- EMAIL TABLE --------
                const emailRow = document.createElement("tr");
                emailRow.innerHTML = `
                    <td>
                        <input type="checkbox" class="email-checkbox" value="${u.id}">
                    </td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                `;
                emailTableBody.appendChild(emailRow);
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

// Email select deselect
function toggleSelectAllEmails() {
    const isChecked = document.getElementById("selectAllEmails").checked;

    document.querySelectorAll(".email-checkbox").forEach(cb => {
        cb.checked = isChecked;
    });
}


// Send-Email function
function sendEmail() {
    const subject = document.getElementById("emailSubject").value;
    const message = document.getElementById("emailMessage").value;

    const selectedUserIds = Array.from(
        document.querySelectorAll(".email-checkbox:checked")
    ).map(cb => parseInt(cb.value));

    if (!subject || !message) {
        alert("Subject and message are required");
        return;
    }

    if (selectedUserIds.length === 0) {
        alert("Please select at least one user");
        return;
    }

    fetch("http://localhost:5000/api/Users/send-email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userIds: selectedUserIds,
            subject: subject,
            message: message
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to send email");
        return res.text();
    })
    .then(msg => {
        alert(msg);
        document.getElementById("emailSubject").value = "";
        document.getElementById("emailMessage").value = "";
        document.getElementById("selectAllEmails").checked = false;

        document.querySelectorAll(".email-checkbox").forEach(cb => cb.checked = false);
    })
    .catch(err => {
        alert("Error sending email");
        console.error(err);
    });
}



