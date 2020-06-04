var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    navList: [],
    categoryList: [],
    currentCategory: {},
    goodsList: {},
    scrollLeft: 0,
    scrollTop: 0,
    goodsCount: 0,
    scrollHeight: 0,
    isShowNav: false,
    isOverBanner: false,
    bannerHeight: 200
  },
  onLoad: function (options) {
    // this.getCatalog();
  },
  onBannerLoaded(e) {
    var query = wx.createSelectorQuery()
    var that = this
    query.select('.banner').boundingClientRect((rect) => {
      that.setData({ bannerHeight: rect.height || 200 })
    }).exec()
  },
  getCatalog: function () {
    //CatalogList
    let that = this;
    let goodsList = that.data.goodsList
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.CatalogList).then(function (res) {
        that.setData({
          navList: res.data.categoryList,
          currentCategory: res.data.currentCategory
        });
        res.data.currentCategory.subCategoryList.forEach(element => {
          goodsList[element.id] = []
          that.setData({ goodsList })
          that.getGoodsList(element.id).then(res => {
            goodsList[element.id] = res.data.goodsList
            that.setData({ goodsList })
          })
        });
        wx.hideLoading();
      });
    util.request(api.GoodsCount).then(function (res) {
      that.setData({
        goodsCount: res.data.goodsCount
      });
    });
  },
  onScroll(e) {
    this.setData({ isOverBanner: e.detail.scrollTop >= this.data.bannerHeight })
  },
  getGoodsList(categoryId) {
    return util.request(api.GoodsList, {categoryId: categoryId, page: 1, size: 4})
  },
  getCurrentCategory: function (id) {
    let that = this;
    util.request(api.CatalogCurrent, { id: id })
      .then(function (res) {
        that.setData({
          currentCategory: res.data.currentCategory
        });
      });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.getCatalog();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  getList: function () {
    var that = this;
    util.request(api.ApiRootUrl + 'api/catalog/' + that.data.currentCategory.cat_id)
      .then(function (res) {
        that.setData({
          categoryList: res.data,
        });
      });
  },
  switchCate: function (event) {
    var that = this;
    var currentTarget = event.currentTarget;
    if (this.data.currentCategory.id == event.currentTarget.dataset.id) {
      return false;
    }

    this.getCurrentCategory(event.currentTarget.dataset.id);
  }
})