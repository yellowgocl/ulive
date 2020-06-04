var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var user = require('../../../services/user.js');
var app = getApp();

Page({
    data: {
        userInfo: {},
        hasMobile: '',
        inviteName: '暂无',
        incomeValue: 0,
        juniorCount: 0,
        level: null,
        menuData: [
            { icon: '/static/images/ic_mine_order.png', name: '我的订单', url: '/pages/ucenter/order/order' },
            // { icon: '/static/images/ic_mine_coupon.png', name: '优惠券', url: '/pages/ucenter/coupon/coupon' },
            { icon: '/static/images/ic_mine_fav.png', name: '我的收藏', url: '/pages/ucenter/collect/collect' },
            //{ icon: '/static/images/ic_mine_footprint.png', name: '我的足迹', url: '/pages/ucenter/footprint/footprint' },
            { icon: '/static/images/ic_mine_address.png', name: '地址管理', url: '../address/address' },
            { icon: '/static/images/ic_mine_concat.png', name: '联系客服', url: '', openType: 'contact' },
            // { icon: '/static/images/ic_mine_help.png', name: '帮助中心', url: '/pages/ucenter/help/help' },
            { icon: '/static/images/ic_mine_feedback.png', name: '意见反馈', url: '/pages/ucenter/feedback/feedback' },
        ]
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        // wx.setStorageSync('userInfo', null);
        // wx.setStorageSync('token', null);
    },
    onReady: function () {
    },
    onShow: function () {
        let that = this;
        let userInfo = wx.getStorageSync('userInfo');
        let token = wx.getStorageSync('token');
        // console.info('ucenter index onshow', userInfo, token)
        // 页面显示
        if (userInfo && token) {
            app.globalData.userInfo = userInfo;
            app.globalData.token = token;
        }

        this.setData({
            userInfo: app.globalData.userInfo,
        });

        util.request(api.ESHOP_USER_CENTER, null, 'GET').then((res) => {
            if (res.errno == 0) {
                let data = res.data
                that.setData({
                    inviteName: data.invite ? (data.invite.inviteName && data.invite.inviteName.length > 0 ? data.invite.inviteName : `用户${data.invite.invitePhoneNum.substring(data.invite.invitePhoneNum.length-4, data.invite.invitePhoneNum.length)}`) : '暂无',
                    incomeValue: data.income ? data.income.total : 0,
                    juniorCount: data.junior ? data.junior.total : 0,
                    level: data.level ? data.level.name : null
                })
            } else {
                that.setData({
                    inviteName: '暂无',
                    incomeValue: 0,
                    inviteName: 0,
                    level: null
                })
            }
        })

    },
    onHide: function () {
        // 页面隐藏

    },
    onUnload: function () {
        // 页面关闭
    },
    onClickIncomeAndJunior() {
        if (app.globalData.sceneInfo != 1036) {
            wx.navigateTo({
                url: '/pages/shareCard/shareCard'
            })
        }
    },
    bindGetUserInfo(e) {
      let userInfo = wx.getStorageSync('userInfo');
      let token = wx.getStorageSync('token');
      if (userInfo && token) {
        return;
      }
      wx.navigateTo({
        url: '/pages/auth/btnAuth/btnAuth'
      })
        // if (e.detail.userInfo){
        //     //用户按了允许授权按钮
        //     user.loginByWeixin(e.detail).then(res => {
        //         this.setData({
        //             userInfo: res.data.userInfo
        //         });
        //         app.globalData.userInfo = res.data.userInfo;
        //         app.globalData.token = res.data.token;
        //     }).catch((err) => {
        //         console.log(err)
        //     });
        // } else {
        //     //用户按了拒绝按钮
        //     wx.showModal({
        //         title: '警告通知',
        //         content: '您点击了拒绝授权,将无法正常显示个人信息,点击确定重新获取授权。',
        //         success: function (res) {
        //             if (res.confirm) {
        //                 wx.openSetting({
        //                     success: (res) => {
        //                         if (res.authSetting["scope.userInfo"]) {////如果用户重新同意了授权登录
        //                             user.loginByWeixin(e.detail).then(res => {
        //                                 this.setData({
        //                                     userInfo: res.data.userInfo
        //                                 });
        //                                 app.globalData.userInfo = res.data.userInfo;
        //                                 app.globalData.token = res.data.token;
        //                             }).catch((err) => {
        //                                 console.log(err)
        //                             });
        //                         }
        //                     }
        //                 })
        //             }
        //         }
        //     });
        // }
    },
    // launchAppError(e) {
    //     console.info(e)
    //     wx.showModal({
    //         title: 'Oops~',
    //         content: '当前场景不支持跳转到app',
    //         showCancel: false
    //     })
    // },
    exitLogin: function () {
        wx.showModal({
            title: '',
            confirmColor: '#b4282d',
            content: '退出登录？',
            success: function (res) {
                if (res.confirm) {
                    wx.removeStorageSync('token');
                    wx.removeStorageSync('userInfo');
                    wx.removeStorageSync('inviteCode');
                    app.globalData.userInfo = null;
                    app.globalData.token = null;
                    wx.switchTab({
                        url: '/pages/index/index',
                        userInfo: null
                    });
                }
            }
        })

    }
})