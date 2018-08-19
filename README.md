webpack一般包含四个配置，entry、output、module（loader）、plugins。
#### entry 
入口文件配置，可以配置单入口，也可以配置多入口，  。如果是单入口，则只需要配置一个字符串，如果是多入口文件则需要配置成{}，值以 *<name>: <entry file path>* 的方式设置。
```
// 单入口文件
entry: './src/index.js'
// 多入口文件
entry: {
    'index': './src/index.js',
    'personal': './src/personal/index.js'
}
```
这里需要说下，建议使用多入口配置的方式时，不要一个一个手动配置，可以结合glob模块，用js去遍历目录下的js文件（建议一般main.js），然后动态设置。可以看下我这边文件的思路：https://juejin.im/post/5b7392b16fb9a009b82c05de
#### output 
打包文件配置，一般包含三个属性publicPath、path、filename。  

**path**: 打包的路径，默认不指定的话是打包到根目录的。一般我们会配置到根目录下的某个文件夹，需要结合path模块一起使用，比如:
```
output: {
    path: path.resolve(__dirname, './dist')
}
```
这样就把打包文件放入到根目录的dist目录下。

**filename**: 打包后的文件名，必须要配置，可以使用[name]来动态获取入口文件配置的<name>。
```
entry: {
  'main': './src/index.js'  
},
output: {
    filename: '[name].js'
}
```
则打包后的文件名为main.js。如果我们还要防止cdn/浏览器缓存，我们可以设置hash值的文件名。
```
output: {
    filename: '[name].[chunkHash:8].js'  //会生成8位哈希值的文件名
}
```

**publicPath**：一般是cdn域名，如果是开发模式，可以配置成"/",表示根目录。打包后的js引入的url的前缀。如果配置publicPath为cdn.com，则引入的js的url应该是这样的：
```
<script src="http://cdn.com/main.js"></script>
```
通过设置entry和output就可以实现最简单的打包了，但只是js文件重命名和移动位置而已。  

#### loader
接下来我们希望使用js的es6语法，但是我们知道，现在浏览器对es6的支持还不全面，所以如果我们想要使用es6的话，就需要利用babel对我们的es6进行装化，这个时候我们的loader就登场了。  

*webpack的设计理念，所有资源都是“模块”，webpack内部实现了一套资源加载机制，loader的功能，就是将符合我们配置条件的资源，进行加载并做一系列的转化。使其变为浏览器可识别的资源。*  

所以，loader可以将浏览器无法识别的es6转为浏览器识别的es5，将浏览器无法识别的less转为浏览器识别的css，将浏览器无法识别的vue转为浏览器识别的js。

为了使用es6语法，那么我们接下来需要配置loaders，使用babel-loader来转化es6语法。注意：要先安装babel-loader(npm install --save-dev babel-loader babel-core)。

```
// webpack设计理论，所有资源都是模块，所以使用module
module: [
    // 配置规则
    rules: [
        {
            test: /\.js$/ , // 配置要转为的资源规则，正则表达式，即所有的js文件
            exclude: /node_modules/, // 排除的文件
            loader: 'babel-laoder', // 使用babel loader来转化es6
            options: {
                presets: ['es2015']
            } // 将es6转为es5 
        }
    ]
    // 这里多说一句，options配置。options配置是给loader传的参数，有兴趣的同学可以去看下如何实现自定义的loader，如果你需要在你自定义的loader里面传参，就要用到这个配置。  
]
```

这样我们就完成了babel-loader的配置了，然后就可以使用es6语法了对不对，哈哈这样你就错了，还差一步，还需要在根目录下添加.babelrc，如果没有这个文件，则会报错。这个文件的内容和options里面的完全一样就可以（其实也可以为空）。  

为什么一定要.babelrc文件，因为babel工具和模块的使用，都必须先写好.babelrc。有兴趣的同学可以看下阮一峰关于的babal文章：http://www.ruanyifeng.com/blog/2016/01/babel.html。

