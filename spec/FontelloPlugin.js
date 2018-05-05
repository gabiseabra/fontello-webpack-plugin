const should = require("should")
const webpack = require("webpack")
const MemoryFs = require("memory-fs")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FontelloPlugin = require("../src")
const config = require("./config.json")

require("dotenv").load()

const session = process.env.SESS_ID

const webpackConfig = {
	entry: require.resolve("../package.json"),
	name: "icons",
	output: {
		path: "/",
		filename: "[name].js"
	},
	stats: {
		colors: true
	}
}

describe("FontelloPlugin", () => {
	let fs, plugin, htmlWebpackPlugin, stats

	before(() => {
		fs = new MemoryFs()
		htmlWebpackPlugin = new HtmlWebpackPlugin({})
		plugin = new FontelloPlugin({
			config,
			session,
			fonts: [ "woff", "woff2" ],
			output: {
				css: "css/[name].css",
				font: "font/[name].[ext]"
			}
		})
		const compiler = webpack(Object.assign({}, webpackConfig, {
			plugins: [ htmlWebpackPlugin, plugin ]
		}))
		compiler.outputFileSystem = fs
		return new Promise((resolve, reject) => {
			compiler.run((err, data) => {
				if(err) {
					reject(err)
				} else {
					stats = data
					console.log(stats.toString(webpackConfig.stats))
					console.log("\n")
					resolve(stats)
				}
			})
		})
	})

	it("adds a chunk to compilation", () => {
		Object.keys(stats.compilation.namedChunks)
		.should.containEql(plugin.options.name)
	})

	it("emits selected font files", () => {
		fs.existsSync("/font/icons.woff").should.be.ok()
		fs.existsSync("/font/icons.woff2").should.be.ok()
		fs.existsSync("/font/icons.ttf").should.not.be.ok()
		fs.existsSync("/font/icons.eot").should.not.be.ok()
	})

	it("emits a css file", () => {
		fs.existsSync("/css/icons.css").should.be.ok()
		fs.readFileSync("/css/icons.css", "utf8")
		.should.containEql("../font/icons.woff")
	})
})
