const cloudApi = require('../../utils/api.js');
const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');

//获取应用实例
const app = getApp()
Page({
  data: {
    inited: false,
    activeIndex: 0,
    outdateList: [],
    activeList: [],
    contextId: '',
    shareOption: null,
    modalVisible: false,
    query: {}
  },
  onShare(e) {
    let isLogin = !!wx.getStorageSync('inviteCode')
    if (isLogin) {
        this.setData({
            shareOption: e.detail,
            modalVisible: true
        })
    } else {
        wx.navigateTo({
            url: '/pages/auth/btnAuth/btnAuth'
        })
    }
  },
  fetchLiveListData() {    
    return cloudApi.fetchLiveList()
  },
  onPullDownRefresh(){
    // 增加下拉刷新数据的功能
    // this.setData({activeList: [], outdateList: []})
    this.getLiveListData();
  },
  getLiveListData() {
    var that = this
    that.data.activeList = []
    that.data.outdateList = []
    this.fetchLiveListData().then(res => {
      that.setData({
        activeList: res
      })
    }, rej => {
      console.info(rej)
      wx.showToast({
        title: `网络不给力, 状态码:${rej.code}`, icon: 'none', duration: 2000
      })
    })
  },
  onShareAppMessage: function (option) {
    let title = null;
    let image = null;
    let desc = null
    let list = this.data.activeList
    let item = list && list.length > 0 ? list[0] : null
    if (option.target && option.target.dataset.item) {
      item = option.target.dataset.item
    }
    if (item) {
      console.info(item)
      title = item.name
      image = item.shareImg;
    }
    // console.info(this.activeList, title, image, desc)
    return util.getShareMessage(item ? { live_id: item.roomid } : null, 'pages/landing/landing', title, image, desc)
  },
  onSwitchTab(e) {
    const index = e.target.dataset.index
    var that = this;
    if(this.data.activeIndex.toString() === index) {
      return false;
    } else {
      that.setData( { activeIndex: index })
    }
  },
  onSwiperChange(e) {
    this.setData( { activeIndex: e.detail.current });
  },
  onLoad: function (options) {
    // var options = wx.getEnterOptionsSync().query
    this.setData({
      contextId: options.context_id || app.globalData.contextId
    })
    if (!options.goods_id) {
      this.getLiveListData();
      const that = this
      wx.hideTabBar({animation: false})
      setTimeout(() => {
        that.setData({ inited: true })
        wx.showTabBar()
        // util.getUserInfo(true)
      }, 1000)
    }
    // this.getIndexData();
    // wx.hideTabBar({animation: false})
    // util.request(api.IsBind, undefined, 'GET', 'application/json' ,true).then(res => {
    //   that.setData({ inited: true })
    //   wx.showTabBar()
    // }, rej => {
    //   console.info(rej)
    // })
  },
  onReady: function () {
    // 页面渲染完成
    // wx.removeStorageSync('token');
    // wx.removeStorageSync('userInfo');
  },
  onShow: function (options) {
    // 页面显示
    wx.showTabBar()
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
})
