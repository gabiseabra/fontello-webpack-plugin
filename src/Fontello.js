const _ = require("lodash")
const path = require("path")
const stream = require("stream")
const unzip = require("unzip")
const request = require("request")
const Q = require("q")
const { RawSource } = require("webpack-sources")

const defaults = {
	host: "http://fontello.com"
}

/**
 * Fontello helper
 * 
 * @class Fontello
 */
class Fontello {
	/**
	 * @param {Object} options.config
	 * @param {String=} options.session - Pre-fetched Fontello session id
	 * @param {String=} options.host    - Where to request build
	 */
	constructor(options) {
		this.options = Object.assign({}, defaults, options)
		this.sessId = options.session
	}

	/**
	 * Request session id
	 * 
	 * @returns {Promise<String>} - New session id
	 */
	session() {
		const { host, config } = this.options;
		return this.sessId ?
			Q.fcall(() => this.sessId) :
			Q.Promise((resolve, reject) => {
				request.post({
					url: host,
					formData: {
						config: {
							value: new Buffer(JSON.stringify(config), "utf8"),
							options: {
								filename: "config.json",
								contentType: "application/json"
							}
					 	}
					}
				}, (err, response, body) => {
					if(err) reject(err)
					if(response.statusCode !== 200) reject(new Error(response.statusMessage))
					resolve(body)
				})
			})
			.then(session => {
				this.sessId = session
				return session
			})
	}

	/**
	 * Fetch fonts
	 * 
	 * @returns {Promise} - Resolves to a map of {Buffer}s
	 */
	fonts() {
		const { host, fonts } = this.options;
		return this.session()
			.then(session => new Promise((resolve, reject) => {
				const assets = {};
				request.get(`${host}/${session}/get`)
					.pipe(unzip.Parse())
					.on("entry", entry => {
						const ext = path.extname(entry.path).slice(1)
						if(entry.type === "File" && _.includes(fonts, ext)) {
							const buffer = [];
							entry.on("data", data => buffer.push(data))
							entry.on("end", () => { assets[ext] = Buffer.concat(buffer) })
						}
					})
					.on("close", () => resolve(assets))
					.on("error", err => reject(err))
			}))
	}

	/**
	 * Convert fonts to webpack Source
	 * 
	 * @returns {Promise} - Resolves to a map of {RawSource}s
	 */
	assets() {
		return this.fonts()
			.then(fonts => {
				const assets = {};
				for(const ext in fonts) {
					assets[ext] = new RawSource(fonts[ext])
				}
				return assets;
			})
	}
}

module.exports = Fontello;
