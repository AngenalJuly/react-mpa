const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // css提取为单独文件
const UglifyJsPlugin = require('uglifyjs-webpack-plugin') //js压缩
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin') //css压缩
const util = require('./config/util')

module.exports = (env, argv) => {
    const rootPath = path.resolve(__dirname, '')
    const isDev = argv.mode === 'development'
    const entry = util.getEnty('./src/pages')
    const htmls = util.createHtml('./src/pages')
    return {
        entry,
        output: {
            path: path.resolve(rootPath, './dist'),
            filename: '[name].js'
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader']
                },
                {
                    test: /\.styl$/,
                    use: [
                        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => [
                                    require('autoprefixer')({
                                        overrideBrowserslist: ['last 2 version']
                                    })
                                ],
                                name: isDev ? 'css/[name].[ext]' : 'css/[name].[contenthash:8].[ext]'
                            }
                        },
                        'stylus-loader'
                    ]
                },
                {
                    test: /(\.jsx|\.js)$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            query: {
                                presets: ['@babel/preset-env', '@babel/preset-react'],
                                plugins: ['@babel/plugin-proposal-class-properties']
                            }
                        }
                    ],
                    exclude: /node_modules/
                },
                {
                    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.ico$/],
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: isDev ? 'image/[name].[ext]' : 'image/[name].[contenthash].[ext]'
                    }
                },
                {
                    test: /\.(woff|svg|eot|ttf)\??.*$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: isDev ? 'font/[name].[ext]' : 'font/[name].[contenthash].[ext]'
                    }
                }
            ]
        },
        plugins: [
            ...htmls,
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css'
            })
        ],
        resolve: {
            alias: {
                src: path.resolve(rootPath, './src'),
                component: path.resolve(rootPath, './src/component'),
                http: path.resolve(rootPath, './src/http'),
                asset: path.resolve(rootPath, './src/asset'),
                mock: path.resolve(rootPath, './src/mock'),
                pages: path.resolve(rootPath, './src/pages'),
                util: path.resolve(rootPath, './src/util'),

                $page: path.resolve(rootPath, './src/pages/index/page'),
                $http: path.resolve(rootPath, './src/pages/index/http'),

                '^page': path.resolve(rootPath, './src/pages/home/page'),
                '^http': path.resolve(rootPath, './src/pages/home/http'),

                '@page': path.resolve(rootPath, './src/pages/about/page'),
                '@http': path.resolve(rootPath, './src/pages/about/http')
            },
            extensions: ['.jsx', '.js', '.json', '.styl', '.css']
        },
        optimization: {
            minimizer: [
                //压缩js
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: false
                }),
                new OptimizeCSSAssetsPlugin({})
            ],
            splitChunks: {
                //压缩css
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: true
                    }
                }
            }
        },
        devServer: {
            stats: 'errors-only', // 启动与构建时的log设置
            host: '0.0.0.0',
            port: 8888,
            open: 'http://127.0.0.1:8888',
            hot: true,
            overlay: {
                errors: true,
                warnings: true
            },
            proxy: {
                '/caizhi_miniapi': {
                    target: 'https://dev.qtrade.com.cn',
                    secure: false,
                    changeOrigin: true
                },
                '/baofei': {
                    target: 'http://192.168.0.103:9098',
                    secure: false,
                    changeOrigin: true,
                    pathRewrite: {
                        '/baofei': ''
                    }
                }
            }
        }
    }
}
