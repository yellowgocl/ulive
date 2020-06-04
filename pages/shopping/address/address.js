var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();

Page({
  data: {
    addressList: [],
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.getAddressList();
  },
  getAddressList (){
    let that = this;
    util.request(api.AddressList).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          addressList: res.data
        });
      }
      wx.nextTick(() => {
        if (!that.data.addressList || that.data.addressList.length == 0) {
          wx.showModal({
            title: 'Oops~',
            content: '还未有收货地址，马上去添加？',
            confirmText: '去添加',
            cancelText: '稍后',
            success: (res) => {
              if (res.confirm) {
                that.addressAddOrUpdate()
              }
            }
          })
        }
      })
    });
  },
  addressAddOrUpdate (event) {
    let id = (event && event.currentTarget.dataset.addressId) ? '?id='+event.currentTarget.dataset.addressId : ''
    console.info(id)
    wx.navigateTo({
      url: `/pages/ucenter/addressAdd/addressAdd${id}`
    })
  },
  selectAddress(event){
    try {
      wx.setStorageSync('addressId', event.currentTarget.dataset.addressId);
    } catch (e) {

    }
    //选择该收货地址
    wx.navigateBack({
      url: '/pages/shopping/checkout/checkout'
    });
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})