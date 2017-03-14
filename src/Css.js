const _ = require("lodash")
const FontTypes = require("./FontTypes")

const FONT_SRC = (font, format) => `url("./${font}")${format ? ` format("${format}")` : ""}`

const FONT_FACE_CSS = ({ fontFamily, sources, source }) => `
@font-face {
	font-family: "${fontFamily}";
	${source ? `src: ${source};` : ""}
	${sources.length ? `src: ${sources.join(",\n\t\t")};` : ""}
	font-weight: normal;
	font-style: normal;
}
`

const GENERIC_CSS = ({ fontFamily, selectors }) => selectors.length && `
${selectors.join(",\n")} {
	font-family: "${fontFamily}";
	font-style: normal;
	font-weight: normal;
	speak: none;
	display: inline-block;
	text-decoration: inherit;
	width: 1em;
	margin-right: .2em;
	text-align: center;
	font-variant: normal;
	text-transform: none;
	line-height: 1em;
	margin-left: .2em;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
`

const ICON_CSS = ({ className, code }) => `
.${className}::before { content: "\\${code.toString(16)}"; }
`

/**
 * Css source
 * 
 * @class Css
 */
class Css {
	/**
	 * @param {Object} options.config
	 * @param {Array} options.fonts       - Font types
	 * @param {String=} options.className - Base class name
	 * @param {Function} fontUrl 
	 */
	constructor({ config, fonts, className }, fontUrl) {
		this.options = {
			glyphs: config.glyphs,
			prefix: config.css_prefix_text,
			isSuffix: config.css_use_suffix,
			fontFamily: config.name || "Icons",
			fonts,
			className
		}
		this.fontUrl = fontUrl;
	}

	/**
	 * @param {String} name 
	 * @returns {String}
	 */
	glyphClassName(name) {
		if(this.options.isSufix) {
			return name + this.options.prefix;
		} else {
			return this.options.prefix + name;
		}
	}

	/**
	 * Typeface src entries
	 * 
	 * @returns {String[]}
	 * @readonly
	 */
	get sources() {
		const src = [];
		for(const ext in FontTypes) {
			const format = FontTypes[ext];
			if(_.includes(this.options.fonts, ext)) {
				src.push(FONT_SRC(this.fontUrl(ext), format));
			}
		}

		return src;
	}

	/**
	 * Css selectors applicable to all icons
	 * 
	 * @returns {String[]}
	 * @readonly
	 */
	get genericSelectors() {
		const { className, prefix, isSuffix } = this.options;
		const selector = [];
		if(className) {
			selector.push(`.${className}::before`);
		}
		if(prefix) {
			if(isSuffix) {
				selector.push(`[class$="${prefix}"]::before`);
				selector.push(`[class*="${prefix} "]::before`);
			} else {
				selector.push(`[class^="${prefix}"]::before`);
				selector.push(`[class*=" ${prefix}"]::before`);
			}
		}

		return selector;
	}

	/**
	 * @returns {String}
	 * @readonly
	 */
	get cssText() {
		const { fontFamily, fonts, glyphs } = this.options;
		return [
			FONT_FACE_CSS({
				source: _.includes(fonts, "eot") ? FONT_SRC(this.fontUrl("eot")) : undefined,
				sources: this.sources,
				fontFamily
			}),
			GENERIC_CSS({
				selectors: this.genericSelectors,
				fontFamily
			}),
			glyphs.map(({ code, css }) =>
				ICON_CSS({
					className: this.glyphClassName(css),
					code
				})
			).join("")
		].join("").trim() + "\n";
	}

	map() { return null }

	size() {
		return Buffer.byteLength(this.source(), "utf8");
	}

	source() {
		return this.cssText;
	}
}

module.exports = Css;
