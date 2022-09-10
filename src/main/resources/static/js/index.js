const baseUrl = 'http://localhost:8080'
const adminUrl = baseUrl + '/api/v1/admin'
const roleUrl = baseUrl + '/api/v1/admin/role'

const usersTableBodyEl = document.getElementById('users-tbody')
const newUserFormEl = document.getElementById('newUserForm')
const newUserFormAuthEl = newUserFormEl.querySelector('#authorities')
const navUsersTableTabEl = document.getElementById('nav-users-table-tab')
const modalDivEl = document.getElementById('modal-div')

class User {
    constructor(id = 0, name = '', lastName = '', age = 0,
                email = '', password = '', authorities = []) {
        this.id = id
        this.name = name,
        this.lastName = lastName,
        this.age = age,
        this.email = email,
        this.password = password,
        this.authorities = authorities
    }
}

let allUsers = []
let userTableRows = []
let allAuthorities = {}

// Get roles
// Method: GET
getRoles()
    .then(authorities => {
        allAuthorities = authorities
        newUserFormAuthEl.setAttribute('size', authorities.length)
        newUserFormAuthEl.innerHTML = getAuthoritiesOptions(new User(), authorities)
    })

// Get users
// Method: GET
getUsers()
    .then(users => {
        allUsers = users
        renderUsersTable(users)
    })

// Create user
// Method: POST
newUserFormEl.addEventListener('submit', event => {
    event.preventDefault()

    const user = getUserFromForm(event.target)

    createUser(user)
        .then(user => {
            allUsers.push(user)
            renderUsersTable([user])
        })
        .finally(() => {
            navUsersTableTabEl.click()
            event.target.reset()
        })
});

// Delete & Edit user
// Method: DELETE, PATCH
usersTableBodyEl.addEventListener('click', event => {
    event.preventDefault()

    const delBtnIsPressed = event.target.id === 'userDeleteBtn'
    const editBtnIsPressed = event.target.id === 'userEditBtn'
    const userTableRowEl = event.target.parentElement.parentElement

    let user = allUsers.filter(user => user.id == userTableRowEl.dataset.id)[0]

    if (delBtnIsPressed) {
        handleUserModifyButtons(user, 'delete', userTableRowEl)
    }

    if (editBtnIsPressed) {
        handleUserModifyButtons(user, 'edit')
    }
})

function handleUserModifyButtons(user, type, userTableRowEl) {
    modalDivEl.innerHTML += getModal(user, allAuthorities, type)
    const userModal = $('#userModal')
    userModal.modal('show')

    userModal.get()[0].addEventListener('click', event => {
        event.preventDefault()

        const closeBtnIsPressed = event.target.id === 'closeBtn'
            || event.target.id === 'crossBtn' || event.target.id === 'userModal'
        const modifyBtnIsPressed = event.target.id === 'modifyBtn'

        if (closeBtnIsPressed) {
            userModal.modal('hide')
            userModal.remove()
        }

        if (modifyBtnIsPressed) {
            const userIndex = allUsers.findIndex(aUser => aUser.id === user.id)

            if (type === 'delete') {
                deleteUser(user)
                    .then(() => {
                        allUsers.splice(userIndex, 1)
                        userTableRows.splice(userIndex, 1)
                        userTableRowEl.remove()
                    })
                    .finally(() => {
                        userModal.modal('hide')
                        userModal.remove()
                    })
            }

            if (type === 'edit') {
                const newUser = getUserFromForm(document.getElementById('userForm'))
                editUser(newUser)
                    .then((user) => {
                        editUserTableRow(user, userIndex)
                    })
                    .finally(() => {
                        userModal.modal('hide')
                        userModal.remove()
                    })
            }
        }
    })
}

function getRoles() {
    return fetch(roleUrl)
        .then(res => res.json())
}

function getUsers() {
    return fetch(adminUrl)
        .then(res => res.json())
}

