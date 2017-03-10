const _ = require("lodash")
const should = require("should")
const FontelloPlugin = require("../src")
const config = require("./config.json")

/**
 * @todo - These tests
 */
describe("FontelloPlugin", () => {
	let plugin = undefined;
	
	before(() => {
		plugin = new FontelloPlugin({ config })
	})

	describe("#assetUrl(type, ext?)", () => {
		it("returns the asset path", () => {
			plugin.assetUrl("css").should.equal("icons.css")
			plugin.assetUrl("font", "ttf").should.equal("font/icons.ttf")
		})
	})
})
