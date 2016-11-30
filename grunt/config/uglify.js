// See https://github.com/gruntjs/grunt-contrib-uglify
module.exports = {
	"js-text-analysis": {
		options: {
			comments: "some",
			report: "gzip",
		},
		files: {
			"dist/yoast-seo.min.js": [
				"dist/yoast-seo.js",
			],
		},
	},
};
