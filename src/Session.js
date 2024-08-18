import {ulid} from "ulid";
import {Modal} from "ant-design-vue";
import ajax from "./Ajax.js";

const accessTokenName = "access_token"
const storeSession = (code) => {
    if (!ajax.storeAccessTokenURL) {
        throw new Error("ajax storeAccessTokenURL not found！")
    }
    if (!ajax.clientId) {
        throw new Error("missing clientId!")
    }
    if (!ajax.source) {
        throw new Error("missing source!")
    }
    return fetch(ajax.storeAccessTokenURL, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: new Headers({
            'content-type': 'application/json;charset=UTF-8',
            //'Authorization': getAuthorization(),
            'Request-Id': ulid()
        }),
        //redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({
            clientId: ajax.clientId,
            source: ajax.source,
            code: code || ''
        })
    }).then((res) => {
        return new Promise(async resolve => {
            const body = await res.json()
            console.log(body)
            if (body.context.redirect_uri) {
                location.href = body.context.redirect_uri
                console.log("跳转到登录页面")
            }
        })
    }).catch(error => {
        console.log(error)
        Modal.warning({
            title: "请求失败！",
            content: "网络故障，或者请求被阻止，请稍后再试！"
        })
    })
}

export const Session = {
    get() {
        return localStorage.getItem(accessTokenName)
    },

    set(token) {
        localStorage.setItem(accessTokenName, token)
    },
    remove() {
        localStorage.removeItem(accessTokenName)
    },
    storeByCode(code) {
        return storeSession(code)
    }
}