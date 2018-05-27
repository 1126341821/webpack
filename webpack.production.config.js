const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var glob = require('glob');



// 获取指定路径下的入口文件
function getEntries(globPath) {
    var files = glob.sync(globPath),
        entries = {};

    files.forEach(function (filepath) {
        // 取倒数第二层(view下面的文件夹)做包名
        var split = filepath.split('/');
        var name = split[split.length - 2];

        entries[name] = './' + filepath;
    });

    return entries;
}

var entries = getEntries('app/**/index.js');
const webpackConfig = {
    entry: {},
    // entry:'./app/main/index.js',// __dirname + "/app/main.js",//已多次提及的唯一入口文件c
    output: {
        path: __dirname + "/build",// 输入到build文件夹下
        publicPath: "/assets/",
        filename: '[name].js'// '[name]-[chunkhash:6].js', 因为我们的文件不用hash，我们用的时候都是使用0.7.3/某某js，有版本号所以可以快速加载，也可以更新
        //filename: "bundle-[hash].js"// 输出文件至bundle.js中
    },
    devtool: 'none', // 为了让编译后的代码更好排错
    // mode: 'production',

    devServer: {
        contentBase: "./public",//本地服务器所加载的页面所在的目录
        historyApiFallback: true,//不跳转
        inline: true,
        hot: true// 只要更改组件就更新浏览器
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
    resolve: {
        alias: {
            utils: __dirname + '/util/index'
        }
    },
    module: {
        rules: [// 将jsx/es6/css/scss/less变为浏览器可读的文件
            {
                test: /(\.jsx|\.js)$/,
                use: {
                    loader: "babel-loader"
                },
                exclude: /node_modules/
            },
            // { // 将css加载为模块=style-loader+css-loader
            //     test: /(\.css|\.scss|\.less)$/,
            //     use: [
            //         {
            //             loader: "style-loader"
            //         }, {
            //             loader: "css-loader", // import的方式引入
            //             options: { // 允许将css以模块的方式引入，使用方式：styles.root
            //                 modules: true
            //             }
            //         }, {
            //             loader: "postcss-loader"  // 只会css可以让他自动生成兼容性前缀
            //         }
            //     ]
            // }
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    //如果需要，可以在 sass-loader 之前将 resolve-url-loader 链接进来
                    use: ['css-loader', 'postcss-loader']
                })
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin('版权所有，翻版必究'),
        new webpack.optimize.OccurrenceOrderPlugin(),// 为组件分配ID，为使用最多的模块分配最小的ID
        new webpack.optimize.UglifyJsPlugin(),// UglifyJsPlugin
        new ExtractTextPlugin({
            filename: '[name].bundle.css',
            allChunks: true,
        }),
    ],
};
Object.keys(entries).forEach((name) => {
    // 每个页面生成一个entry，如果需要HotUpdate，在这里修改entry
    webpackConfig.entry[name] = entries[name];

    // 每个页面生成一个html
    //  不需要手动添加build文件，只需要这行代码自动生成，

    var plugin = new HtmlWebpackPlugin({
        // 生成出来的html文件名
        filename: name + '.html',
        // 每个html的模版，这里多个页面使用同一个模版
        template: './tmpl.html',
        // 自动将引用插入html
        inject: true,
        // 每个html引用的js模块，也可以在这里加上vendor等公用模块
        chunks: [name]
    });

    webpackConfig.plugins.push(plugin);
});
module.exports = webpackConfig;