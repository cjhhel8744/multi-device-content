import type { MenuItem } from '@/types/menu'
import type { IfXmlDoc, IfMenuInfo } from '@/types/xmldoc'

export async function getXmlDoc(curMenu: MenuItem) {
	const parseObj = {} as IfXmlDoc
	if (curMenu && typeof DOMParser === 'function') {
		const config = useRuntimeConfig()
		console.log(config)
		// const pathname =  //globalThis?.location?.pathname?.split('/')[1]
		const xmlDoc = await fetch(`${config.app.baseURL}/api/proxy/HTML_TEST/${curMenu.path}`)
			.then(response => response.text())
			.then(str => new DOMParser().parseFromString(str, 'text/html'))
		if (xmlDoc) {
			Object.assign(parseObj, {
				ui_type: xmlDoc.querySelector('ui_type')?.textContent || '',
				chapter: xmlDoc.querySelector('chapter')?.textContent || '',
				title: xmlDoc.querySelector('title')?.textContent || '',
				menuIdx: 0,
				menu: [] as IfMenuInfo[],
			})
			xmlDoc.querySelectorAll('menu')?.forEach(v => {
				parseObj.menu.push({
					type: v.querySelector('type')?.textContent || '',
					title: v.querySelector('title')?.textContent || '',
					file_path: v.querySelector('file_path')?.textContent || '',
				})
			})
		}
	}
	return parseObj
}
