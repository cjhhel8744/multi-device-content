import type { IfXmlDoc } from './xmldoc'

export interface MenuGroup {
	group_id: string
	group_nm: string
}
export interface MenuItem {
	group_id: string
	grade: string
	chapter: string
	step: string
	id: string
	path: string
}

export interface IMenuState {
	menuGroups: MenuGroup[]
	menuItems: MenuItem[]
	curMenuItem: MenuItem
	studyTitle: string
	studyChapter: string
	pid: string
	ifXmlDoc: IfXmlDoc
}
