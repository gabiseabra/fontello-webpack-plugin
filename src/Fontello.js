const _ = require("lodash")
const path = require("path")
const stream = require("stream")
const unzip = require("unzip")
const fetch = require("node-fetch")
const FormData = require("form-data")
const { RawSource } = require("webpack-sources")
const HttpsProxyAgent = require('https-proxy-agent')

const defaults = {
	host: "http://fontello.com",
	proxy: null
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
		if(this._session) {
			return Promise.resolve(this._session)
		}
		const { host, config } = this.options
		const body = new FormData()
		body.append("config", new Buffer(JSON.stringify(config), "utf8"), {
			filename: "config.json",
			contentType: "application/json"
		})
		const fetchOptions = this.options.proxy ? Object.assign({}, { method: "POST", body }, { agent: new HttpsProxyAgent(this.options.proxy) }) : { method: "POST", body }
		return fetch(host, fetchOptions)
			.then(response => {
				if(!response.ok) {
					throw new Error(response.statusText)
				}
				return response.text()
			})
			.then(session => {
				this._session = session
				return session
			})
			.catch(error => {
				console.error(error)
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
			.then(session => fetch(`${host}/${session}/get`))
			.then(response => {
				if(!response.ok) {
					throw new Error(response.statusText)
				}
				return new Promise((resolve, reject) => {
					const assets = {}
					response.body.pipe(unzip.Parse())
						.on("entry", entry => {
							const ext = path.extname(entry.path).slice(1)
							if(entry.type === "File" && _.includes(fonts, ext)) {
								const buffer = [];
								entry.on("data", data => buffer.push(data))
								entry.on("end", () => { assets[ext] = Buffer.concat(buffer) })
							} else {
								entry.autodrain();
							}
						})
						.on("error", err => reject(err))
						.on("close", () => resolve(assets))
				})
			})
			.catch(error => {
				console.error(error)
			})
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
