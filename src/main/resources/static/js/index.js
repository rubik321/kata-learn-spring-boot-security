const baseUrl = 'http://localhost:8080'
const roleUrl = baseUrl + '/api/v1/role'
const adminUrl = baseUrl + '/api/v1/admin'

const usersTableBodyEl = document.getElementById('users-tbody')
const newUserFormEl = document.getElementById('newUserForm')
const newUserFormAuthEl = newUserFormEl.querySelector('#newUserForm-authorities')
const navUsersTableTabEl = document.getElementById('nav-users-table-tab')

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

let userTableRows = ''
let allAuthorities = {}

// Get roles
// Method: GET
fetch(roleUrl)
    .then(res => res.json())
    .then(authorities => {
        allAuthorities = authorities
        newUserFormAuthEl.setAttribute('size', authorities.length)
        newUserFormAuthEl.innerHTML = getAuthoritiesOptions(new User(), authorities)
    })

// Get users
// Method: GET
fetch(adminUrl)
    .then(res => res.json())
    .then(users => renderUsersTable(users, allAuthorities, adminUrl))

// Create user
// Method: POST
newUserFormEl.addEventListener('submit', event => {
    event.preventDefault()

    const data = new FormData(event.target)
    const user = getUserFromFormData(data)

    fetch(adminUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(res => res.json())
        .then(user => {
            renderUsersTable([user], allAuthorities)
            navUsersTableTabEl.click()
            event.target.reset()
        })
});

function getUserFromFormData(data) {
    let user = new User()
    user.name = data.get('firstName')
    user.lastName = data.get('lastName')
    user.age = data.get('age')
    user.email = data.get('email')
    user.password = data.get('password')
    user.authorities = Array.from(newUserFormAuthEl.selectedOptions).map(option => {
        return {
            id: option.value,
            authority: option.text
        }
    })

    return user
}

function renderUsersTable(users, authorities) {
    users.forEach(user => {
        userTableRows += `
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
    usersTableBodyEl.innerHTML = userTableRows
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