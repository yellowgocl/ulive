var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var painter = require('../../utils/painter.js');
var app = getApp()
Page({
    data: {
        painterData: null,
        isLoading: false,
        painterPath: null,
    },
    onLoad: function (options) {
        this.setData({
            isLoading: true,
            painterData: painter.drawAppShareCard(api.APP_SHARE_CARD)
        })
    },
    onImgOK(e) {
        
        this.setData({
            isLoading: false,
            painterPath: e.detail.path
        })
    },
    onImgError(e) {
        console.info(e)
    },
    saveImage() {
        painter.saveToGallery(this.data.painterPath).then(res => {
            wx.showModal({
                title: '保存成功',
                content: '1.、调起微信扫一扫选取相册图片\r\n2、识别图中二维码下载智伴优学APP',
                showCancel: false,
                duration: 2000,
                confirmText: '知道了',
                success: (e) => {
                    e.confirm && wx.navigateBack()
                }
            })
        })
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
})