function createUser(user) {
    return fetch(adminUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(res => res.json())
}

function deleteUser(user) {
    return fetch(`${adminUrl}/${user.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

function editUser(user) {
    return fetch(`${adminUrl}/${user.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(res => res.json())
}

function getUserFromForm(form) {
    const userFormAuthorities = form.querySelector('#authorities')
    const data = new FormData(form)

    let user = new User()
    user.id = data.get('id')
    user.name = data.get('firstName')
    user.lastName = data.get('lastName')
    user.age = data.get('age')
    user.email = data.get('email')
    user.password = data.get('password')
    user.authorities = Array.from(userFormAuthorities.selectedOptions).map(option => {
        return {
            id: option.value,
            authority: option.text
        }
    })

    return user
}

function editUserTableRow(user, index) {
    allUsers[index] = user
    userTableRows[index] = getUserTableRowTemplate(user)
    usersTableBodyEl.innerHTML = userTableRows.join('')
}

function renderUsersTable(users) {
    users.forEach(user => {
        userTableRows.push(getUserTableRowTemplate(user))
    })
    usersTableBodyEl.innerHTML = userTableRows.join('')
}

function getUserTableRowTemplate(user) {
    return `
        <tr class="align-middle" data-id="${user.id}">
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.lastName}</td>
            <td>${user.age}</td>
            <td>${user.email}</td>
            <td>${user.authorities.map(a => a.authority).join(' ')}</td>
            <td>
                <button type="button" class="btn text-white" id="userEditBtn"
                        style="background-color: #17a2b8">
                    Edit
                </button>
            </td>
            <td>
                <button type="button" class="btn btn-danger" id="userDeleteBtn">
                    Delete
                </button>
            </td>
        </tr>
    `
}

function getModal(user, authorities, type) {
    let disabled = ''
    let btnClass = ''
    let btnText = ''

    if (type === 'edit') {
        btnClass = 'btn btn-primary'
        btnText = 'Save'
    } else if (type === 'delete') {
        disabled = 'disabled'
        btnClass = 'btn btn-danger'
        btnText = 'Delete'
    }

    return `
        <div class="modal" tabindex="-1" role="dialog" id="userModal">
            <div class="modal-dialog" role="document">
                <div class="modal-content">

                        <div class="modal-header">
                            <h5 class="modal-title">${capitalize(type)} user</h5>
                            <button type="button" class="btn-close"
                                    data-bs-dismiss="modal"}
                                    aria-label="Close"
                                    id="crossBtn"></button>
                        </div>

                        <div class="modal-body">
                        
                            <form id="userForm" data-id="${user.id}">
                                <div class="row mb-4">
                                    <label for="id" class="fw-bold text-center">ID</label>
                                    <input type="text" id="id"
                                           class="form-control" readonly
                                           name="id" value="${user.id}">
                                </div>
    
                                <div class="row mb-4">
                                    <label for="firstName" class="fw-bold text-center">First name</label>
                                    <input type="text" id="firstName"
                                           class="form-control" 
                                           name="firstName"
                                           value="${user.name}"
                                           ${disabled}>
                                </div>
    
                                <div class="row mb-4">
                                    <label for="lastName" class="fw-bold text-center">Last name</label>
                                    <input type="text" id="lastName"
                                           class="form-control"
                                           name="lastName"
                                           value="${user.lastName}"
                                           ${disabled}>
                                </div>
    
                                <div class="row mb-4">
                                    <label for="age" class="fw-bold text-center">Age</label>
                                    <input type="number" id="age"
                                           class="form-control" 
                                           name="age"
                                           value="${user.age}"
                                           ${disabled}>
                                </div>
    
                                <div class="row mb-4">
                                    <label for="email" class="fw-bold text-center">Email</label>
                                    <input type="email" id="email"
                                           class="form-control" 
                                           name="email"
                                           value="${user.email}"
                                           ${disabled}>
                                </div>
    
                                <div class="row mb-4" hidden="${disabled}">
                                    <label for="password" class="fw-bold text-center">Password</label>
                                    <input type="password" id="-password"
                                           class="form-control"
                                           name="password"
                                           value="${user.password}"
                                           ${disabled}>
                                </div>
    
                                <div class="row mb-4">
                                    <label for="authorities" class="fw-bold text-center">Role</label>
                                    <select id="authorities" 
                                            class="form-select"
                                            multiple name="authorities"
                                            ${disabled}
                                            size="${authorities.length}">
                                        ${getAuthoritiesOptions(user, authorities)}
                                    </select>
                                </div>
                            </form>
                            
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary"
                                    data-bs-dismiss="modal" id="closeBtn">Close
                            </button>
                            <button type="submit" class="${btnClass}" id="modifyBtn">
                                ${btnText}
                            </button>
                        </div>

                </div>
            </div>
        </div>
    `;
}

function getAuthoritiesOptions(user, authorities) {
    const userAuthorities = user.authorities.map(a => a.authority)
    let res = ''

    authorities.forEach(auth => {
        const role = auth.authority

        if (userAuthorities.includes(role)) {
            res += `<option value="${auth.id}" selected>${role}</option>`
        } else {
            res += `<option value="${auth.id}">${role}</option>`
        }
    })

    return res
}

function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}