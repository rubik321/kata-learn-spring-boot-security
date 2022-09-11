export function getAuthorityName(a) {
    return a.authority.replace('ROLE_', '')
}

export function getAuthoritiesOptions(user, authorities) {
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