const Q = require("q")
const should = require("should")
const webpack = require("webpack")
const MemoryFs = require("memory-fs")
const FontelloPlugin = require("../src")
const config = require("./config.json")

const webpackConfig = {
	entry: "../package.json",
	name: "icons",
	output: {
		path: "/",
		filename: "[name].js"
	}
}

describe("FontelloPlugin", () => {
	let fs, plugin

	before(() => {
		fs = new MemoryFs()
		plugin = new FontelloPlugin({ config })
		const compiler = webpack(Object.assign({}, webpackConfig, {
			plugins: [ plugin ]
		}))
		compiler.outputFileSystem = fs
		return Q.Promise((resolve, reject) => {
			compiler.run((err, stats) => (err ? reject(err) : resolve(stats)))
		})
	})

	describe("#assetUrl(type, ext?)", () => {
		it("returns the asset path", () => {
			plugin.assetUrl("css").should.equal("icons.css")
			plugin.assetUrl("font", "ttf").should.equal("font/icons.ttf")
		})
	})

	it("emits font files", () => {
		fs.existsSync("/font/icons.eot").should.be.ok()
		fs.existsSync("/font/icons.ttf").should.be.ok()
	})

	it("emits a css file", () => {
		fs.existsSync("/icons.css").should.be.ok()
	})
})
