import { createProxyEventHandler } from 'h3-proxy'

const config = useRuntimeConfig()
export default defineEventHandler(
	createProxyEventHandler({
		target: config.public.API_PILOT_URI,
		changeOrigin: true,
		pathRewrite: {
			'^/api/proxy/HTML_TEST': '/HTML_TEST',
			'^/dit/api/proxy/HTML_TEST': '/HTML_TEST',
		},
		pathFilter: ['/api/proxy/HTML_TEST'],
	}),
)

// import type { IncomingMessage, ServerResponse } from 'http'
// import httpProxy from 'http-proxy'

// const { API_PILOT_URI } = useRuntimeConfig()
// const proxy = httpProxy.createProxyServer({
// 	changeOrigin: true,
// })
// let prefix: string

// proxy.on('proxyReq', function (proxyReq, req, res, options) {
// 	const exp = new RegExp(`^${prefix}`)
// 	let path = proxyReq.path.replace(exp, '/')
// 	path = path.replace(/\/\//, '/')
// 	proxyReq.path = path
// })

// export default function (
// 	req: IncomingMessage,
// 	res: ServerResponse<IncomingMessage>,
// 	next: () => void,
// ) {
// 	console.log(req?.url)
// 	console.log(API_PILOT_URI)
// 	if (req?.url?.startsWith('/proxy')) {
// 		prefix = '/proxy'
// 		proxy.web(req, res, {
// 			target: API_PILOT_URI,
// 		})
// 	} else {
// 		try {
// 			next()
// 		} catch (e) {}
// 	}
// }
// export default defineEventHandler(event => {
// 	// console.log('defineEventHandler')
// 	// console.log(`event.node.req.url => ${event.node.req.url}`)

// 	if (!event.node.req.url?.startsWith('/api/test/pilot111')) return
// 	debugger
// 	const target = new URL(event.node.req.url, 'https://pilot.milkt.co.kr')
// 	console.log(target)

// 	return proxyRequest(event, target.toString(), {
// 		headers: {
// 			host: target.host,
// 			origin: target.origin,
// 		},
// 	})
// })
