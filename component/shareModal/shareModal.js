
const util = require('../../utils/util.js')
const painter = require('../../utils/painter.js')
const app = getApp()

Component({
    options: {
        addGlobalClass: true,
        multipleSlots: true,
    },
    properties: {
        visible: {type: Boolean, value: false, observer(nv, ov) {}},
        layout: {type: Number, value: 2},
        width: {type: Number, value: 100},
        shareOption: { type: Object, value: {} },
        cache: {type: Boolean, value: true },
    },
    lifetimes: {
        ready() {
        }
    },
    data: {
        isShareTimeline: false,
        isLoading: true,
        painterData: null,
        painterPath: null,
    },
    methods: {
        onPervent() {

        },
        onShareTimeline() {
            // let hasPainter = !this.data.painterPath
            this.setData({
                isShareTimeline: true,
                painterPath: this.properties.cache ? this.data.painterPath : null
            })
            wx.nextTick(() => {
                if (!this.data.painterPath) {
                    this.drawCard()
                }
            })
            
        },
        onClose(e) {
            let visible = e && e.detail ? e.detail.visible : false;
            this.setData({ isShareTimeline: false, visible })

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
        drawCard() {
            let that = this
            let option = this.properties.shareOption
            if (option) {
                let data = option ? painter.drawShareCard(option) : painter.drawAppShareCard()
                this.setData({
                    isLoading: true,
                    painterData: data
                })
            
            } 
            
        },
        saveImage() {
            painter.saveToGallery(this.data.painterPath).then(res => {
                wx.showToast({
                    title: '保存成功',
                    duration: 2000
                })
                this.onClose()
            })
        }
    }       
})