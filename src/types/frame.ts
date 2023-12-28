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

export interface IRecorderOption {
	time: { type: Number; default: 1 }
	bitRate: { type: Number; default: 128 }
	sampleRate: { type: Number; default: 44100 }
	backendEndpoint: { type: String }
	buttonColor: { type: String; default: 'green' }

	// callback functions
	afterRecording: { type: Function }
	successfulUpload: { type: Function }
	failedUpload: { type: Function }
	customUpload: { type: Function; default: null }
}
