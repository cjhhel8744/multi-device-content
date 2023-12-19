export interface IfMenuInfo {
	type: string
	title: string
	file_path: string
}

export interface IfXmlDoc {
	ui_type: string
	chapter: string
	title: string
	menuIdx: number
	menu: IfMenuInfo[]
}
