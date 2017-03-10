const _ = require("lodash")
const should = require("should")
const Fontello = require("../src/Fontello")
const config = require("./config.json")

let session = undefined;

const fontUrl = ext => `Font.${ext}`

describe("Fontello", () => {
	describe("#session()", () => {
		it("returns a new session id", (done) => {
			(new Fontello({ config }, fontUrl))
			.session()
			.then(sessId => {
				sessId.should.not.be.empty
				session = sessId
			})
			.then(done)
			.catch(err => done(err))
		})
	})

	describe("#assets()", () => {
		it("returns an map of filenames to assets", () => (
			(new Fontello({ config, session }, fontUrl))
			.assets()
			.should.be.an.Object()
		))

		context("given an array of fonts", () => {
			let promise = undefined

			before("fetch assets", () => {
				promise = (new Fontello({ config, session, fonts: [ "eot", "ttf" ] }, fontUrl)).assets();
			})

			it("emits font types included", () => (
				promise
				.then(assets => {
					assets
					.should.have.keys(fontUrl("eot"), fontUrl("ttf"))
				})
			))

			it("does NOT emit font types not included", () => (
				promise
				.then(assets => {
					assets
					.should.not.have.keys(fontUrl("svg"), fontUrl("woff"))
				})
			))
		})
	})
})
