const accessTokenName = "access_token"
export const Session = {
    get() {
        return localStorage.getItem(accessTokenName)
    },

    set(token) {
        localStorage.setItem(accessTokenName, token)
    },
    remove() {
        localStorage.removeItem(accessTokenName)
    }
}