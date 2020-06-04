
var api = require('../config/api.js')
function drawAppShareCard(path) {
    path = path || api.APP_SHARE_CARD
    let stage = drawStage();
    let image = drawImage(path, 'aspectFill', {top:'0rpx', left: '0rpx', width: '750rpx'})
    stage.views.push(image)
    return stage
}
function drawShareCard(data) {
    if (data) {
        if (data.list_pic_url) {
            //商品
            return drawGoodsShareCard(data)
        } else {
            return drawLiveShareCard(data)
        }
    }
}
function drawLiveShareCard(data) {
    let stage = drawStage();
    let top = '152rpx'
    let left = '36rpx'
    let logoImage = drawImage('/static/images/ic_sharecard_logo.png', { top: 0, left: 0, width: '56rpx', height: '56rpx' })
    let goodsImage = drawImage(data.shareImg, 'aspectFill', { top, left: '18rpx', width: '714rpx' })
    let anchorName = drawText(`主播：${data.anchorName}`, { left: '56rpx', top: '764rpx' })
    let titleText = drawTitle(data.name, { left: '56rpx', top: '813rpx' })
    let userInfo = wx.getStorageSync('userInfo')
    let inviteCode = wx.getStorageSync('inviteCode')
    let avatarUrl = (userInfo.avatarUrl && userInfo.avatarUrl.length > 0) ? userInfo.avatarUrl : '/static/images/ic_mine_profile.png';
    let avatarImage = drawImage(avatarUrl, 'aspectFit', { borderRadius: '48rpx', width: '96rpx', height: '96rpx', left: '70rpx', top: '998rpx' })
    let userNameText = drawText(userInfo.nickName, { left: '190rpx', top: '1014rpx' })
    let inviteCodeText = drawText(`邀请码: ${inviteCode}`, { left: '190rpx', top: '1052rpx' })
    let qrCodePath = getQrCodePath(data.roomid, inviteCode, 'l')
    let qrCodeImage = drawImage(qrCodePath, 'aspectFit', { bottom: left, right: left, width: '212rpx' })
    stage.views.push(goodsImage, logoImage, anchorName, titleText, avatarImage, userNameText, inviteCodeText, qrCodeImage)
    return stage
}
function drawGoodsShareCard(goods) {
    let stage = drawStage();
    let top = '36rpx'
    let left = '36rpx'
    let goodsImage = drawImage(goods.list_pic_url, 'aspectFill', { top, left: top, width: '680rpx' })
    let logoImage = drawImage('/static/images/ic_sharecard_logo.png', { top: 0, left: 0, width: '56rpx', height: '56rpx' })
    let titleText = drawTitle(goods.name, { left: '56rpx', top: '816rpx' })
    let priceWidth = `￥${goods.retail_price}`.length * 32 + 20 + 56
    let priceText = drawPrice(`￥${goods.retail_price}`, { left: '56rpx', top: '746rpx' } )
    let marketPriceText = drawMarketPrice(`￥${goods.market_price}`, { left: `${priceWidth}rpx`, top: '760rpx' } )
    let userInfo = wx.getStorageSync('userInfo')
    let inviteCode = wx.getStorageSync('inviteCode')
    let avatarUrl = (userInfo.avatarUrl && userInfo.avatarUrl.length > 0) ? userInfo.avatarUrl : '/static/images/ic_mine_profile.png';
    let avatarImage = drawImage(avatarUrl, 'aspectFit', { borderRadius: '48rpx', width: '96rpx', height: '96rpx', left: '70rpx', top: '998rpx' })
    let userNameText = drawText(userInfo.nickName, { left: '190rpx', top: '1014rpx' })
    let inviteCodeText = drawText(`邀请码: ${inviteCode}`, { left: '190rpx', top: '1052rpx' })
    let qrCodePath = getQrCodePath(goods.id, inviteCode)
    let qrCodeImage = drawImage(qrCodePath, 'aspectFit', { bottom: top, right: left, width: '212rpx' })
    
    stage.views.push(goodsImage, logoImage, priceText, marketPriceText, titleText, avatarImage, userNameText, inviteCodeText, qrCodeImage)
    return stage
}

function getQrCodePath(id, contextId, prefix = 'g') {
    prefix = (!prefix || prefix.length == 0) ? 'g' : prefix;
    let scene = encodeURIComponent(`c=${contextId},${prefix}=${id}`)
    let page = 'pages/landing/landing'
    console.info(`${api.GET_SHARE_QR}?page=${page}&scene=${scene}`);
    return `${api.GET_SHARE_QR}?page=${page}&scene=${scene}`;
}
function drawStage(option = { background: '#fff', width: '750rpx', height: '1188rpx', borderRadius: 0, views: [] }) {
    return {
        ...option
    }
}

function drawBase(type, css = {}) {
    return {
        type,
        css
    }
}
function drawImage(url, mode, css) {
    let base = drawBase('image', css)
    return { url, mode,  ...base }
}
function drawText(text, css) {
    let base = drawBase('text', [{ fontSize: '24rpx', fontWeight: 'normal', color: '#364652' }, css])
    return { text, ...base }
}
function drawTitle(text, css) {
    let base = drawText(text, css)
    base.css.push({
        maxLines: 2,
        fontSize: '32rpx',
    })
    return base
}
function drawPrice(text, css) {
    let base = drawText(text, css)
    base.css.push({
        color: '#FF5295',
        fontWeight: 'bold',
        fontSize: '46rpx'
    })
    return base
}
function drawMarketPrice(text, css) {
    let base = drawText(text, css)
    base.css.push({
        fontSize: '30rpx',
        textDecoration: 'line-through',
    })
    return base
}


function saveToGallery(filePath) {
    //let reg = /^https?.+\.(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4)$/i
    let reg = /\.(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4)$/i
    let isVideo = reg.test(filePath)
    return new Promise((resolve, reject) => {
        let result = {
            filePath,
            success: (res) => {
                resolve(res)
                console.info(res)
            },
            fail: (rej) => {
                console.info(rej)
                reject(rej)
            }
        }
        isVideo ? wx.saveVideoToPhotosAlbum(result) : wx.saveImageToPhotosAlbum(result)
    })
}

module.exports = {
    drawShareCard, saveToGallery, drawAppShareCard
}
