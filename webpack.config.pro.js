
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 提取css的插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')


module.exports = {
    entry : "./src/main.ts",
    output : {
        path : path.resolve(__dirname, 'dist'),
        filename : "main.js"
    },
    devServer : {
        // contentBase : "./dist",       //服务器的根路径
        static : {
            directory : path.join(__dirname , 'dist') //服务器的根路径
        },
        // progress : true,        //显示打包的进度条
        compress : true,        //启动gzip压缩
        port : 8080,
        // open : true,    //自动打开页面
        hot : true,
        // inline : true      
    },
    resolve : {
        //设置不写后缀名的情况下优先读取文件顺序   webpack默认是.js  .json读取不到则报错
        "extensions" : ['.ts', '.js', '.json']      
    },
    module : {
        rules : [
            //全局的css处理
            {
                test : /\.css$/,
                use : [MiniCssExtractPlugin.loader, 'css-loader'],
                exclude : [                 //去除组件内的css
                    path.resolve(__dirname, "src/components")
                ]
            },
            //组件内的css
            {
                test : /\.css$/,
                use : [MiniCssExtractPlugin.loader, {
                    loader : 'css-loader',
                    options : {
                        // modules : true      //当作模块来进行处理 此种方法生成的类型是随机的
                        modules: {      //通过这种设置生成的模块的类名
                            localIdentName : "[path][name]__[local]--[hash:base64:5]",
                        }
                    }
                }],
                include : [                 // include只针对当前文件路径下的文件
                    path.resolve(__dirname, "src/components")
                ]
            },
            {
                test : /\.(eot | woff | woff2 | ttf | svg)$/,
                use : [
                    {
                        loader : 'file-loader',
                        // 打包后的样式文件存储在一个文件夹下
                        options : {
                            outputPath : 'iconfont/'
                        }
                    }
                ]
            },
            {
                test : /\.ts$/,
                use : ['ts-loader'],
                exclude : /node_modules/
            }
        ]
    },
    plugins : [
        new HtmlWebpackPlugin({
            template : "./src/index.html"
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin()
    ],
    // 改成生产模式，对代码进行压缩
    mode: "production"
};