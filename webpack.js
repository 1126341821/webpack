const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const globby = require('globby');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const FusionExternalPlugin = require('@alife/fusion-external-webpack-plugin');
const StylejsAutoAddPlugin = require('@ali/additional-style-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const os = require('os');
// const HappyPack = require('happypack');

// const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const DEV = process.env.DEV;
const LIVELOAD = process.env.LIVELOAD;
const SINGLE_PAGE = process.env.SINGLE_PAGE;
const cwd = process.cwd();
const files = globby.sync(['**/pages/*'], { cwd: `${cwd}/src` });
const entry = {};

files.forEach((item) => {
    entry[`${item}/index`] = [`./src/${item}/index.jsx`];
});

const config = {
    context: cwd,
    entry,
    output: {
        path: path.resolve(process.env.BUILD_DEST || 'build'),
        publicPath: 'build',
        filename: '[name].js',
        chunkFilename: '[chunkhash].js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            components: path.join(__dirname, 'src/components'),
            utils: path.join(__dirname, 'src/utils'),
            styles: path.join(__dirname, 'src/styles'),
            pages: path.join(__dirname, 'src/pages'),
        },
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader'
                },],
            },
            {
                test: /\.scss/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        { loader: 'raw-loader' },
                        { loader: 'postcss-loader' },
                        { loader: 'sass-loader' }
                    ]
                }),
            },
        ],
    },

    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react-redux': 'ReactRedux',
        'react-router': 'ReactRouter',
        'react-router-redux': 'ReactRouterRedux',
        'redux-thunk': 'var window.ReduxThunk.default',
        redux: 'Redux',
    },

    plugins: [
        new ExtractTextPlugin({
            filename: '[name].bundle.css',
            allChunks: true,
        }),

        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity,
        }),
        // 允许错误不打断程序
        new webpack.NoEmitOnErrorsPlugin(),

        // fusion 外链的方式使用,扩展externals的配置
        new FusionExternalPlugin(),
        // 对于fusion业务组件，自动引入style.js的插件
        new StylejsAutoAddPlugin(),
        // 进度插件
        new webpack.ProgressPlugin((percentage, msg) => {
            const stream = process.stderr;
            if (stream.isTTY && percentage < 0.71) {
                stream.cursorTo(0);
                stream.write(`📦   ${msg}`);
                stream.clearLine(1);
            }
        }),
        // 环境变量定义
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(DEV ? 'development' : 'production'),
            },
            __DEV__: JSON.stringify(JSON.parse(DEV ? 'true' : 'false')),
        }),
    ],

};


if ((LIVELOAD && LIVELOAD !== 0) && LIVELOAD !== '0') {
    Object.keys(config.entry).forEach((key) => {
        config.entry[key].unshift('webpack-dev-server/client?/');
    });
}

// 发布状态
if (!DEV) {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                unused: true,
                dead_code: true,
                warnings: false,
            },
            mangle: {
                except: ['$', 'exports', 'require'],
            },
            output: {
                ascii_only: true,
            },
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.bundle\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: { discardComments: { removeAll: true } },
            canPrint: true,
        })
    );
} else {
    config.devServer = {
        // headers: {
        //   'Access-Control-Allow-Origin': '*',
        //   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        //   'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        // },
        // proxy: {
        //   '/business/*': {
        //     target: 'http://30.5.104.110:8080/',
        //     // pathRewrite: { '^/business': '' },
        //     secure: false,
        //     changeOrigin: true,
        //     // logLevel: 'debug',
        //   },
        // },
    };
    config.plugins.push(new webpack.SourceMapDevToolPlugin({}));
}

// 如果需要单个的start或者build
if (SINGLE_PAGE) {
    const key = `pages/${SINGLE_PAGE}/index`;
    config.entry = {};
    config.entry[key] = [`./src/pages/${SINGLE_PAGE}/index.jsx`];
}

module.exports = config;