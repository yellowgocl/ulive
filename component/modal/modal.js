
const util = require('../../utils/util.js')
const app = getApp()

Component({
    options: {
        addGlobalClass: true,
        multipleSlots: true,

    },
    properties: {
        visible: {type: Boolean, value: false, observer(nv, ov, chagedPath) {
            console.info(nv, ov)

        }},
        openType: {type: String, value: 'getUserInfo'},
        title: {type: String, value: '智伴优选商城'},
        layout: {type: Number, value: 9},
        width: {type: Number, value: 100}
    },
    lifetimes: {
        ready() {
        }
    },
    data: {
        
    },
    methods: {
        onPervent() {

        },
        onInput(e) {
            console.info(e)
        },
        onClose() {
            let visible = false
            this.setData({ visible })
            this.triggerEvent('close', { visible }, {})
        }
    }       
})