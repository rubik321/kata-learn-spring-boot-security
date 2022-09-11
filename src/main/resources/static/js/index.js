const baseUrl = 'http://localhost:8080'
const userUrl = baseUrl + '/api/v1/user'
const adminUrl = baseUrl + '/api/v1/admin'
const roleUrl = baseUrl + '/api/v1/admin/role'

const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
const loggedUserRolesEl = document.getElementById('logged-user-roles')
const sidebarEl = document.getElementById('sidebar')
const navTabContentEl = document.getElementById('nav-tabContent')
const navTabEl = document.getElementById('nav-tab')

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

getLoggedUser()
    .then(user => {
        const authorityNames = user.authorities.map(a => getAuthorityName(a))
        loggedUserRolesEl.children[0].innerHTML = user.email
        loggedUserRolesEl.children[1].innerHTML = authorityNames.join(' ')

        getRoles()
            .then((authorities) => {
                renderNewUserTab(authorities)
                addNewUserBtnListener()
            })
        getUsers()
            .then((users) => {
                renderUsersTable(users)
                addUsersTableBtnListener()
                renderSidebarLinks()
            })
    })

function addNewUserBtnListener() {
    document.getElementById('newUserForm').addEventListener('submit', event => {
        event.preventDefault()
        createUser(getUserFromForm(event.target))
        document.getElementById('nav-users-table-tab').click()
        event.target.reset()
    })
}

function addUsersTableBtnListener() {
    document.getElementById('users-tbody').addEventListener('click', event => {
        event.preventDefault()

        const delBtnIsPressed = event.target.id === 'userDeleteBtn'
        const editBtnIsPressed = event.target.id === 'userEditBtn'
        const userTableRowEl = event.target.parentElement.parentElement

        let user = allUsers.filter(user => user.id == userTableRowEl.dataset.id)[0]

        if (delBtnIsPressed) {
            handleUserModifyButtons(user, 'delete', userTableRowEl)
        }

        if (editBtnIsPressed) {
            handleUserModifyButtons(user, 'edit', userTableRowEl)
        }
    })
}

function handleUserModifyButtons(user, type, userTableRowEl) {
    const userModal = createUserModalOnPage(user, type)

    userModal.get()[0].addEventListener('click', event => {
        event.preventDefault()

        const closeBtnIsPressed = event.target.id === 'closeBtn'
            || event.target.id === 'crossBtn' || event.target.id === 'userModal'
        const modifyBtnIsPressed = event.target.id === 'modifyBtn'

        if (closeBtnIsPressed) {
            removeModalFromPage(userModal)
        }

        if (modifyBtnIsPressed) {
            const userIndex = allUsers.findIndex(aUser => aUser.id === user.id)

            if (type === 'delete') {
                deleteUser(user)
                deleteUserTableRow(userTableRowEl, userIndex)
                removeModalFromPage(userModal)
            }

            if (type === 'edit') {
                const user = getUserFromForm(document.getElementById('userForm'))
                editUser(user)
                    .then((user) => editUserTableRow(user, userIndex))
                    .catch(() => deleteUserTableRow(userTableRowEl, userIndex))
                removeModalFromPage(userModal)
            }
        }
    })
}

// Get logged user
// Method: GET
async function getLoggedUser() {
    const user = await (await fetch(userUrl)).json()
    return user
}

// Get roles
// Method: GET
async function getRoles() {
    const authorities = await (await fetch(roleUrl)).json()
    allAuthorities = authorities
    return authorities
}

// Get users
// Method: GET
async function getUsers() {
    const users = await (await fetch(adminUrl)).json()
    allUsers = users
    return users
}

// Create user
// Method: POST
async function createUser(user) {
    const response = await fetch(adminUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    if (response.ok) {
        const user = await response.json()
        allUsers.push(user)
        renderUsersTable([user])
        alertMessage(`User ${user.email} is successfully created`, 'success')
    } else {
        alertMessage(`User ${user.email} is already exists`, 'danger')
    }
}

// Delete user
// Method: DELETE
async function deleteUser(user) {
    const response = await fetch(`${adminUrl}/${user.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (response.ok) {
        alertMessage(`User with id = ${user.id} is successfully deleted`, 'success')
    } else {
        alertMessage(`User with id = ${user.id} is not found`, 'danger')
    }
}

// Edit user
// Method: PATCH
async function editUser(user) {
    const response = await fetch(`${adminUrl}/${user.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    if (response.ok) {
        alertMessage(`User with id = ${user.id} is successfully edited`, 'success')
    } else {
        alertMessage(`User with id = ${user.id} is not found`, 'danger')
        return new Promise(function (resolve, reject) {
            reject()
        })
    }
    return response.json()
}

function alertMessage(message, type) {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
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
            authority: 'ROLE_' + option.text
        }
    })

    return user
}

