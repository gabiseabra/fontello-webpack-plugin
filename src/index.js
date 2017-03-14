const _ = require("lodash")
const path = require("path")
const Chunk = require("webpack/lib/Chunk")
const Q = require("q")
const FontTypes = require("./FontTypes")
const Fontello = require("./Fontello")
const Css = require("./Css")

const defaults = {
	config: undefined,
	name: "icons",
	className: "",
	fonts: _.keys(FontTypes),
	output: {
		css: "[name].css",
		font: "font/[name].[ext]"
	}
}

class FontelloPlugin {
	constructor(options) {
		this.options = Object.assign({}, defaults, options)
		this.chunk = new Chunk(this.options.name)
		this.chunk.ids = []
	}

	assetUrl(type, extension) {
		const { output, name } = this.options
		const ext = extension ||  type
		const replace = {
			"[name]": name,
			"[ext]": ext
		}
		return output[type].replace(/\[[^\]]+\]/g, (match) => replace[match])
	}

	apply(compiler) {
		const fontello = new Fontello(this.options)
		compiler.plugin("make", (compilation, cb) => {
			const addFile = (fileName, source) => {
				this.chunk.files.push(fileName);
				compilation.assets[fileName] = source;
			}
			fontello.sources()
				.then(sources => {
					addFile(this.assetUrl("css"), new Css(this.options, this.assetUrl.bind(this, "font")))
					for(const ext in sources) {
						addFile(this.assetUrl("font", ext), sources[ext])
					}
				})
				.then(cb)
			compilation.chunks.push(this.chunk)
		})
	}
}

FontelloPlugin.Css = Css
FontelloPlugin.Fontello = Fontello

module.exports = FontelloPlugin
