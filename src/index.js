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
		if(typeof options === "string") {
			this.options = Object.assign(defaults, {
				config: options
			});
		} else {
			this.options = Object.assign(defaults, options);
		}
	}

	get chunk() {
		if(!this._chunk) {
			this._chunk = new Chunk(this.options.name);
			this._chunk.ids = [];
		}
		return this._chunk;
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
		const options = this.options;
		const fontUrl = this.assetUrl.bind(this, "font")
		const fontello = new Fontello(options, fontUrl)
		const css = new Css(options, fontUrl)
		compiler.plugin("make", (compilation, callback) => {
			const promise = fontello.assets()
				.then(assets => {
					for(const fileName in assets) {
						this.chunk.files.push(fileName);
						compilation.assets[fileName] = assets[fileName];
					}
				})
				.then(callback)
			compilation.plugin("additional-assets", cb => {
				const cssUrl = this.assetUrl("css")
				this.chunk.files.push(cssUrl)
				compilation.assets[cssUrl] = css;
				compilation.chunks.push(this.chunk)
				promise.then(cb)
				// cb()
			});
			// callback();
		})
	}
}

FontelloPlugin.Css = Css
FontelloPlugin.Fontello = Fontello

module.exports = FontelloPlugin
