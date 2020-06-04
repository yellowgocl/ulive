var api = require('../config/api.js');
var util = require('./util.js');
const moment = require('../lib/moment.js')
const config = require('../config/index.js');
const _defaultData = () => ({})
const contentType = 'application/json'
const _defaultHeader = (wbms = false) => {
    return {
        'Content-Type': contentType,
        deviceId: config.DEVICE_ID,
        deviceType: config.DEVICE_TYPE,
        deviceDetail: 'MicroMessenger',
        appId: wbms ? config.WBMS_APP_ID : config.APP_ID,
        token: wx.getStorageSync('zib_cloud_token'),
        authorization: wx.getStorageSync('zib_wbms_token')
    }
}

const request = (url, data, method = 'GET', header = contentType, wbms = false) => {
    // console.info(url, data)
    return util.request(url, data, method, header).then(res => {
        let func = wbms ? fetchWbmsToken : fetchToken
        if (res.code == 401) {
            let handler = wbms ? fetchWbmsToken() : fetchToken()
            return handler.then(tokenRes => {
                if((!wbms && tokenRes.code == 200) || (wbms &&tokenRes.authorization)) {
                    return util.request(url, data, method, _defaultHeader(wbms), wbms)
                } else {
                    return res
                }
            })
        } else {
            return res
        }
    })
}
const fetchWbmsToken = () => {
    const appId = config.WBMS_APP_ID;
    const timestamp = moment(new Date()).format('YYYYMMDDhhmmssSSS');
    const sign = 'into the unknow';
    return get(`${api.WBMS_AUTH}/${appId}/${sign}/${timestamp}`, { 'Content-Type': 'application/x-www-form-urlencoded' }).then(res => {
        wx.setStorageSync('zib_wbms_token', res.authorization);
        return res
    })
}
const get = (url, data, header, wbms = false) => {
    header = Object.assign({}, _defaultHeader(), header || {})
    return request(url, data, 'GET', header, wbms).then(res => {
        if (res.code == 200) {
            return res.data
        } else {
            return Promise.reject(res)
        }
    })
}
const post = (url, data, header, wbms = false) => {
    header = Object.assign({}, _defaultHeader(), header || {})
    return request(url, data, 'POST', header, wbms).then(res => {
        if (res.code == 200 || res.errno == 0) {
            return res.data
        } else {
            return Promise.reject(res)
        }
    })
}
const fetchLiveList = () => {
    return post(api.LIVE_LIST, _defaultData())
}
const fetchMaterialCategories = () => {
    return post(api.WBMS_FETCH_CATEGORY_LIST, { pageNo: 1, pageSize: 999, type: 0, orders: 'orderNum desc, id desc' }, undefined, true)
}
const fetchMaterialArchives = (categoryId, page = 1, pageSize = 999, keywords='', tags = [], orders = 'orderNum desc, id desc') => {
    return post(api.WBMS_FETCH_ARCHIVE_LIST, { pageNo: page, pageSize, categoryId, tags, orders, keywords }, undefined, true)
}
const fetchToken = () => {
    const appId = config.APP_ID
    const timestamp = moment(new Date()).format('YYYYMMDDhhmmssSSS');
    const test = 1;
    const sign = 'into the unknow';
    return post(api.CLOUD_TOKEN, { sign, test, timestamp, appId }, { 'Content-Type': 'application/x-www-form-urlencoded' }).then(res => {
        wx.setStorageSync('zib_cloud_token', res.authorization);
        return res
    })
}
const analyticArchiveDownload = (id) => {
    if (!!id) {
        return get(`${api.WBMS_ANALYTIC_ARCHIVE_DOWNLOD}/${id}`)
    }
    return Promise.reject()
}

function getUserInfo(redirect = false) {
    return util.request(api.ESHOP_USER_INFO, {}, 'GET', 'application/json').then(res => {
        if (res.data && res.data.bind == 1) {
            app.globalData.inviteCode = res.data.inviteCode
            return Promise.resolve(res)
        } else {
            var p = {
                url: '/pages/auth/btnAuth/btnAuth',
            }
            redirect ? wx.redirectTo(p) : wx.navigateTo(p)
            return Promise.reject(res)
        }
    })
}

module.exports = {
    analyticArchiveDownload, fetchLiveList, fetchToken, getUserInfo, fetchWbmsToken, fetchMaterialCategories, fetchMaterialArchives
}
