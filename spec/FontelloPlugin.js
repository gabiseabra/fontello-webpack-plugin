const should = require("should")
const webpack = require("webpack")
const MemoryFs = require("memory-fs")
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
	let fs, plugin, stats

	before(() => {
		fs = new MemoryFs()
		plugin = new FontelloPlugin({ config, session })
		const compiler = webpack(Object.assign({}, webpackConfig, {
			plugins: [ plugin ]
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

	describe("#assetUrl(type, ext?)", () => {
		it("returns the asset path", () => {
			plugin.assetUrl("css").should.equal("icons.css")
			plugin.assetUrl("font", "ttf").should.equal("font/icons.ttf")
		})
	})

	it("adds a chunk to compilation", () => {
		stats.compilation.namedChunks
		.should.have.key(plugin.options.name)
	})

	it("emits font files", () => {
		fs.existsSync("/font/icons.eot").should.be.ok()
		fs.existsSync("/font/icons.ttf").should.be.ok()
	})

	it("emits a css file", () => {
		fs.existsSync("/icons.css").should.be.ok()
	})
})
