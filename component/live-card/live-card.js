const util = require('../../utils/util.js')
const app = getApp()
Component({
    options: {
        addGlobalClass: true,
    },
    properties: {
        content: { type: Object },
    },
    lifetimes: {
        ready() {
            //console.info('ready', util.getLiveStatus(this.content.liveStatus), )
            var content = this.properties.content
            this.setData({ statusText: util.getLiveStatus(content.liveStatus) })
        }
    },
    data: {
        statusText: '',
        modalVisible: false,
    },
    
    methods: {
        onShare() {
            // this.setData({
            //     modalVisible: true
            // })
            
            this.triggerEvent('share', this.properties.content, {})
        },
        oncatch: (e) => { /* 阻止微信直播定义控件冒泡用 */ },
        onClickGoods: (e) => {
            const url = e.currentTarget.dataset.url
            if (url && url.length > 0) {
                wx.navigateTo({ url: `/${url}` })
            }
        },
        onClickCard: (e) => {
            let roomId = e.currentTarget.dataset.id // 房间号
            util.redirectToLiveRoom(roomId)
            // let customParams = { path: 'pages/index/index', context_id: app.globalData.contextId } // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节
            // wx.navigateTo({
            //     url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${encodeURIComponent(JSON.stringify(customParams))}`
            // })
        }
    }
})