const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const getPath = path => {
    const arr = []
    const existpath = fs.existsSync(path) //是否存在目录
    if (existpath) {
        const readdirSync = fs.readdirSync(path) //获取目录下所有文件
        readdirSync.forEach(item => {
            const currentPath = path + '/' + item
            const isDirector = fs.statSync(currentPath).isDirectory() //判断是不是一个文件夹
            if (isDirector) arr.push(item)
        })
        return arr
    }
    return []
}

exports.getPath = getPath

exports.getEnty = path => {
    const entry = {}
    getPath(path).map(item => {
        /**
         * 下面输出格式为{"about/about":".src/aobout/index.js"}
         * 这样目的是为了将js打包到对应的文件夹下
         */
        entry[`${item}/${item}`] = `${path}/${item}/index.js`
    })
    return entry
}

exports.createHtml = page_path => {
    const htmlArr = []
    getPath(page_path).forEach(item => {
        let infoData = {}
        try {
            // 读取pageinfo.json文件内容，如果在页面目录下没有找到pageinfo.json 捕获异常
            const infoJson = fs.readFileSync(`${page_path}/${item}/pageinfo.json`, 'utf-8') || '{}'
            infoData = JSON.parse(infoJson)
        } catch (err) {
            console.warn(err)
        }
        htmlArr.push(
            new HtmlWebpackPlugin({
                title: infoData.title ? infoData.title : 'webpack,react多页面架构',
                meta: {
                    keywords: infoData.keywords ? infoData.keywords : 'webpack，react，github',
                    description: infoData.description ? infoData.description : '这是一个webpack，react多页面架构'
                },
                chunks: [`${item}/${item}`], //引入的js
                template: './index.html',
                filename: item == 'index' ? 'index.html' : `${item}/index.html`, //html位置
                minify: {
                    //压缩html
                    collapseWhitespace: true,
                    preserveLineBreaks: true
                }
            })
        )
    })
    return htmlArr
}
