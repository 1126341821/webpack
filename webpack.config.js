const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
	entry: __dirname + "/app/main.js", //已多次提及的唯一入口文件
	output: {
		path: __dirname + "/public", //打包后的文件存放的地方
		filename: "bundle.js" //打包后输出文件的文件名
	},
	devtool: 'eval-source-map', // ，使得编译后的代码可读性更高，也更容易调试
	devServer: {
		contentBase: "./public", //本地服务器所加载的页面所在的目录
		historyApiFallback: true, //不跳转
		inline: true, //实时刷新
		hot: true
	},
	module: {
		rules: [{ // 编译jsx／js
				test: /(\.jsx|\.js)$/,
				use: {
					loader: "babel-loader"
				},
				exclude: /node_modules/ // 不编译node／modules
			},
			{ // 将css加载为模块=style-loader+css-loader
				test: /(\.css|\.scss|\.less)$/,
				use: [{
					loader: "style-loader" // 将所有的计算后的样式加入页面中
				}, {
					loader: "css-loader", // import的方式引入
					options: { // 允许将css以模块的方式引入，使用方式：styles.root
						modules: true
					}
				}, { // 对原生CSS的拓展后的scss,less的文件的编译
					loader: "postcss-loader" // scss,less
				}]
			}
		]
	},
	plugins: [
		new webpack.BannerPlugin('版权所有，翻版必究'), // 添加版权声明的插件。
		new HtmlWebpackPlugin({ // 不需要手动添加build文件，只需要这行代码自动生成，
			template: __dirname + "/app/index.tmpl.html" //new 一个这个插件的实例，并传入相关的参数
		}),
		new webpack.HotModuleReplacementPlugin() //热加载插件，修改组件代码后，自动刷新实时预览修改后的效果。
	]
};

// 注：“__dirname”是node.js中的一个全局变量，它指向当前执行脚本所在的目录。