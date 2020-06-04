var api = require('../config/api.js');
var painter = require('./painter.js');
var app = getApp()
// var cloudApi = require('./api.js');

function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function redirectToLiveRoom(id, contextId, redirect = false) {
    let app = getApp()
    let inviteCode = wx.getStorageSync('inviteCode')
    contextId = contextId ? contextId : app ? app.globalData.contextId || '' : ''
    let p = {}
    if (!!id) {
        let roomId = id // 房间号
        let customParams = { path: 'pages/landing/landing', redirect: true, context_id: inviteCode || contextId } // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节
        p = {
            url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${encodeURIComponent(JSON.stringify(customParams))}`
        }
        redirect != -1 && wx.nextTick(() => {   
            redirect ? wx.redirectTo(p) : wx.navigateTo(p);
        })
    }
    return p
}

function getUserInfo(redirect = true) {
    let app = getApp()
    return new Promise((resolve, reject) => {
            request(api.ESHOP_USER_INFO, {}, 'GET', 'application/json').then(res => {       
                if (!!res.data && res.data.bind == 1) {
                    // app.globalData.inviteCode = res.data.inviteCode
                    wx.setStorageSync('inviteCode', res.data.inviteCode)
                    resolve(res)
                } else {
                    if (getCurrentPage().indexOf('pages/auth/btnAuth/btnAuth') < 0) { 
                        var p = {
                            url: '/pages/auth/btnAuth/btnAuth',
                        }
                        redirect ? wx.redirectTo(p) : wx.navigateTo(p)
                    }
                    reject(res)
            }
        })
    })
}

function bindInvite(contextId, redirect = -1) {
    let app = getApp()
    contextId = contextId || app.globalData.contextId
    return request(`${api.POSI_BIND_INVITE}?inviteCode=${contextId}`, {}, undefined, 'application/json', redirect).then(res => {
        console.info(res)
        return res
    })
}

function fetchShareQr(params){
    let app  = getApp()
    let inviteCode = wx.getStorageSync('inviteCode')
    let page = 'pages/index/index'
    let scene = 'default'
    if(params) {
        let temp = []
        for (let [key, value] of Object.entries(params)) {
            if(key == 'contextId' || key == 'context_id') key = 'c';
            else if(key == 'roomId' || key == 'room_id' || key == 'liveId' || key == 'live_id') key = 'l';
            else if(key == 'goodsId' || key == 'goods_id') key = 'g';
            else break;

            temp.push(`${key}=${value}`)
        }
        if (temp.length > 0) {
            scene = temp.join('&')
        }
        // path+='?'+temp.join('&')
        
    }
    return request(api.GET_SHARE_QR, { page, scene }, 'GET', 'application/json').then(res => {
        if (res.errno == 0) {
            return Promise.resolve(res)
        } else {
            return Promise.reject(res)
        }
    })
}

/**
 * 封封微信的的request
 */
//"application/x-www-form-urlencoded"
function request(url, data = {}, method = "POST", header = "application/x-www-form-urlencoded", redirect = true) {
    if (!url) {
        const ed = { code: -9999, message: 'url为空或者未定义', data: {} }
        console.error(ed)
        return Promise.reject(ed)
    }
    wx.showLoading({
        title: '加载中...',
    });
    header = (typeof(header) === 'string' || header instanceof String) ? { 'Content-Type': header, 'X-Nideshop-Token': wx.getStorageSync('token') } : Object.assign({}, header, { 'X-Nideshop-Token': wx.getStorageSync('token') })
    var that = this
    return new Promise(function (resolve, reject) {
        wx.request({
            url: url,
            data: data,
            method: method,
            header: header,
            success: function (res) {
                wx.hideLoading();
                if (res.statusCode == 200) {
                    if (res.data.errno == 401) {
                        toAuthPage(undefined, redirect)
                    } else {
                        resolve(res.data);
                    }
                    
                } else {
                    reject(res.errMsg);
                }

            },
            fail: function (err) {
                reject(err)
            }
        })
    });
}

/**
 * 检查微信会话是否过期
 */
function checkSession() {
    return new Promise(function (resolve, reject) {
        wx.checkSession({
            success: function () {
                resolve(true);
            },
            fail: function () {
                reject(false);
            }
        })
    });
}
function toAuthPage(p, redirect = true, navUrl){
    if (redirect == -2) {
        console.info('redirect == -2, 忽略重定向到授权页')
        return
    }
    let app = getApp()
    if (!app.globalData.isAuthing) {
        app.globalData.isAuthing = true
        wx.setStorageSync('navUrl', navUrl || getCurrentPage(true, true));
        logout().then(r => {
            var p = p || { url: '/pages/auth/btnAuth/btnAuth' }
            // redirect = redirect > 0
            redirect ? wx.redirectTo(p) : wx.navigateTo(p)
        })
    }
}
/**
 * 调用微信登录
 */
function login() {
    return new Promise(function (resolve, reject) {
        wx.login({
            success: function (res) {
                if (res.code) {
                    resolve(res);
                } else {
                    reject(res);
                }
            },
            fail: function (err) {
                reject(err);
            }
        });
    });
}
function logout() {
    return new Promise((resolve, reject) => {
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');     
        wx.removeStorageSync('inviteCode');
        wx.removeStorageSync('userId');
        wx.nextTick(() => {
            resolve(true)
        })
    })
}

function redirect(url) {

    //判断页面是否需要登录
    if (false) {
        wx.redirectTo({
            url: '/pages/auth/login/login'
        });
        return false;
    } else {
        wx.redirectTo({
            url: url
        });
    }
}

const restrictRect = function(sourceWidth, sourceHeight, targetWidth, targetHeight) {
    if (!sourceHeight && !sourceWidth) {
        return { width: 'auto', height: 'auto' }
    }
    sourceWidth = sourceWidth || sourceWidth
    sourceHeight = sourceHeight || sourceWidth
    var ratio = sourceWidth / sourceHeight
    targetWidth = targetWidth || sourceWidth
    targetHeight = targetHeight || sourceHeight
    return {
        width: targetWidth / ratio, height: targetHeight / ratio
    }
}

const getCurrentPage = function(abs, hasOptions = false) {
    const pages = getCurrentPages()
    if (pages.length == 0) {
        return 'pages/index/index'
    }
    const curPage = pages[pages.length - 1]
    let route = curPage ? curPage.route : 'pages/index/index'
    let options = curPage ? curPage.options : {}
    var result = abs ? `/${route}` : route
    if (hasOptions) {
        var params = []
        Object.keys(options).map(k => {
            params.push(`${k}=${options[k]}`)
        })
        result = `${result}?${params.join('&')}`
    }
    return result
}
const getCurrentPageOptions = function() {
    const pages = getCurrentPages()
    const curPage = pages[pages.length - 1]
    return curPage.options
}
const getShareMessageQuery = (query, formToString = true) => {
    query = query || {}
    let app = getApp()
    // 分享默认传入关系链id，当自身已登入则传用户自己的邀请id，否则传上一级介绍人的邀请id
    const _query = { context_id: wx.getStorageSync('inviteCode') || app.globalData.contextId }
    query = Object.assign({}, _query, query)
    var queryString = [];
    Object.keys(query).map(v => {
        queryString.push(`${v}=${query[v]}`)
    })
    return formToString ? queryString.join('&') : query;
}
const getShareMessage = (query, path, title, image, desc) => {
    const curPage = getCurrentPage()
    query = getShareMessageQuery(query)
    title = title || '智伴优选商城'
    desc = desc || title
    path = (path || curPage) + '?' + query;
    return { title, desc, path, query, imageUrl: image, complete: function() {
        console.info('share complete')
    } }
}

function showErrorToast(msg) {
    wx.showToast({
        title: msg,
        image: '/static/images/icon_error.png'
    })
}

function showSuccessToast(msg) {
    wx.showToast({
        title: msg,
    })
}

const LivePlayerStatus = Object.freeze({
    100: '未知状态', 101: '直播中', 102: '未开始', 103: '已结束', 104: '禁播', 105: '暂停中', 106: '异常', 107: '已过期'
});
function getLiveStatus(status) {
    return LivePlayerStatus[status] || LivePlayerStatus[100]
}

function downloadFile(url) {    
    return new Promise((resolve, reject) => {
        if (url) {
            wx.downloadFile({
                url,
                success: (e) => resolve(e.tempFilePath),
                fail: (e) => reject(e)
            })
        } else {
            reject('path 为空')
        }
    })
}
function downloadMediaAndSave(url) {
    return downloadFile(url).then(e => {
        return painter.saveToGallery(e)
    })
}
function downloadImageQueue(urls, update) {
    let p = Promise.resolve();
    let len = urls.length
    let count = 0
    return new Promise((resolve, reject) => {
        urls.forEach((url, index) => {
            downloadMediaAndSave(url).then(res => {
                count++ 
                update && update(count)
                if (count == len) {
                    resolve()
                }
            }, rej => {
                count++
                if (count == len) {
                    resolve()
                }
            })
        })
    })
    
    // let queue = urls.reduce((p, v, k) => {
    //     return downloadMediaAndSave(v).then(r => {
    //         console.info(r, k, v)
    //         return r
    //     })
    //     //return downloadMediaAndSave()
    // }, Promise.resolve())

    // queue.then((res) =>  {
    //     console.info(res)
    // })
    // return Promise.reject()
}

module.exports = {
    formatTime,
    request,
    redirect,
    showErrorToast,
    showSuccessToast,
    checkSession,
    login,
    getCurrentPage,
    getCurrentPageOptions,
    restrictRect,
    getLiveStatus,
    getUserInfo,
    getShareMessage,
    getShareMessageQuery,
    redirectToLiveRoom,
    bindInvite,
    fetchShareQr,
    toAuthPage,
    downloadImageQueue,
    downloadMediaAndSave,
    downloadFile,
}


