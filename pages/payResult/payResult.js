var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const pay = require('../../services/pay.js');

var app = getApp();
Page({
  data: {
    status: false,
    orderId: 0
  },
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId || 24,
      status: options.status
    })
    // wx.nextTick(() => this.updateSuccess());
  },
  onReady: function () {

  },
  onShow: function (options) {
    // 页面显示
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: this.data.orderId || 24,
      status: this.data.status
    })
    wx.nextTick(() => this.updateSuccess());
  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  },
  
  updateSuccess: function () {
    let that = this
    util.request(api.OrderQuery, { orderId: this.data.orderId}).then(function (res) {
      that.setData({ status: res.errno == 0 })
    })
  },

  payOrder() {
    pay.payOrder(parseInt(this.data.orderId)).then(res => {
      this.setData({
        status: true
      });
    }).catch(res => {
      util.showErrorToast('支付失败');
    });
  }
})