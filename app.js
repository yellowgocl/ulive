var util = require('./utils/util')
var livePlayer = requirePlugin('live-player-plugin')
/* wx11ed3e37387289b8  */

App({
    autoRedirect: function(path, query, context, options) {
        context = context || getApp();
        console.info(query)
        let goodsId;
        let liveId;
        let redirect;
        // const scene = decodeURIComponent(query.scene)
        if (query) {
            let scene = query.scene ? decodeURIComponent(query.scene) : null;
            var contextId = query.context_id || query.contextId
            if (contextId) {
                this.globalData.contextId = contextId;
            }
            goodsId = query.goods_id || query.goodsId;
            liveId = query.live_id || query.liveId;
            redirect = !!query.redirect
            if (scene) {
                // console.info(scene)
                scene = scene.split(',')
                for (let item in scene) {
                    let p = scene[item].split('=')
                    if (p.length > 1) {
                        if (p[0] == 'c' && p[1] && p[1].length > 0) {
                            contextId = p[1]
                        }
                        if (p[0] == 'l' && p[1] && p[1].length > 0 ) {
                            liveId = p[1]
                        }
                        if (p[0] == 'g' && p[1] && p[1].length > 0 ) {
                            goodsId = p[1]
                        }
                    }
                }
            }
        } 
        // console.info(path, redirect, goodsId, liveId)
        if (path && path.indexOf('pages/landing/landing') >= 0) {
            
            if (goodsId) {
                wx.setStorageSync('navUrl', '/pages/goods/goods')
                wx.redirectTo({ url: `/pages/goods/goods?id=${goodsId}` })
            } else if (liveId) {
                let isLogin = !!wx.getStorageSync('inviteCode')
                if (isLogin){
                    util.redirectToLiveRoom(liveId, contextId, true)
                } else {
                    util.toAuthPage(undefined, true, util.redirectToLiveRoom(liveId, contextId, -1).url)
                }
                
            } else if (redirect) {
                // 忽略自动跳转分流，用于直播房间分享后进入
            } else {
                wx.switchTab({ url: '/pages/index/index' })
            }
            wx.nextTick(() => util.bindInvite(contextId || "", (goodsId || liveId) ? -2 : true))
        }
        // console.info(path, query)
    },
    onShow:function(options) {
        let that = this
        let duration= 500
        if (options.scene == 1007 || options.scene == 1008 || options.scene == 1044) {
            livePlayer.getShareParams()
                .then(res => {
                    let opt = res.custom_params || {}
                    setTimeout(() => that.autoRedirect(opt.path, opt), duration)
                    // console.log('get room id', res.room_id) // 房间号
                    // console.log('get openid', res.openid) // 用户openid
                    // console.log('get share openid', res.share_openid) // 分享者openid，分享卡片进入场景才有
                    // console.log('get custom params', res.custom_params) // 开发者在跳转进入直播间页面时，页面路径上携带的自定义参数，这里传回给开发者
                }).catch(err => {
                    setTimeout(() => that.autoRedirect(options.path, options.query), duration)
                    console.log('get share params', err)
                })
        } else {
            setTimeout(() =>that.autoRedirect(options.path, options.query), duration)
        }
        that.globalData.sceneInfo = options.scene
        // console.info(that.globalData.sceneInfo)
    },
    onLaunch: function (options) {

        // wx.setStorageSync("navUrl", `/${options.path}`)
        //获取小程序更新机制兼容
        // this.autoRedirect(options.path, options.query, this)
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(function () {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启应用？',
                            success: function (res) {
                                if (res.confirm) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function () {
                        // 新的版本下载失败
                        wx.showModal({
                            title: '已经有新版本了哟~',
                            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
                        })
                    })
                }
            })
        } else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法更好体验程序，请升级到最新微信版本后重试。'
            })
        }
    },
    globalData: {
        userInfo: {
            nickName: 'Hi,游客',
            userName: '点击去登录',
            
        },
        contextId: '', // 优创关系链上级id
        token: '',
        userCoupon: 'NO_USE_COUPON',//默认不适用优惠券
        courseCouponCode: {},//购买课程的时候优惠券信息
    },
    // 下拉刷新
    onPullDownRefresh: function () {
        // 显示顶部刷新图标
        wx.showNavigationBarLoading();
        var that = this;
        // 隐藏导航栏加载框
        wx.hideNavigationBarLoading();
        // 停止下拉动作
        wx.stopPullDownRefresh();
    },
    // 更新小程序
    updateManager: function () {
        //获取系统信息 客户端基础库
        wx.getSystemInfo({
            success: function (res) {
                //基础库版本比较，版本更新必须是1.9.90以上
                const v = util.compareVersion(res.SDKVersion, '1.9.90');
                if (v > 0) {
                    const manager = wx.getUpdateManager();
                    manager.onCheckForUpdate(function (res) {
                        // 请求完新版本信息的回调
                        //console.log(res.hasUpdate);
                    });
                    manager.onUpdateReady(function () {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启应用？',
                            success: function (res) {
                                if (res.confirm) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    manager.applyUpdate();
                                }
                            }
                        })
                    });
                    manager.onUpdateFailed(function () {
                        // 新的版本下载失败
                    });
                } else {
                    // wx.showModal({
                    //   title: '温馨提示',
                    //   content: '当前微信版本过低，无法更好体验程序，请升级到最新微信版本后重试。'
                    // })
                }
            },
        })
    }
})