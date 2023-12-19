import type { MenuItem, IMenuState } from '~/types/menu'
import type { IfXmlDoc } from '~/types/xmldoc'
import { getXmlDoc } from '~/utils'

export const useMenusStore = defineStore('menusStore', {
	state: (): {
		menuData: IMenuState
	} => ({
		menuData: {} as IMenuState,
	}),
	getters: {
		getMenuData: state => state.menuData,
	},
	actions: {
		async fetchMenuData() {
			const { data }: any = await useFetch('/api/test')
			if (data.value) {
				this.menuData = data.value as IMenuState
			}
		},
		setPid(payload: string) {
			this.menuData.pid = payload
			this.setCurMenuItem(this.menuData?.menuItems?.find(m => m.id === payload) as MenuItem)
		},
		setCurMenuItem(payload: MenuItem) {
			getXmlDoc(payload).then(xDoc => {
				this.menuData.curMenuItem = payload
				this.setIfXmlDoc(xDoc)
			})
		},
		setIfXmlDoc(payload: IfXmlDoc) {
			this.menuData.ifXmlDoc = payload
			this.menuData.ifXmlDoc.menuIdx = 0
		},
		setIfXmlDocMenuIdx(payload: number) {
			this.menuData.ifXmlDoc.menuIdx = payload
		},
	},
})
