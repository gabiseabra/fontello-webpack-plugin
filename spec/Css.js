const should = require("should")
const Css = require("../src/Css")
const config = require("./config.json")

const fontUrl = ext => `Font.${ext}`

describe("Css", () => {
	describe("#glyphClassName(name)", () => {
		it("returns given glyph's class name", () => {
			(new Css({ config }, fontUrl))
			.glyphClassName("foo")
			.should.equal("icon-foo")
		})
	})

	describe("#genericSelectors", () => {
		context("given a className or a suffix", () => {
			it("returns an array of selectors", () => {
				(new Css({ config, className: "icon" }, fontUrl))
				.genericSelectors
				.should.be.an.Array()
				.and.not.empty()
			})
		})

		context("given NO className nor suffix", () => {
			it("returns an empty array", () => {
				(new Css({
					config: Object.assign({}, config, {
					  css_prefix_text: ""
					})
				}, fontUrl))
				.genericSelectors
				.should.be.an.Array()
				.and.empty()
			})
		})
	})

	describe("#source()", () => {
		it("returns respective css", () => {
			(new Css({ config }, fontUrl))
			.source()
			.should.containEql(".icon-github")
			.and.containEql(".icon-gitlab")
		})

		context("given an array of fonts", () => {
			it("renders font types included", () => {
				(new Css({ config, fonts: [ "eot", "ttf" ] }, fontUrl))
				.source()
				.should.containEql(fontUrl("eot"))
				.and.containEql(fontUrl("ttf"))
			})

			it("does NOT render font types not included", () => {
				(new Css({ config, fonts: [ "eot", "ttf" ] }, fontUrl))
				.source()
				.should.not.containEql(fontUrl("svg"))
				.and.not.containEql(fontUrl("woff"))
			})
		})
	})
})
