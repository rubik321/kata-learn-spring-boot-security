const baseUrl = 'http://localhost:8080'
const userUrl = baseUrl + '/api/v1/user'
const adminUrl = baseUrl + '/api/v1/admin'
const roleUrl = baseUrl + '/api/v1/admin/role'

const alertPlaceholder = $('#liveAlertPlaceholder')
const loggedUserRolesEl = $('#logged-user-roles')
const navTabEl =$('#nav-tab')
const navNewUserEl = $('#nav-new-user')
const adminPageBtnEl = $('#admin-page-btn')
const userPageBtnEl = $('#user-page-btn')

// noinspection JSCheckFunctionSignatures,JSValidateTypes
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

    getFromForm(form) {
        const data = new FormData(form)

        this.id = data.get('id')
        this.name = data.get('firstName')
        this.lastName = data.get('lastName')
        this.age = data.get('age')
        this.email = data.get('email')
        this.password = data.get('password')
        this.authorities = Array.from(form.querySelector('#authorities').selectedOptions)
            .map(o => new Role().getFromOption(o))

        return this
    }

    getFromObject(obj) {
        for (let attr in obj) {
            if (attr === 'authorities') {
                this[attr] = obj[attr].map(o => new Role().getFromObject(o))
            }
            this[attr] = obj[attr]
        }
        return this
    }
}

class Role {
    constructor(id = 0, authority = '') {
        this.id = id
        this.authority = authority
    }

    getFromOption(option) {
        this.id = option.value
        this.authority = option.text
        return this
    }

    getFromObject(obj) {
        for (let attr in obj) {
            this[attr] = obj[attr]
        }
        return this
    }

    getName() {
        return this.authority.replace('ROLE_', '')
    }
}

let allUsers = []
let userTableRows = []
let adminTableRows = []
let allAuthorities = {}

getLoggedUser()
    .then(user => {
        const userRoles = user.authorities.map(a => getAuthorityName(a))
        loggedUserRolesEl.children()[0].innerHTML = user.email
        loggedUserRolesEl.children()[1].innerHTML = userRoles.join(' ')

        if (userRoles.includes('ADMIN')) {
            adminTableRows.push(getUserTableRowTemplate(user))
            adminPageBtnEl.addClass('active')
            getRoles()
                .then((authorities) => {
                    const newUserAuthEl = $('#authorities')
                    newUserAuthEl.attr('size', authorities.length)
                    newUserAuthEl.html(getAuthoritiesOptions(new User(), authorities))

                    $('#newUserForm').submit(event => {
                        event.preventDefault()
                        createUser(new User().getFromForm(event.target))
                        $('#nav-users-table-tab')[0].click()
                        event.target.reset()
                    })
                })
            getUsers()
                .then((users) => {
                    renderUsersTable(users)

                    $('#users-tbody').click(event => {
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
                })

            userPageBtnEl.click(() => {
                setTitles('User page', 'User information-page', 'About user')
                navTabEl.hide()
                adminPageBtnEl.removeClass('active')
                userPageBtnEl.addClass('active')
                $('#users-tbody').html(adminTableRows.join(''))
                $('#th-edit').hide()
                $('#th-delete').hide()
                $('#td-edit-btn').hide()
                $('#td-delete-btn').hide()
            })

            adminPageBtnEl.click(() => {
                setTitles('Admin panel', 'Admin panel', 'All users')
                navTabEl.show()
                userPageBtnEl.removeClass('active')
                adminPageBtnEl.addClass('active')
                $('#th-edit').show()
                $('#th-delete').show()
                renderUsersTable([])
            })

        } else {
            setTitles('User page', 'User information-page', 'About user')
            navTabEl.remove()
            navNewUserEl.remove()
            adminPageBtnEl.remove()
            userPageBtnEl.addClass('active')
            renderUsersTable([user])
            $('#th-edit').hide()
            $('#th-delete').hide()
            $('#td-edit-btn').hide()
            $('#td-delete-btn').hide()
        }
    })

function setTitles(tab, page, table) {
    $('#tab-title').text(tab)
    $('#page-title').text(page)
    $('#table-title').text(table)
}

function handleUserModifyButtons(user, type, userTableRowEl) {
    const userModal = createUserModalOnPage(user, type)

    userModal.click(event => {
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
                    .then(() => deleteUserTableRow(userTableRowEl, userIndex))
            }

            if (type === 'edit') {
                const user = new User().getFromForm(document.getElementById('userForm'))
                editUser(user)
                    .then((user) => editUserTableRow(user, userIndex))
                    .catch(() => deleteUserTableRow(userTableRowEl, userIndex))
            }

            removeModalFromPage(userModal)
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

function createUserModalOnPage(user, type) {
    $('#modal-div').html(getModal(user, allAuthorities, type))
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
    $('#users-tbody').html(userTableRows.join(''))
}

function renderUsersTable(users) {
    users.forEach(user => {
        userTableRows.push(getUserTableRowTemplate(user))
    })
    $('#users-tbody').html(userTableRows.join(''))
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
            <td id="td-edit-btn">
                <button type="button" class="btn text-white" id="userEditBtn"
                        style="background-color: #17a2b8">
                    Edit
                </button>
            </td>
            <td id="td-delete-btn">
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