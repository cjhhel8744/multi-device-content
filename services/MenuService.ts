export default class MenuService {
	getMenus() {
		return fetch('/api/test')
			.then(res => res.json())
			.then(d => d.data)
	}
}
