const baseUrl = 'http://localhost:8080'
const adminUrl = baseUrl + '/api/v1/admin'

const usersTableBodyEl = document.getElementById('users-tbody')
const navTabContentEl = document.getElementById('nav-tabContent')

const newUser = {
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    password: '',
    authorities: []
}

fetchUsersTable()
let users = JSON.parse(localStorage.getItem('users'))
let allAuthorities = JSON.parse(localStorage.getItem('allAuthorities'))

renderUsersTable()
renderNewUserTab()

async function fetchUsersTable() {
    try {
        const res = await fetch(adminUrl)
        const data = await res.json();
        localStorage.setItem('users', JSON.stringify(data['users']))
        localStorage.setItem('allAuthorities', JSON.stringify(data['allAuthorities']))
    } catch (e) {
        console.error(e)
    }
}

function renderNewUserTab() {
    const idPrefix = 'newUserForm'
    navTabContentEl.innerHTML += `
        <div class="tab-pane fade" id="nav-new-user"
             role="tabpanel"
             aria-labelledby="nav-new-user-tab">

            <div class="d-print-inline-block py-3 px-4 border-top border-bottom">
                <h5 class="m-0">New User</h5>
            </div>

            <div class="py-4 bg-white d-flex justify-content-center">
                <form method="POST" action="${adminUrl}" id="${idPrefix}">
                    <div class="row mb-4">
                        <label for="${idPrefix}-firstName" class="fw-bold text-center">First
                            name</label>
                        <input type="text" name="firstName" id="${idPrefix}-firstName"
                               class="form-control">
                    </div>

                    <div class="row mb-4">
                        <label for="${idPrefix}-lastName" class="fw-bold text-center">Last
                            name</label>
                        <input type="text" name="lastName" id="${idPrefix}-lastName"
                               class="form-control">
                    </div>

                    <div class="row mb-4">
                        <label for="${idPrefix}-age" class="fw-bold text-center">Age</label>
                        <input type="number" name="age" id="${idPrefix}-age" class="form-control">
                    </div>

                    <div class="row mb-4">
                        <label for="${idPrefix}-email" class="fw-bold text-center">Email</label>
                        <input type="email" name="email" id="${idPrefix}-email"
                               class="form-control">
                    </div>

                    <div class="row mb-4">
                        <label for="${idPrefix}-password"
                               class="fw-bold text-center">Password</label>
                        <input type="password" name="password" id="${idPrefix}-password"
                               class="form-control">
                    </div>

                    <div class="row mb-4">
                        <label for="${idPrefix}-authorities" class="fw-bold text-center">Role</label>
                        <select name="authorities" id="${idPrefix}-authorities" class="form-select" 
                                multiple size="${allAuthorities.length}">
                            ${getAuthoritiesOptions(newUser, allAuthorities)}
                        </select>
                    </div>

                    <div class="mb-4 d-flex justify-content-center">
                        <input type="submit" value="Add new user" class="btn btn-lg btn-success" id="${idPrefix}-addBtn">
                    </div>
                </form>
            </div>
        </div>
    `
}

function renderUsersTable() {
    let output = ''

    users.forEach(user => {
        output += `
                <tr class="align-middle">
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.lastName}</td>
                    <td>${user.age}</td>
                    <td>${user.email}</td>
                    <td>${user.authorities.map(a => a.authority).join(' ')}</td>
                    <td>${getModal(user, 'edit', adminUrl)}</td>
                    <td>${getModal(user, 'delete', adminUrl)}</td>
                </tr>
            `
    })
    usersTableBodyEl.innerHTML = output
}

function getModal(user, type, url) {
    const formIdPrefix = type + 'Form-user' + user.id
    const modalIdPrefix = type + 'Modal-user' + user.id

    let disabled = false
    let btnClass = ''
    let btnText = ''

    if (type === 'edit') {
        disabled = false;
        btnClass = 'btn btn-primary'
        btnText = 'Save'
    } else if (type === 'delete') {
        disabled = true
        btnClass = 'btn btn-danger'
        btnText = 'Delete'
    }

    return `
        <div class="modal" tabindex="-1" role="dialog" id="${modalIdPrefix}">
            <div class="modal-dialog" role="document">
                <div class="modal-content">

                    <form method="POST"
                          action="${url}/${user.id}" id="${formIdPrefix}">

                        <div class="modal-header">
                            <h5 class="modal-title">${capitalize(type)} user</h5>
                            <button type="button" class="btn-close"
                                    data-bs-dismiss="modal"}
                                    aria-label="Close"
                                    id="${formIdPrefix}-crossBtn"></button>
                        </div>

                        <div class="modal-body">
                            <div class="row mb-4">
                                <label for="${formIdPrefix}-id" class="fw-bold text-center">ID</label>
                                <input type="text" id="${formIdPrefix}-id"
                                       class="form-control" readonly
                                       name="id" value="${user.id}">
                            </div>

                            <div class="row mb-4">
                                <label for="${formIdPrefix}-firstName" class="fw-bold text-center">First name</label>
                                <input type="text" id="${formIdPrefix}-firstName"
                                       class="form-control" 
                                       name="name"
                                       value="${user.name}"
                                       disabled="${disabled}">
                            </div>

                            <div class="row mb-4">
                                <label for="${formIdPrefix}-lastName" class="fw-bold text-center">Last name</label>
                                <input type="text" id="${formIdPrefix}-lastName"
                                       class="form-control"
                                       name="lastName"
                                       value="${user.lastName}"
                                       disabled="${disabled}">
                            </div>

                            <div class="row mb-4">
                                <label for="${formIdPrefix}-age" class="fw-bold text-center">Age</label>
                                <input type="number" id="${formIdPrefix}-age"
                                       class="form-control" 
                                       name="age"
                                       value="${user.age}"
                                       disabled="${disabled}">
                            </div>

                            <div class="row mb-4">
                                <label for="${formIdPrefix}-email" class="fw-bold text-center">Email</label>
                                <input type="email" id="${formIdPrefix}-email"
                                       class="form-control" 
                                       name="email"
                                       value="${user.email}"
                                       disabled="${disabled}">
                            </div>

                            <div class="row mb-4" hidden="${disabled}">
                                <label for="${formIdPrefix}-password" class="fw-bold text-center">Password</label>
                                <input type="password" id="${formIdPrefix}--password"
                                       class="form-control"
                                       name="password"
                                       value="${user.password}"
                                       disabled="${disabled}">
                            </div>

                            <div class="row mb-4">
                                <label for="${formIdPrefix}-authorities" class="fw-bold text-center">Role</label>
                                <select id="${formIdPrefix}-authorities" 
                                        class="form-select"
                                        multiple name="authorities"
                                        disabled="${disabled}"
                                        size="${allAuthorities.length}">
                                    ${getAuthoritiesOptions(user, allAuthorities)}
                                </select>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary"
                                    data-dismiss="modal">Close
                            </button>
                            <button type="submit" class="${btnClass}">
                                ${btnText}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>

        <button type="button" class="btn ${type === 'edit' ? 'text-white' : 'btn-danger'}" data-bs-toggle="modal"
                data-bs-target="#${modalIdPrefix}" id="${modalIdPrefix}-btn"
                style="${type === 'edit' ? 'background-color: #17a2b8' : ''}">
            ${capitalize(type)}
        </button>
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