import {Session} from "./Session"
import {message, Modal} from "ant-design-vue";

const getAuthorization = () => {
    return typeof Session.get() === 'string' ? "Bearer " + Session.get() : ''
}
let hasAlert = false
const ajax = {
    post(url, data, errorAlertConfig = {}) {
        const formdata = data || {};
        let u = new URL(url);
        if (typeof formdata !== 'object') {
            return console.error("ajax.js:data只接受object");
        }

        let defaultErrorConfig = {
            500: true,
            404: true,
            403: true
        }

        // @ts-ignore
        const mergeErrorConfig = Object.assign({}, defaultErrorConfig, errorAlertConfig)
        return fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: new Headers({
                'content-type': 'application/json;charset=UTF-8',
                'Authorization': getAuthorization()
            }),
            //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(formdata)
        }).then((res) => {
            return new Promise(async resolve => {
                const body = await res.json()
                if (res.status === 500 && mergeErrorConfig[500]) {
                    Modal.error({
                        title: "500，服务器内部错误",
                        content: body.message
                    })
                }

                if (res.status === 403 && mergeErrorConfig[403]) {
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

                if (res.status === 404 && mergeErrorConfig[404]) {
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
            Modal.warning({
                title: "请求失败！",
                content: "网络故障，或者请求被阻止，请稍后再试！"
            })
            return new Promise(resolve => {
                //console.error(errorMsg)
                return resolve({
                    message: errorMsg
                })
            })
        })
    },
    get(url, params) {
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
                'Authorization': getAuthorization()
                //'Content-Type': 'application/x-www-form-urlencoded',
            }, //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
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

                return resolve({
                    status: res.status,
                    context: body.context,
                    message: body.message
                })
            })
        });
    },
    put(url, data) {
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
                'Authorization': getAuthorization()
            },
            //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data)
        });
        return fetch(request).then(res => {
            if (res.status === 401) {
                if (pathname !== '/login' && pathname !== '/') {
                    if (!hasAlert) {
                        hasAlert = true
                        return Modal.info({
                            title: '登录超时',
                            content: "请重新登录",
                            okText: "好的",
                            onOk() {
                                hasAlert = false
                                location.href = '/login'
                            },
                        })
                    }
                }
            }
            return res.json()
        });
    },
    patch(url, data) {
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
                'Authorization': getAuthorization()
            },
            //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data)
        });
        return fetch(request).then(response => {
            if (response.status === 401) {
                if (pathname !== '/login' && pathname !== '/') {
                    if (!hasAlert) {
                        hasAlert = true
                        return Modal.info({
                            title: '登录超时',
                            content: "请重新登录",
                            okText: "好的",
                            onOk() {
                                hasAlert = false
                                location.href = '/login'
                            },
                        })
                    }
                }
            }
            if (response.status === 405) {
                Modal.error({
                    title: "405 Method Not Allowed",
                    content: "该接口禁止PATCH请求"
                })
            }
            return response.json()
        });
    }
    ,
    delete(url, data, params) {
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
                'Authorization': getAuthorization()
            },
            //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data)
        });
        return fetch(request).then(res => {
            return new Promise(async resolve => {
                const body = await res.json()
                if (res.status === 500 && mergeErrorConfig[500]) {
                    Modal.error({
                        title: "500，服务器内部错误",
                        content: body.message
                    })
                }

                if (res.status === 403 && mergeErrorConfig[403]) {
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

                if (res.status === 404 && mergeErrorConfig[404]) {
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
            });
        });
    },
    upload(url, data) {
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
                'Authorization': getAuthorization()
            },
            //redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data)
        }).then(response => {
            if (response.status === 500) {
                return alert("服务器内部错误，请稍后再试一试。")
            }
            if (response.status === 429) {
                return alert("Too Many Requests.")
            }
            if (response.status === 401) {
                if (pathname !== '/login' && pathname !== '/') {
                    if (!hasAlert) {
                        hasAlert = true
                        return Modal.info({
                            title: '登录超时',
                            content: "请重新登录",
                            okText: "好的",
                            onOk() {
                                hasAlert = false
                                location.href = '/login'
                            },
                        })
                    }
                }

            }
            return response.json()
        });
    }
}
export default ajax