好了，那么我们通过loader实现了对es6的支持了，loader的作用就是这样。  
如果我们还想使用vue，则我们还需要添加vue-loader，使用vue，还需要配置VueLoaderPlugin的plugin，不然webpack不认识自定标签。  

所以我们知道了，为啥我们可以使用.vue这个浏览器无法识别的文件格式呢，因为我们有vue-loader帮我们把它转为js了☺。

#### plugins
接下来，我们希望webpack帮我们把js进行压缩，节省我们http请求的网络带宽，所以我们的plugins登场了。  
plugins的作用就是实现laoder无法实现的其他事，它是用来扩展webpack功能的，会在整个构建过程中生效，执行相关的任务，比如UglifyJsPlugin插件就是在构建的过程中将js代码进行压缩，commonsChunkPlugin可以将整个打包过程中通用的js代码给提取出来。

plugins是个数组，配置UglifyJsPlugin如下
```
devtool: "#source-map",
plugins: [
    new webpack.optimize.UglifyJsPlugin({
        sourceMap: true
    })
]
```
一般我们压缩后的文件希望能够还原，这个时候就要配置sourceMap为true，同时配置devtool的值为"#source-map"。

#### 本地开发服务器
开发的时候，我们希望我们的代码在本地运行，web
pack提供了一个webpack-dev-server。配置如下：
```
 devServer: {
    port: 80,  //webpack-dev-server服务器启动的端口
    host: '0.0.0.0', //webpack-dev-server服务器启动的host
    contentBase: path.join(__dirname, 'src')  //监听src目录下的文件变化，然后热启动
  }
```
然后我们可以通过命令启动，注意--hot指定是热启动，监听contentBase目录下的文件变化,--config指定配置目录。
```
webpack-dev-server --hot --config build/webpack.conf.js
```
启动webpack-dev-server的时候传参可以两种方式：  
1、直接在命令行中以<--参数>的方式，像上面的hot和config  
2、在webpack.config.js在的devServer配置，像上面的port等。  

我们还可以修改package.json，通过npm来启动脚本，简化启动命令。
```
"scripts": {
    "start": "webpack-dev-server --hot --config build/webpack.conf.js",
    "dev": "npm run start",
    "build": "cross-env NODE_ENV=production webpack --progress --hide-modules"
},
```
这样就可以通过npm run start的方式启动webpack-dev-server了。  

遇到问题：
==You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.==  
原因：因为默认情况下，import vue from 'vue'的vue是vue.common.js，而不是vue.js，而vue.common.js是不支持template语法的，所以通过别名可以解决这个问题，让import的时候去import vue.js而不是vue.common.js。  
webpack当中配置别名如下：
```
resolve:{
    alias:{
        'vue':'vue/dist/vue.js'
    }
},
```

#### 通用配置
我们使用webpack的时候，希望对图片/js/css等都进行优化打包，所以需要有支持图片/css/js优化的一些loader和plugins配置。下面讲一些比较通用的配置：

为了将图片转为base64（减少http请求）和解决图片引用路径问题，我们需要url-loader（整合了file-loader）。  
为了在js中引入css，我们需要css-loader。如果你还想将css插入到页面的<style>里面，你还需要style-loader。
如果css-loader和style-loader一起用，这里需要注意了，由于webpack loader的执行顺序是从右到左，所以你要先设置style-loader在设置css-loader，因为webpack是先将所有css模块依赖解析完得到计算结果再创建style标签的。

为了将所有公共的代码提取出来，减少打包后的js文件大小，使用 CommonsChunkPlugin 为每个页面间的应用程序共享代码创建 bundle。由于入口起点增多，多页应用能够复用入口起点之间的大量代码/模块，从而可以极大地从这些技术中受益。随带一提，webpack4有个SplitChunksPlugin性能比CommonsChunckPlugin好。  

为了强制把css从js文件中独立出来中，而不想让其放在js中，要用到ExtractTextPlugin(style-loader会将所有的css都打包如js中，js在运行时再放入html的style当中)。

