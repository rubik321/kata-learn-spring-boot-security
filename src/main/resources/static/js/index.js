const baseUrl = 'http://localhost:8080'
const usersTableBodyEl = document.getElementById('users-tbody')
const adminUrl = baseUrl + '/api/v1/admin'

fetchUsersTable()
let users = JSON.parse(localStorage.getItem('users'))
let allAuthorities = JSON.parse(localStorage.getItem('allAuthorities'))

renderUsersTable(users, allAuthorities)

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

function renderUsersTable(users, allAuthorities) {
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
                    <td>${getModal(user, allAuthorities, 'edit', adminUrl)}</td>
                    <td>${getModal(user, allAuthorities, 'delete', adminUrl)}</td>
                </tr>
            `
    })
    usersTableBodyEl.innerHTML = output
}

function getModal(user, allAuthorities, type, url) {
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
        <div class="modal" tabindex="-1" role="dialog"
             id="${type}Modal-user${user.id}">
            <div class="modal-dialog" role="document">
                <div class="modal-content">

                    <form method="POST"
                          action="${url}/${user.id}" id="${type}Form-user${user.id}">

                        <div class="modal-header">
                            <h5 class="modal-title">${capitalize(type)} user</h5>
                            <button type="button" class="btn-close"
                                    data-bs-dismiss="modal"}
                                    aria-label="Close"></button>
                        </div>

                        <div class="modal-body">
                            <div class="row mb-4">
                                <label for="id" class="fw-bold text-center">ID</label>
                                <input type="text" id="${type}Form-user${user.id}-id"
                                       class="form-control" readonly
                                       name="id" value="${user.id}">
                            </div>

                            <div class="row mb-4">
                                <label for="firstName"
                                       class="fw-bold text-center">First
                                    name</label>
                                <input type="text" id="${type}Form-user${user.id}-firstName"
                                       class="form-control" 
                                       name="name"
                                       value="${user.name}"
                                       disabled="${disabled}">
                            </div>

                            <div class="row mb-4">
                                <label for="lastName"
                                       class="fw-bold text-center">Last
                                    name</label>
                                <input type="text" id="${type}Form-user${user.id}-lastName"
                                       class="form-control"
                                       name="lastName"
                                       value="${user.lastName}"
                                       disabled="${disabled}">
                            </div>

                            <div class="row mb-4">
                                <label for="age"
                                       class="fw-bold text-center">Age</label>
                                <input type="number" id="${type}Form-user${user.id}-age"
                                       class="form-control" 
                                       name="age"
                                       value="${user.age}"
                                       disabled="${disabled}">
                            </div>

                            <div class="row mb-4">
                                <label for="email"
                                       class="fw-bold text-center">Email</label>
                                <input type="email" id="${type}Form-user${user.id}-email"
                                       class="form-control" 
                                       name="email"
                                       value="${user.email}"
                                       disabled="${disabled}">
                            </div>

                            <div class="row mb-4" hidden="${disabled}">
                                <label for="password"
                                       class="fw-bold text-center">Password</label>
                                <input type="password" id="${type}Form-user${user.id}-password"
                                       class="form-control"
                                       name="password"
                                       value="${user.password}"
                                       disabled="${disabled}">
                            </div>

                            <div class="row mb-4">
                                <label for="role"
                                       class="fw-bold text-center">Role</label>
                                <select id="${type}Form-user${user.id}-formSelect" 
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
                data-bs-target="#${type}User${user.id}"
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

function capitalize(s)
{
    return s[0].toUpperCase() + s.slice(1);
}