// import menus from '/mocks/menus.json'
import menus from '@/../public/mocks/menus.json'
export default defineEventHandler(async () => {
	return await menus
})
