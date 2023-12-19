// import { defineNuxtConfig } from 'nuxt/config'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: false },
	srcDir: 'src/',
	typescript: {
		strict: true,
		typeCheck: true,
	},
	app: {
		baseURL: '/dit/',
		head: {
			meta: [
				{ 'http-equiv': 'x-ua-compatible', content: 'IE=edge' },
				{
					name: 'viewport',
					content:
						'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0',
				},
			],
			link: [
				{
					rel: 'shortcut icon',
					type: 'image/x-icon',
					href: '//cdndata.milkt.co.kr/mid/www/img/icon/favicon_32x32.ico',
				},
			],
			// link: [{ rel: 'icon', href: '/favicon.ico' }],
		},
	},
	dir: {
		public: '../public/',
	},
	experimental: {
		reactivityTransform: true,
	},
	imports: {
		autoImport: true,
		addons: {
			vueTemplate: true,
		},
	},
	// server config variable
	runtimeConfig: {
		public: {
			BASE_TARGET: process.env.BASE_TARGET,
			API_PILOT_URI: process.env.API_PILOT_URI,
		},
	},
	// macros: {
	// 	reactivityTransform: true,
	// },
	modules: [
		'@pinia/nuxt',
		'@vueuse/nuxt',
		'@vite-pwa/nuxt',
		'@vue-macros/nuxt',
		'nuxt-typed-router',
		'@nuxtjs/device',
	],
	vite: {
		build: {
			sourcemap: false,
		},
		clearScreen: true,
		logLevel: 'info',
		// server: {
		// 	proxy: {
		// 		'/pilot/api': {
		// 			target: 'https://pilot.milkt.co.kr',
		// 			changeOrigin: true,
		// 			rewrite: path => path.replace(/^\/api/, ''),
		// 		},
		// 	},
		// },
	},
	// nitro: {
	// 	routeRules: {
	// 		'/pilot/api/**': {
	// 			proxy: 'https://pilot.milkt.co.kr/**',
	// 		},
	// 		'^/pilot/api/**': {
	// 			proxy: 'https://pilot.milkt.co.kr/**',
	// 		},
	// 		'*/pilot/api/**': {
	// 			proxy: 'https://pilot.milkt.co.kr/**',
	// 		},
	// 	},
	// },
	// vue: {
	// 	runtimeCompiler: true,
	// },
	pwa: {},
})
