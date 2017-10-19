const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: __dirname + "/app/main.js",//已多次提及的唯一入口文件
    output: {
        path: __dirname + "/build",// 输入到build文件夹下
        filename: "bundle-[hash].js"// 输出文件至bundle.js中
    },
    devtool: 'none', // 为了让编译后的代码更好排错
    devServer: {
        contentBase: "./public",//本地服务器所加载的页面所在的目录
        historyApiFallback: true,//不跳转
        inline: true,
        hot: true// 只要更改组件就更新浏览器
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
            {
                test: /(\.css|\.scss|\.less)$/,
                use: [
                    {
                        loader: "style-loader"
                    }, {
                        loader: "css-loader",
                        options: {
                            modules: true
                        }
                    }, {
                        loader: "postcss-loader"
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin('版权所有，翻版必究'),
        new HtmlWebpackPlugin({// 可以不用手动建builde文件和index.html直接生成文件夹，和index.html
            template: __dirname + "/app/index.tmpl.html" // 将这个模版变成index.html
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),// 为组件分配ID，为使用最多的模块分配最小的ID
        new webpack.optimize.UglifyJsPlugin(),// UglifyJsPlugin
        new ExtractTextPlugin("style.css")// 分离CSS和JS文件
    ],
};
