export default defineEventHandler((event): void => {
	console.log(`Request=>${getRequestURL(event)}`)
})
