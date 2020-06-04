const util = require('../../../utils/util.js');
const cloud = require('../../../utils/api.js');
const api = require('../../../config/api.js');

//获取应用实例
const app = getApp()
Page({
    data: {
        isHiddenModal: true,
        sessionKey: '',
        isBind: false,
        userInfo: {},
        code: '',
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        canIUsePhoneNumber: wx.canIUse('button.open-type.getPhoneNumber'),
    },
    onShow() {
      app.globalData.isAuthing = false;
    },
    onLoad: function(options) {
        let that = this;
        let navUrl = wx.getStorageSync("navUrl") || '/pages/index/index'
        let userInfo = wx.getStorageSync('userInfo');
        let token = wx.getStorageSync('token');
        that.setData({ navUrl })
        if (userInfo && token) {
            return;
        }
        that.refreshLogin()
    },
    refreshLogin() {
        let that = this;
        wx.login({
            success: function(res) {
                res.code && that.setData({ code: res.code })
            }
        });
    },
    showModal(opt, confirm = true) {
        let that = this
        opt = typeof opt == 'string' ? { message: opt } : opt 
        wx.showModal({
            title: '提示',
            content: opt.errmsg || opt.message || opt.content || '未知错误',
            showCancel: false,
            success: (res) => {
              (confirm && res.confirm) && that.refreshLogin()
            }
        });
    },
    bindGetPhoneNumber(e) {
        var that = this;
        // console.info('getphonenumber', that.data.code, that.data.sessionKey)
        if (that.data.code && that.data.sessionKey) {
          // util.checkSession()
          if(!!e.detail.iv) {
            util.request(api.GetPhoneNumber, {
              iv: e.detail.iv,
              sessionKey: that.data.sessionKey,
              encryptedData: e.detail.encryptedData
            }, 'POST', 'application/json').then(res => {
              if(res.errno == 0) {
                if (!that.data.bind) {
                  util.request(api.BindUser, {
                    "mobile": res.data.purePhoneNumber,
                    "inviteCode": app.globalData.contextId
                  }, undefined, 'application/json').then(bindRes => {
                    var isBind = bindRes.errno == 0
                    if (isBind) {
                      that.setData({isBind})
                      util.getUserInfo().then( userInfoRes=> {
                        wx.setStorageSync('userInfo', that.data.userInfo);
                        that.dismissGetPhoneNumberModal()
                        that.redirectTo(that.data)
                      }, userInfoRej => {
                        that.setData({isBind: false})
                      })
                      // that.redirectTo(that.data)
                      // wx.setStorageSync('userInfo', res.data.userInfo);    
                    } else {
                      app.globalData.contextId = ''
                      that.showModal({
                        title: '提示',
                        content: '信息有误，请重新尝试授权',
                        showCancel: false
                      });
                    }
                  })
                }
              } else {
                that.showModal({
                  title: '提示',
                  content: res.errmsg || '未知错误',
                  showCancel: false
                });
              }
            })
          } else {
            //用户取消授权获取手机号
          }
        }
      },
    bindGetUserInfo(e) {
        let that = this
        let hasCode = !!that.data.code
        if (hasCode) {
            util.request(api.AuthLoginByWeixin, {
                code: that.data.code,
                userInfo: e.detail
            }, 'POST', 'application/json').then(res => {
                if (res.errno === 0) {
                    //存储用户信息
                    that.setData({
                        sessionKey: res.data.sessionKey,
                        isBind: res.data.bind,
                        userInfo: res.data.userInfo
                    })
                    wx.setStorageSync('token', res.data.token);
                    wx.setStorageSync('userId', res.data.userId);
                    if(res.data.bind) {
                        util.getUserInfo().then(userInfoRes=> {
                            wx.setStorageSync('inviteCode', userInfoRes.data.inviteCode);
                            wx.setStorageSync('userInfo', that.data.userInfo);
                            util.bindInvite()
                            that.redirectTo(that.data)
                        }, userInfoRej => {
                            that.setData({isBind: false, userInfo: null})
                            that.showtModal(userInfoRej)
                        })
                        // wx.setStorageSync('userInfo', res.data.userInfo)
                    } else {
                        that.showGetPhoneNumberModal()
                    }
                } else {
                  wx.showModal({
                    title: 'Oops~',
                    content: (res.errmsg || '未知错误') + '请重试。',
                    showCancel: false,
                    success: (e) => {
                      if (e.confirm) {
                        that.refreshLogin()
                      }
                    }
                  })
                }
            }, rej => {
                 
            }).catch((e) => {

            })
        } else {
            this.showModal({ message: '微信登录中，请稍后…' })
        }
    },
    perventModalScroll() {

    },
    changeGetPhoneNumberModal(v) {
        // console.info(typeof v != 'boolean')
        v = (typeof v != 'boolean') ? !this.data.isHiddenModal : v
        this.setData({
            isHiddenModal: v
        })
    },
    showGetPhoneNumberModal(){
        this.changeGetPhoneNumberModal(false)
    },
    dismissGetPhoneNumberModal() {
        console.info('dismiss')
        this.changeGetPhoneNumberModal(true)
    },
    redirectTo(data) {
        console.info(data.navUrl, this.data.isBind)
        if (!this.data.isBind) {
          return
        }
        console.info('step0')
        if (data.navUrl < 0) {
          wx.navigateBack({ delta: 1 })
        } else if (data.navUrl && 
          (data.navUrl.indexOf('pages/index/index') >= 0 || 
            data.navUrl.indexOf('pages/btnAuth/btnAuth') >= 0)) {
              console.info('step1')
          wx.switchTab({ url: '/pages/index/index' })
        } else if (data.navUrl) {
          console.info('step2')
          if (data.navUrl.indexOf('pages/index/index') >= 0 || 
            data.navUrl.indexOf('pages/cart/cart') >= 0 ||
            data.navUrl.indexOf('pages/ucenter/index/index') >= 0 || 
            data.navUrl.indexOf('pages/catalog/catalog') >= 0) {
              console.info('step2xxxxx')
              wx.switchTab({ url: data.navUrl })
          } else {
            wx.redirectTo({ url: data.navUrl })
          } 
        } else {
          wx.switchTab({ url: '/pages/index/index' })
        }
        wx.removeStorageSync('navUrl');
    },
})