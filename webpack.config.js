const path = require('path'),
			autoprefixer = require("autoprefixer"),
			MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => ({
	entry: {
		app: "./src/index.jsx",
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name]"+(argv.mode === "development" ? "" : ".min") + ".js"
	},
	module: {
		rules: [
			{
				test: /\.jsx$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [
							"@babel/preset-react",
							"@babel/preset-env"
						]
					}
				}	
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
					},
					{
						loader: "postcss-loader",
						options: {
							autoprefixer: {
								browsers: ["default"]
							},
							plugins: () => [autoprefixer]
						}
					},
					{
						loader: "sass-loader"
					}
				]
			},
			{
				test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000'
			}
		]
	},
	resolve: {
		extensions: [".js", ".jsx"]
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				common: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					chunks: "initial"
				}
			}
		}
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].css",
			chunkFilename: "[id].css"
		})
	]
});