import {Session} from "./Session"
import {message, Modal} from "ant-design-vue";
import {ulid} from 'ulid'

const getAuthorization = () => {
    return typeof Session.get() === 'string' ? "Bearer " + Session.get() : ''
}


let hasAlert = false
let hasRedirectUri = false

const noResponsePromise = () => {
    return new Promise(async resolve => {
        return resolve({
            status: -1,
            context: "未登录",
            message: "未登录"
        })
    })
}

const ajax = {
    storeAccessTokenURL: "",
    post(url, data = {}) {
        if (hasRedirectUri) {
            return noResponsePromise();
        }
        const formdata = data || {};
        let u = new URL(url);
        if (typeof formdata !== 'object') {
            return console.error("ajax.js:data只接受object");
        }

        // @ts-ignore

        return fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: new Headers({
                'content-type': 'application/json;charset=UTF-8',
                'Authorization': getAuthorization(),
                'Request-Id': ulid()
            }),
            //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(formdata)
        }).then((res) => {
            return new Promise(async resolve => {
                const body = await res.json()
                if (res.status === 500) {
                    Modal.error({
                        title: "500，服务器内部错误",
                        content: body.message
                    })
                }

                if (res.status === 403) {
                    Modal.confirm({
                        title: body.message,
                        content: ""
                    })
                }
                if (res.status === 401) {
                    hasRedirectUri = true;
                    Modal.confirm({
                        title: body.message,
                        content: "登录超时，请重新登录！",
                        onOk() {
                            storeSession()
                        },
                        okText:"确认",
                        onCancel:false
                    })
                }

                if (res.status === 404) {
                    Modal.error({
                        title: "资源不存在",
                        content: body.message
                    })
                }

                if (res.status === 400) {
                    message.warn(body.message)
                }

                return resolve({
                    status: res.status,
                    context: body.context,
                    message: body.message
                })
            })
        }).catch(error => {
            console.log(error)
            Modal.warning({
                title: "请求失败！",
                content: "网络故障，或者请求被阻止，请稍后再试！"
            })
        })
    },
    get(url, params) {
        if (hasRedirectUri) {
            return noResponsePromise();
        }
        params = params || {};
        let u = new URL(url);
        if (typeof params !== 'object') {
            return console.error("ajax.js:params只接受object");
        }

        Object.keys(params).forEach(name => {
            u.searchParams.append(name, params[name]);
        });

        const abortId = new AbortController();
        let request = new Request(u, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': getAuthorization(),
                'Request-Id': ulid()
                //'Content-Type': 'application/x-www-form-urlencoded',
            }, //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        });
        return fetch(request).then(res => {
            console.log(res)
            return new Promise(async resolve => {
                const body = await res.json()
                if (res.status === 500) {
                    Modal.error({
                        title: "500，服务器内部错误",
                        content: body.message
                    })
                }

                if (res.status === 403) {
                    Modal.confirm({
                        title: body.message,
                        content: ""
                    })
                }
                console.log("res.status === 401", res.status === 401)
                if (res.status === 401) {
                    hasRedirectUri = true;
                    Modal.confirm({
                        title: body.message,
                        content: "登录超时，请重新登录！",
                        onOk() {
                            storeSession()
                        },
                        okText:"确认",
                        onCancel:false
                    })
                }

                return resolve({
                    status: res.status,
                    context: body.context,
                    message: body.message
                })
            })
        }).catch(error => {
            console.log(error)
            Modal.warning({
                title: "请求失败！",
                content: "网络故障，或者请求被阻止，请稍后再试！"
            })
        });
    },
    put(url, data) {
        if (hasRedirectUri) {
            return noResponsePromise();
        }
        data = data || {}
        let request = new Request(url, {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                /*'Content-Type': 'multipart/form-data'*/
                //'Content-Type': 'application/x-www-form-urlencoded',
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': getAuthorization(),
                'Request-Id': ulid()
            },
            //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data)
        });
        return fetch(request).then(res => {
            return new Promise(async resolve => {
                const body = await res.json()
                if (res.status === 500) {
                    Modal.error({
                        title: "500，服务器内部错误",
                        content: body.message
                    })
                }

                if (res.status === 403) {
                    Modal.confirm({
                        title: body.message,
                        content: ""
                    })
                }
                /*if (res.status === 400) {
                    Modal.warn({
                        title: "参数错误",
                        content: body.message
                    })
                }*/

                if (res.status === 404) {
                    Modal.error({
                        title: "资源不存在",
                        content: body.message
                    })
                }

                if (res.status === 400) {
                    message.warn(body.message)
                }

                if (res.status === 401) {
                    hasRedirectUri = true;
                    Modal.confirm({
                        title: body.message,
                        content: "登录超时，请重新登录！",
                        onOk() {
                            storeSession()
                        },
                        okText:"确认",
                        onCancel:false
                    })
                }

                return resolve({
                    status: res.status,
                    context: body.context,
                    message: body.message
                })
            })
        }).catch(error => {
            console.log(error)
            Modal.warning({
                title: "请求失败！",
                content: "网络故障，或者请求被阻止，请稍后再试！"
            })
        });
    },
    patch(url, data) {
        if (hasRedirectUri) {
            return noResponsePromise();
        }
        data = data || {}
        let request = new Request(url, {
            method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                /*'Content-Type': 'multipart/form-data'*/
                //'Content-Type': 'application/x-www-form-urlencoded',
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': getAuthorization(),
                'Request-Id': ulid()
            },
            //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data)
        });
        return fetch(request).then(res => {
            return new Promise(async resolve => {
                const body = await res.json()
                if (res.status === 500) {
                    Modal.error({
                        title: "500，服务器内部错误",
                        content: body.message
                    })
                }

                if (res.status === 403) {
                    Modal.confirm({
                        title: body.message,
                        content: ""
                    })
                }
                /*if (res.status === 400) {
                    Modal.warn({
                        title: "参数错误",
                        content: body.message
                    })
                }*/

                if (res.status === 404) {
                    Modal.error({
                        title: "资源不存在",
                        content: body.message
                    })
                }

                if (res.status === 401) {
                    hasRedirectUri = true;
                    Modal.confirm({
                        title: body.message,
                        content: "登录超时，请重新登录！",
                        onOk() {
                            storeSession()
                        },
                        okText:"确认",
                        onCancel:false
                    })
                }

                if (res.status === 400) {
                    message.warn(body.message)
                }

                return resolve({
                    status: res.status,
                    context: body.context,
                    message: body.message
                })
            })
        }).catch(error => {
            console.log(error)
            Modal.warning({
                title: "请求失败！",
                content: "网络故障，或者请求被阻止，请稍后再试！"
            })
        });
    }
    ,
    delete(url, data, params) {
        if (hasRedirectUri) {
            return noResponsePromise();
        }
        params = params || {};
        data = data || {};
        let u = new URL(url);
        if (typeof params !== 'object') {
            return console.error("ajax.js:params只接受object");
        }
        Object.keys(params).forEach(name => {
            u.searchParams.append(name, params[name]);
        });

        let request = new Request(u, {
            method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                /*'Content-Type': 'multipart/form-data'*/
                //'Content-Type': 'application/x-www-form-urlencoded',
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': getAuthorization(),
                'Request-Id': ulid()
            },
            //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data)
        });
        return fetch(request).then(res => {
            return new Promise(async resolve => {
                const body = await res.json()
                if (res.status === 500) {
                    Modal.error({
                        title: "500，服务器内部错误",
                        content: body.message
                    })
                }

                if (res.status === 403) {
                    Modal.confirm({
                        title: body.message,
                        content: ""
                    })
                }
                /*if (res.status === 400) {
                    Modal.warn({
                        title: "参数错误",
                        content: body.message
                    })
                }*/

                if (res.status === 404) {
                    Modal.error({
                        title: "资源不存在",
                        content: body.message
                    })
                }

                if (res.status === 400) {
                    message.warn(body.message)
                }

                if (res.status === 401) {
                    hasRedirectUri = true;
                    Modal.confirm({
                        title: body.message,
                        content: "登录超时，请重新登录！",
                        onOk() {
                            storeSession()
                        },
                        okText:"确认",
                        onCancel:false
                    })
                }

                return resolve({
                    status: res.status,
                    context: body.context,
                    message: body.message
                })
            });
        }).catch(error => {
            console.log(error)
            Modal.warning({
                title: "请求失败！",
                content: "网络故障，或者请求被阻止，请稍后再试！"
            })
        });
    },
    upload(url, data) {
        if (hasRedirectUri) {
            return noResponsePromise();
        }
        data = data || {};
        let u = new URL(url);
        if (typeof data !== 'object') {
            return console.error("ajax.js:data只接受object");
        }

        let formdata = new FormData;

        Object.keys(data).forEach(field => {
            formdata.append(field, data[field]);
        })

        return fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'no-cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'multipart/form-data',
                //'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': getAuthorization(),
                'Request-Id': ulid()
            },
            //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data)
        }).then(res => {
            return new Promise(async resolve => {
                const body = await res.json()
                if (res.status === 500) {
                    Modal.error({
                        title: "500，服务器内部错误",
                        content: body.message
                    })
                }

                if (res.status === 403) {
                    Modal.confirm({
                        title: body.message,
                        content: ""
                    })
                }
                /*if (res.status === 400) {
                    Modal.warn({
                        title: "参数错误",
                        content: body.message
                    })
                }*/

                if (res.status === 404) {
                    Modal.error({
                        title: "资源不存在",
                        content: body.message
                    })
                }

                if (res.status === 400) {
                    message.warn(body.message)
                }

                if (res.status === 401) {
                    hasRedirectUri = true;
                    Modal.confirm({
                        title: body.message,
                        content: "登录超时，请重新登录！",
                        onOk() {
                            storeSession()
                        },
                        okText:"确认",
                        onCancel:false
                    })
                }

                return resolve({
                    status: res.status,
                    context: body.context,
                    message: body.message
                })
            })
        }).catch(error => {
            console.log(error)
            Modal.warning({
                title: "请求失败！",
                content: "网络故障，或者请求被阻止，请稍后再试！"
            })
        });
    }
}

const storeSession = () => {
    if(!ajax.storeAccessTokenURL){
        throw new Error("store access_tokens not found！")
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
        body: JSON.stringify({})
    }).then((res) => {
        return new Promise(async resolve => {
            if (res.status !== 201) {
                Modal.warning({
                    title: "请求登录链接失败",
                    content: "网络故障，或者请求被阻止，请稍后再试！"
                })
            } else {
                location.href = res.context.redirect_uri
                throw new Error("跳转到登录页面")
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
export default ajax