const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugins = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin

module.exports = {
    entry: {
        main: './src/views/index.js',
        psersonal: './src/views/personal/index.js'
    },
    devtool: '#source-map',
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, './dist'),
        filename: '[name].build.[chunkHash:8].js'
    },
    resolve:{
        extensions: ['.js', '.vue'],
        alias:{
            'vue':'vue/dist/vue.js',
            '@src': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets')
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                cacheBusting: true,
                transformToRequire: {
                    video: ['src', 'poster'],
                    source: 'src',
                    img: 'src',
                    image: 'xlink:href'
                }
                }
            },
            {
                test: /\.js$/ ,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.css/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                }),
                // use: [{
                //     loader: 'style-loader'
                // }, {
                //     loader: 'css-loader'
                // }]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000
                    }
                }]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugins({
            filename: 'index.html',
            template: path.resolve(__dirname, './src/views/index.html'),
            chunks: ['main', 'vendor', 'mainifest']
        }),
        new HtmlWebpackPlugins({
            filename: 'personal.html',
            template: path.resolve(__dirname, './src/views/personal/index.html'),
            chunks: ['personal', 'vendor', 'mainifest']
        }),
        new CommonsChunkPlugin({name: 'vendor'}),
        new webpack.optimize.CommonsChunkPlugin({name: 'mainifest', minChunks: Infinity}),
        new ExtractTextPlugin({
            filename: 'css/[name].css' //路径以及命名
        })
    ],
    devServer: {
        publicPath: '/',  //静态资源的根路径
        port: 80,  //webpack-dev-server服务器启动的端口
        host: '0.0.0.0', //webpack-dev-server服务器启动的host
        contentBase: path.join(__dirname, 'src')  //不是很清楚，但是总觉这个属性应该适合热替换有关，应该是服务器监听的资源的目录
    }
}

if (process.env.NODE_ENV === 'production') {
    // module.exports.devtool = '#source-map'

    let production_plugins = [
      new CleanWebpackPlugin(['dist/*.*', 'dist/*/*.*']),
  
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }),
  
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    ]
  
    let UglifyJsPlugin = new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    })
  
    if( process.env.NO_UGLIFY !== 'true' ) {
      production_plugins.push(UglifyJsPlugin)
    }
  
    module.exports.plugins = (module.exports.plugins || []).concat(production_plugins)
  }