function createUserModalOnPage(user, type) {
    document.getElementById('modal-div').innerHTML = getModal(user, allAuthorities, type)
    const modal = $('#userModal')
    modal.modal('show')

    return modal
}

function removeModalFromPage(modal) {
    modal.modal('hide')
    modal.remove()
}

function deleteUserTableRow(trEl, index) {
    allUsers.splice(index, 1)
    userTableRows.splice(index, 1)
    trEl.remove()
}

function editUserTableRow(user, index) {
    allUsers[index] = user
    userTableRows[index] = getUserTableRowTemplate(user)
    document.getElementById('users-tbody').innerHTML = userTableRows.join('')
}

function renderUsersTable(users) {
    users.forEach(user => {
        userTableRows.push(getUserTableRowTemplate(user))
    })
    document.getElementById('users-tbody').innerHTML = userTableRows.join('')
}

function getUserTableRowTemplate(user) {
    return `
        <tr class="align-middle" data-id="${user.id}">
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.lastName}</td>
            <td>${user.age}</td>
            <td>${user.email}</td>
            <td>${user.authorities.map(a => a.authority.replace('ROLE_', '')).join(' ')}</td>
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
                            <h5 class="modal-title">${type[0].toUpperCase() + type.slice(1)} user</h5>
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

function getAuthorityName(a) {
    return a.authority.replace('ROLE_', '')
}

function getAuthoritiesOptions(user, authorities) {
    const userAuthoritiesId = user.authorities.map(a => a.id)
    let res = ''

    authorities.forEach(auth => {
        const roleId = auth.id
        const roleName = getAuthorityName(auth)

        if (userAuthoritiesId.includes(roleId)) {
            res += `<option value="${auth.id}" selected>${roleName}</option>`
        } else {
            res += `<option value="${auth.id}">${roleName}</option>`
        }
    })

    return res
}

function renderSidebarLinks() {
    sidebarEl.innerHTML = `
        <a class="list-group-item list-group-item-action ripple rounded active"
           aria-current="true" href="/admin.html">Admin</a>
        <a class="list-group-item list-group-item-action ripple rounded}"
           aria-current="true" href="/user.html">User</a>
    `
}

function renderNewUserTab(authorities) {
    navTabEl.innerHTML += `
        <a class="nav-item nav-link" id="nav-new-user-tab" data-bs-toggle="tab"
           href="#nav-new-user"
           role="tab" aria-controls="nav-new-user" aria-selected="false">New User</a>
    `

    navTabContentEl.innerHTML += `
        <div class="tab-pane fade" id="nav-new-user"
             role="tabpanel"
             aria-labelledby="nav-new-user-tab">
    
            <div class="d-print-inline-block py-3 px-4 border-top border-bottom">
                <h5 class="m-0">New User</h5>
            </div>
    
            <div class="py-4 bg-white d-flex justify-content-center">
                <form id="newUserForm">
                    <div class="row mb-4">
                        <label for="firstName" class="fw-bold text-center">First
                            name</label>
                        <input type="text" name="firstName" id="firstName"
                               class="form-control">
                    </div>
    
                    <div class="row mb-4">
                        <label for="lastName" class="fw-bold text-center">Last
                            name</label>
                        <input type="text" name="lastName" id="lastName"
                               class="form-control">
                    </div>
    
                    <div class="row mb-4">
                        <label for="age" class="fw-bold text-center">Age</label>
                        <input type="number" name="age" id="age"
                               class="form-control">
                    </div>
    
                    <div class="row mb-4">
                        <label for="email" class="fw-bold text-center">Email</label>
                        <input type="email" name="email" id="email"
                               class="form-control">
                    </div>
    
                    <div class="row mb-4">
                        <label for="password"
                               class="fw-bold text-center">Password</label>
                        <input type="password" name="password" id="password"
                               class="form-control">
                    </div>
    
                    <div class="row mb-4">
                        <label for="authorities"
                               class="fw-bold text-center">Role</label>
                        <select name="authorities" id="authorities"
                                class="form-select" size="${authorities.length}">
                                ${getAuthoritiesOptions(new User(), authorities)}
                        </select>
                    </div>
    
                    <div class="mb-4 d-flex justify-content-center">
                        <input type="submit" value="Add new user" class="btn btn-lg btn-success"
                               id="addBtn">
                    </div>
                </form>
            </div>
        </div>
    `
}