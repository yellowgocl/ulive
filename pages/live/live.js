const util = require('../../utils/util.js');
const painter = require('../../utils/painter.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');

//获取应用实例
const app = getApp()
Page({
  data: {
    painterData: {},
    shareCard: null,
    isCanDraw: false,
    info: { 
      id: '1181002',
      list_pic_url: "https://img.yzcdn.cn/upload_files/2020/03/31/FkjF49FcupwQUMSlZGBiXYyNXJRa.jpg!large.jpg",
      name: '1s儿童智能机器人',
      market_price: 859,
      retail_price: 659,
      goods_brief: "语音互动对话 英语翻译 早教学习机 故事陪伴教育"
    }
  },
  onShareAppMessage: function (a) {
    return util.getShareMessage()
  },
  onImgError(e) {
    console.info(e)
  },
  onImgOK(e) {
    wx.getImageInfo({
      src: e.detail.path,
      success: (res) => {
        console.info(res)
      }
    })
    this.setData({
      shareCard: e.detail.path,
      isCanDraw: true
    })
    // wx.showModal({
    //   title: '保存到手机',
    //   success: (res) => {
    //     res.confirm && painter.saveToGallery(e.detail.path)
    //   }
    // })
  },
  onLoad: function (options) {
    this.setData({ painterData: painter.drawShareCard(this.data.info) })
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
  },
})
