const baseUrl = 'http://localhost:8080'
const adminUrl = baseUrl + '/api/v1/admin'

const usersTableBodyEl = document.getElementById('users-tbody')
const navTabContentEl = document.getElementById('nav-tabContent')

class User {
    constructor(name = '', lastName = '', age = 0,
                email = '', password = '', authorities = []) {
        this.name = name,
        this.lastName = lastName,
        this.age = age,
        this.email = email,
        this.password = password,
        this.authorities = authorities
    }
}

fetchUsersTable(adminUrl)
let users = JSON.parse(localStorage.getItem('users'))
let allAuthorities = JSON.parse(localStorage.getItem('allAuthorities'))

renderUsersTable(users, allAuthorities, adminUrl)
renderNewUserTab(new User, allAuthorities)

const newUserFormEl = document.getElementById('newUserForm')
newUserFormEl.addEventListener('submit', createUser);

async function fetchUsersTable(url) {
    try {
        const res = await fetch(url)
        const data = await res.json();
        localStorage.setItem('users', JSON.stringify(data['users']))
        localStorage.setItem('allAuthorities', JSON.stringify(data['allAuthorities']))
    } catch (e) {
        console.error(e)
    }
}

async function createUser(event) {
    event.preventDefault()

    const data = new FormData(event.target)
    let user = getUserFromFormData(data)

    let response = await fetch(adminUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })

    let result = await response.text()
}

function getUserFromFormData(data) {
    let user = new User()
    user.name = data.get('firstName')
    user.lastName = data.get('lastName')
    user.age = data.get('age')
    user.email = data.get('email')
    user.password = data.get('password')
    user.authorities = getSelectedAuthorities(document.getElementById('newUserForm-authorities'))

    return user
}

function renderNewUserTab(user, authorities) {
    const idPrefix = 'newUserForm'
    navTabContentEl.innerHTML += `
        <div class="tab-pane fade" id="nav-new-user"
             role="tabpanel"
             aria-labelledby="nav-new-user-tab">

            <div class="d-print-inline-block py-3 px-4 border-top border-bottom">
                <h5 class="m-0">New User</h5>
            </div>

            <div class="py-4 bg-white d-flex justify-content-center">
                <form id="${idPrefix}">
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
                                multiple size="${authorities.length}">
                            ${getAuthoritiesOptions(user, authorities)}
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

function renderUsersTable(users, authorities) {
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
                    <td>${getModal(user, authorities, 'edit')}</td>
                    <td>${getModal(user, authorities, 'delete')}</td>
                </tr>
            `
    })
    usersTableBodyEl.innerHTML = output
}

function getModal(user, authorities, type) {
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

                    <form id="${formIdPrefix}">

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
                                        size="${authorities.length}">
                                    ${getAuthoritiesOptions(user, authorities)}
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

function getSelectedAuthorities(select) {
    let result = [];
    let options = select && select.options;
    let opt;

    for (let i = 0; i < options.length; i++) {
        opt = options[i];

        if (opt.selected) {
            result.push({
                id: opt.value,
                authority: opt.text
            });
        }
    }
    return result;
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