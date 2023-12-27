export interface ISoundInfo {
	id: string
	src: string
	loop: { type: boolean; default: false }
	volume: any
	callback: any
	isplaying: boolean
}

export interface ICdnMovie {
	strMCode: string
	strAuthUrl: string
}
