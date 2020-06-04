var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../utils/api.js');
var WxParse = require('../../lib/wxParse/wxParse.js');
var _ = require('../../lib/lodash')
Page({
    data: {
        searchMode: false,
        searchListMode: false,
        keyword: '',
        archivesLoading: false,
        archivesTotal: 0,
        page: 0,
        pageSize: 10,
        pickerValue: [0,0,0],
        selectedPickerValue: [0,0,0],
        pickerData: [],
        topLevelId: 0,
        pickerText: '全部',
        categories: [],
        filterCategories: [],
        topLevel: [],
        filterCategoryId: null,
        materialsData: [
            // { 
            //     id: 123,
            //     name: '营销素材号', 
            //     avatar_img: 'https://picsum.photos/seed/99/200', 
            //     desc: '营销素材分享内容，以下为自动生成文案阿萨德发顺丰 大发放打发斯蒂芬飞洒违法无法范德萨发达幅度为污染大使馆VB大🙁👺👺🤖👺👺👺👽👽👹👽👹👹👹👹👽👹👽👽👹👽👽 😻😼😿😿                ',
            //     data: [
            //         { image: 'https://picsum.photos/seed/1/200',  }, 
            //         { image: 'https://picsum.photos/seed/2/200',  },
            //         { image: 'https://picsum.photos/seed/3/200',  },
            //         { image: 'https://picsum.photos/seed/4/200',  },
            //         { image: 'https://picsum.photos/seed/5/200',  },
            //         { image: 'https://picsum.photos/seed/6/200',  },
            //     ],
            //     downloads: 123,
            // }, { 
            //     id: 124,
            //     name: '营销素材号', 
            //     avatar_img: 'https://picsum.photos/seed/100/200', 
            //     desc: '大发放打发斯蒂芬飞洒违法无法范德萨发达幅度为污染大使馆VB大',
            //     data: [
            //         { image: 'https://picsum.photos/seed/1/200',  }, 
            //         { image: 'https://picsum.photos/seed/12/200',  },
            //         { image: 'https://picsum.photos/seed/3/200',  },
            //         { image: 'https://picsum.photos/seed/4/200',  },
            //     ],
            //     downloads: 455,
            // }, { 
            //     id: 125,
            //     name: '营销素材号', 
            //     avatar_img: 'https://picsum.photos/seed/125/200', 
            //     desc: '视频素材12345阿斯蒂芬阿萨法阿士大夫撒旦韦尔奇爱的方法淡粉色热同仁堂',
            //     data: [
            //         { image: 'https://picsum.photos/seed/1/200', url: 'http://dev.apphelper.zhibankeji.com/course_test1.mp4' },
            //     ],
            //     downloads: 455,
            // },
        ]
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.fetchCategories()
        // api.fetchWbmsToken()
        // api.fetchMaterialArchives()
    },
    safeGetArrayValue(arr, index = 0, key = 'name', defalutValue = '全部') {
        if (arr && arr.length >= 0 && index < arr.length) {
            return arr[index][key]
        } else {
            return defalutValue
        }
    },
    onPickerCancel() {
        console.info('cancel')
    },
    updatePickerCategoryList(updateText = false) {
        // items = result
        let result = this.filterCategories
        let pickerValue = this.data.pickerValue
        let temp = result
        let top = this.topLevel
        let secondary = top[pickerValue[0]].children || []
        let floorIndex = 0
        if (pickerValue[1] < secondary.length) {
            floorIndex = pickerValue[1]
        } 
        let floor = temp[secondary[floorIndex].id] || []
        result = [top, secondary, floor]
        let updateData = { pickerData: result }
        if (updateText) {
            updateData.pickerText = `${this.safeGetArrayValue(top, pickerValue[0])}/${this.safeGetArrayValue(secondary, pickerValue[1])}/${this.safeGetArrayValue(floor, pickerValue[2])}`
        }
        this.setData(updateData)
        // 
    },
    onSwitchSearchMode() {
        let mode = !this.data.searchMode
        this.setData({
            searchMode: mode,
            searchListMode: mode ,
            page: 0,
            keyword: '',
            archivesLoading: false,
            isEnd: false
        })
        if (!mode) {
            wx.nextTick(() => this.fetchArchives(this.data.filterCategoryId))
        }
    },
    bindKeywordInput(e) {
        this.setData({
            keyword: e.detail.value
        })
    },
    onSearch() {
        this.setData({
            searchListMode: false,
            page: 0,
            isEnd: false
        })
        this.fetchArchives()
    },
    fetchCategories() {
        api.fetchMaterialCategories().then(res => {
            let pickerValue = this.data.pickerValue
            this.data.categories = res.content
            let items = this.data.categories
            this.filterCategories = _.chain(items).map(o => {
                o.parentId = o.parentId || 0
                // o.content = o.content || ""
                return o
            }).groupBy('parentId').value()
            let result = []
            _.map(items, (v, k) => {
                let children = this.filterCategories[v.id]
                // this.$set(v, 'children', [])
                if (!!children) {
                    children.unshift({name: '全部'})
                    v.children = children
                }
                if (!v.parentId) {
                    result.push(v)
                }
                return v
            })
            result.unshift({ name: '全部', children: [{name: '全部'}] })
            this.topLevel = result
            this.updatePickerCategoryList(true)
            this.fetchArchives()
        })
    },
    onPickerChange(e) {
        let pickerValue = e.detail.value
        let temp = this.filterCategories
        let top = this.topLevel
        let secondary = top[pickerValue[0]].children || []
        let floorIndex = 0
        if (pickerValue[1] < secondary.length) {
            floorIndex = pickerValue[1]
        } 
        let floor = temp[secondary[floorIndex].id] || []
        let filterCategoryId = this.safeGetArrayValue(floor, pickerValue[2], 'id', null ) || this.safeGetArrayValue(secondary, pickerValue[1], 'id', null ) ||this.safeGetArrayValue(top, pickerValue[0], 'id', null )
        if (this.data.filterCategoryId != filterCategoryId) {
            console.info('trigger load archives')
            this.setData({ page: 0, materialsData: [], isEnd: false })
            wx.nextTick(() => this.fetchArchives(filterCategoryId), true)
        }
        this.setData({
            pickerValue: e.detail.value,
            filterCategoryId,
            pickerText: `${this.safeGetArrayValue(top, pickerValue[0])}/${this.safeGetArrayValue(secondary, pickerValue[1])}/${this.safeGetArrayValue(floor, pickerValue[2])}`
        })
    },
    onPickerColumnChange(e) {
        // console.info(e.detail)
        let pickerValue = this.data.pickerValue
        pickerValue[e.detail.column] = e.detail.value
        this.setData({ pickerValue })
        wx.nextTick(() => this.updatePickerCategoryList())
    },
    onPreviewImage(e) {
        let item = e.currentTarget.dataset.data
        let current = e.currentTarget.dataset.current
        // let urls = item.data.map((item, index) => item.image)
        let urls = item.pics
        wx.previewImage({
            urls,
            current,
            success: (e) => {
                console.info(e)
            },
            fail: (e) => {
                wx.showToast({
                    content: e
                })
            }
        })
    },
    onSetClipboard(e) {
        let data = e.currentTarget.dataset.data
        if (data) {
            wx.setClipboardData({
                data: data.content
            })
            wx.showToast({ content: '您已经成功复制文案。' })
        }
        return Promise.resolve()
    },
    onGetContentAndMedia(e) {
        this.onSetClipboard(e)
        this.downloadMedia(e)
    },
    downloadMedia(e) {
        let item = e.currentTarget.dataset.data
        // let urls = item.pics.map((item, index) => item.url || item.image)
        this.downloadMediaHandler(item)
    },
    downloadMediaHandler(item) {
        let arr = []
        if (item.videos && item.videos.length > 0) {
            arr = item.videos
        } else if (item.pics && item.pics.length > 0) {
            arr = item.pics
        }
        let urls = _.concat([], arr)
        // let downloaded= 0
        // wx.showLoading({ title: `正在下载(0/${item.pics.length})` })
        api.analyticArchiveDownload(item.id).then(res => {
            item.downloadCount=item.downloadCount+1
            let index = _.findIndex(this.data.materialsData, ['id', item.id])
            this.setData({
                [`materialsData[${index}]`]: item
            })
        })
        wx.showLoading({ title: `正在下载(${0}/${urls.length})` })
        util.downloadImageQueue(urls, (index, url, res) => {
            console.info(urls)
            wx.showLoading({ title: `正在下载(${index}/${urls.length})` })
            // return res
            // wx.showLoading({ title: `正在下载(${index}/${item.pics.length})` })
        }).then(res => {
            wx.showModal({
                title: '保存完成',
                content: '请到手机相册查看。',
                showCancel: false,
                confirmText: '知道了',
                success: () => {}
            })
            // wx.hideToast()
            wx.hideLoading()
        }, rej => {
            wx.hideLoading()
        })
    },
    onReachBottom: function (cid) {
        console.info('on reach bottom loadng…')
        this.fetchArchives()
    },
    fetchArchives(cid) {
        if (this.data.archivesLoading || this.data.isEnd) {
            return
        }
        cid = cid || this.data.filterCategoryId
        if (this.data.page == 0) {
            this.setData({ materialsData: [] })
        }
        let p = this.data.page + 1
        this.setData({ archivesLoading: true })
        api.fetchMaterialArchives(cid, p, this.data.pageSize, this.data.keyword).then(res => {
            let archives = this.data.materialsData.concat(res.content)
            for (let i in archives) {
                let item = archives[i]
                WxParse.wxParse(`content.item`+item.id, 'html', item.content, this);
            }
            let data = { page: p, archivesLoading: false, archivesTotal: res.total, materialsData: archives, isEnd: res.archivesTotal == 0 || archives.length == res.total }
            this.setData(data)
        })
    },
    onPullDownRefresh() {
        this.setData({
            materialsData: [],
            page: 0,
            isEnd: false,
            archivesLoading: false
        })
        this.fetchArchives()
    },
    onReady: function () {

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