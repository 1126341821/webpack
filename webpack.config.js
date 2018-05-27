const webpack = require('webpack');
const packagejson = require("./package.json");
const HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
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


// name：可以是已经存在的chunk（一般指入口文件）对应的name，那么就会把公共模块代码合并到这个chunk上；否则，会创建名字为name的commons chunk进行合并
// filename：指定commons chunk的文件名
// chunks：指定source chunk，即指定从哪些chunk当中去找公共模块，省略该选项的时候，默认就是entry chunks
// minChunks：既可以是数字，也可以是函数，还可以是Infinity，具体用法和区别下面会说


// webpack当中配置的入口文件（entry）是chunk，可以理解为entry chunk
// 入口文件以及它的依赖文件通过code split（代码分割）出来的也是chunk，可以理解为children chunk
// 通过CommonsChunkPlugin创建出来的文件也是chunk，可以理解为commons chunk
const webpackConfig = {
	entry: {},
	//  {
	// test: __dirname + "/app/test/index.js",

	// main: __dirname + "/app/*/index.js",
	// vendor: Object.keys(packagejson.dependencies)//获取生产环境依赖的库

	// }, //已多次提及的唯一入口文件
	output: {
		path: __dirname + "/public", //打包后的文件存放的地方
		publicPath: "/assets/",
		filename: '[name].js', // '[name].[hash]js', //打包后输出文件的文件名
		chunkFilename: '[chunkhash].js',
	},

	devtool: 'source-map', // ，使得编译后的代码可读性更高，也更容易调试
	devServer: {
		contentBase: "./public", //本地服务器所加载的页面所在的目录
		historyApiFallback: true, //不跳转
		inline: true, //实时刷新
		hot: true
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
	},
	resolve: {
		alias: {
			utils: __dirname + '/util/index'
		},
	},
	module: {
		rules: [{ // 编译jsx／js
			test: /(\.jsx|\.js)$/,
			use: {
				loader: "babel-loader"
			},
			exclude: /node_modules/ // 不编译node／modules
		},
		{ test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' },
		{
			test: /\.scss$/,
			use: ExtractTextPlugin.extract({ // 如果不使用ExtractTextPlugin，css将变成内联
				fallback: 'style-loader',
				//如果需要，可以在 sass-loader 之前将 resolve-url-loader 链接进来
				use: ['css-loader', 'postcss-loader']
			})
		}
		]
	},
	plugins: [
		new webpack.BannerPlugin('版权所有，翻版必究'), // 添加版权声明的插件。
		new webpack.HotModuleReplacementPlugin(), //热加载插件，修改组件代码后，自动刷新实时预览修改后的效果。
		new ExtractTextPlugin({
			filename: '[name].bundle.css',
			allChunks: true,
		}),

	]
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
		// chunks:  'vender.js'
		chunks: [name],
	});
	 webpackConfig.plugins.push(plugin);
});

module.exports = webpackConfig;

// 注：“__dirname”是node.js中的一个全局变量，它指向当前执行脚本所在的目录。