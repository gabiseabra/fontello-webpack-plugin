const _ = require("lodash")
const FontTypes = require("./FontTypes")

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

const customizer = (obj, src) => {
	if(_.isArray(src)) {
		return src
	}
}

const config = (options) => _.mergeWith({}, defaults, options, customizer)

module.exports = config
