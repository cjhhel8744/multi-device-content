import { consola } from 'consola'
import type { ISoundInfo, ICdnMovie } from '@/types/frame'
import type { IMenuState } from '@/types/menu'

const ifWinCamera = ref()
const ifWinRecord = ref()
const ifData = ref<string>('')
const ifLastStep = ref<number>(0)
const ifInstantData = ref<string>('')
const ifIsCompleteContents = ref<boolean>(false)
export const useHybridApp = () => {
	return {
		initFrameEvt,
		loadMovie,
	}
}

const loadMovie = async (path: string) => {
	const splPath = path.split('//')
	if (splPath.length > 1) {
		path = splPath[1]
	}
	const { data }: any = await useFetch(
		`https://app.milkt.co.kr/AppCommon/GSCDNAuthURL_Flash_8?strPath=${path}`,
	)
	if (data.value) {
		const res = data.value as ICdnMovie[]
		if (res.length > 0 && res[0].strAuthUrl !== '') {
			return res[0].strAuthUrl.split('http:')[1]
		}
	}
	return ''
}

const initFrameEvt = (
	setIfXmlDocMenuIdx: any,
	menus: IMenuState,
	frame: Ref<any>,
	audioList: Ref<any>,
	frameSrc: Ref<any>,
	videoSrc: Ref<any>,
	videoNextPath: Ref<any>,
	canvasCapture: Ref<any>,
	canvasCaptureDataSrc: Ref<any>,
) => {
	const ifWin = frame.value?.contentWindow
	if (!ifWin) return
	// const { doc = document } = ifWin
	if (!ifWin.HybridApp) {
		ifWin.HybridApp = {} as any
	}
	setTimeout(() => {
		const video = ifWin.document.querySelector('video')
		if (video && video.paused) {
			video.muted = true
			video.play()
			// video.muted = false
		}
	}, 1000)
	ifWin.HybridApp.completeContents = (): void => {
		consola.success(`window.HybridApp.completeContents => refreshMenu 수행`)
		if (menus.ifXmlDoc?.menu?.length - 1 === menus.ifXmlDoc?.menuIdx) {
			ifIsCompleteContents.value = true
		}
	}
	ifWin.HybridApp.remainFace = (strCode: string): void => {
		consola.success(`window.HybridApp.remainFace => 기능확인 필요`)
	}
	ifWin.HybridApp.getBluetoothDeviceInfo = () => {
		consola.success(`window.HybridApp.getBluetoothDeviceInfo => 기능확인 필요`)
		return '[]'
	}
	ifWin.HybridApp.getMenuCount = () => {
		// consola.success(`return window.HybridApp.getMenuCount => ${menus.ifXmlDoc?.menu?.length}`)
		return menus.ifXmlDoc?.menu?.length // mCnt
	}
	ifWin.HybridApp.getMenuIndex = () => {
		// consola.success(`return window.HybridApp.getMenuIndex => ${menus.ifXmlDoc?.menuIdx}`)
		return menus.ifXmlDoc?.menuIdx // idx
	}

	ifWin.HybridApp.nextMenu = () => {
		consola.success(`window.HybridApp.nextMenu`)
		if (menus.ifXmlDoc != null) {
			const menuIdx = menus.ifXmlDoc?.menuIdx
			if (menuIdx > -1) {
				if (menuIdx + 1 <= menus.ifXmlDoc?.menu?.length - 1) {
					setIfXmlDocMenuIdx(menuIdx + 1)
					audioList.value = [] as ISoundInfo[]
					consola.info(`window.HybridApp.nextMenu -> iframe path change: ${frame.value.src}`)
				}
			}
		}
	}
	ifWin.HybridApp.setMenu = (menuIdx: number) => {
		consola.success(`window.HybridApp.setMenu(${menuIdx})`)
		try {
			if (menuIdx >= 0) {
				setIfXmlDocMenuIdx(menuIdx)
			}
		} catch (e) {
			consola.error(e)
			ifWin.HybridApp.setMenu(menuIdx - 1)
		}
	}

	ifWin.HybridApp.message = (msg: any, callback: any, callback2: any) => {
		consola.success(`window.HybridApp.message(${msg}, ${callback}, ${callback2})`)
	}
	ifWin.HybridApp.setData = (strData: string) => {
		consola.success(`window.HybridApp.setData(${strData})`)
		ifData.value = strData
	}
	ifWin.HybridApp.getData = () => {
		consola.success(`window.HybridApp.getData`)
		return ifData.value
	}
	ifWin.HybridApp.setInstantData = (strData: string) => {
		consola.success(`window.HybridApp.setInstantData(${strData})`)
		ifInstantData.value = strData
	}
	ifWin.HybridApp.getInstantData = () => {
		consola.success(`return window.HybridApp.getInstantData => ${ifInstantData.value}`)
		return ifInstantData.value
	}
	ifWin.HybridApp.setLastStep = (nStep: number) => {
		consola.success(`window.HybridApp.setLastStep(${nStep})`)
		ifLastStep.value = nStep
	}
	ifWin.HybridApp.getLastStep = () => {
		consola.success(`window.HybridApp.getLastStep => ${ifLastStep.value} => 최초로드 DB 연동필요`)
		return ifLastStep.value
	}
	ifWin.HybridApp.toast = (msg: any) => {
		consola.success(`window.HybridApp.toast(${msg})`)
	}
	ifWin.HybridApp.getNowStatus = () => {
		/**
		 * 서버에 저장 된 현재 메뉴의 학습 진행 이력을 가지고 온다.
		 * 0 : 미진행 / 1 : 진행중 / 2 : 진행완료
		 */
		consola.success(
			`return window.HybridApp.getNowStatus => ${
				ifIsCompleteContents.value ? 2 : ifLastStep.value > 0 ? 1 : 0
			} => 서버 진행이력 DB조회 필요`,
		)
		return ifIsCompleteContents.value ? 2 : ifLastStep.value > 0 ? 1 : 0
	}
	ifWin.HybridApp.startCameraPreview = async (
		camFacing: any,
		x: any,
		y: any,
		width: any,
		height: any,
	) => {
		consola.success(
			`window.HybridApp.startCameraPreview(camFacing: ${camFacing}, x: ${x}, y: ${y}, width: ${width}, height: ${height})`,
		)
		if (navigator.mediaDevices) {
			const devices = await navigator.mediaDevices.enumerateDevices()
			const videoDevices = devices.filter(device => device.kind === 'videoinput')
			if (videoDevices.length > 0) {
				if (ifWinCamera.value === undefined) {
					const videoEl = ifWin.document.createElement('video')
					videoEl.setAttribute('id', 'ifWinCamera')
					videoEl.setAttribute('playsinline', '')
					videoEl.setAttribute('autoplay', '')
					videoEl.setAttribute('muted', '')
					videoEl.style.width = width
					videoEl.style.height = height
					videoEl.style.position = 'fixed'
					videoEl.style.marginTop = `${Math.abs(x) + 20}px`
					// video.style.left = `${y}px`
					ifWinCamera.value = videoEl
					ifWin.document.body.firstElementChild.prepend(videoEl)
				}
				/* Setting up the constraint */
				const facingMode = 'user' // Can be 'user' or 'environment' to access back or front camera (NEAT!)
				const constraints = {
					audio: false,
					video: {
						facingMode,
					},
				}
				/* Stream it to video element */
				navigator.mediaDevices?.getUserMedia(constraints).then(function success(stream) {
					ifWinCamera.value.srcObject = stream
				})
			}
		} else {
			consola.error('camera 설정이 되어있지 않습니다.')
		}
	}
	ifWin.HybridApp.stopCameraPreview = () => {
		consola.success(`window.HybridApp.stopCameraPreview`)
	}
	ifWin.HybridApp.stopAndHideCameraPreview = () => {
		consola.success(`window.HybridApp.stopAndHideCameraPreview`)
	}
	ifWin.HybridApp.saveCameraPreview = (fn: any) => {
		consola.success(`window.HybridApp.saveCameraPreview(${fn})`)
		if (ifWinCamera.value !== undefined) {
			// 기본 형태
			// data:[<mediatype>][;base64],<data>
			// HTML ➡︎ img태그 src
			// <img src="data:image/<이미지확장자>;base64,<data코드>")
			const doScreenshot = () => {
				const canvas = canvasCapture.value // document.createElement('canvas') as HTMLCanvasElement
				canvas.width = ifWinCamera.value.videoWidth
				canvas.height = ifWinCamera.value.videoHeight
				const canvasContext = canvas.getContext('2d') as any
				canvasContext.drawImage(ifWinCamera.value, 0, 0)
				canvasCaptureDataSrc.value = canvas.toDataURL('image/png')
				if (typeof fn === 'function') {
					fn()
				} else if (typeof fn === 'string') {
					// eslint-disable-next-line no-eval
					eval(`ifWin.${fn}('${canvasCaptureDataSrc.value}')`)
				}
			}
			doScreenshot()
		}
	}
	ifWin.HybridApp.capture = (fn: (arg0: string) => void) => {
		consola.success(`window.HybridApp.capture(${fn})`)
		// 리턴값 확인 필요 : data:image/png;base64,undefined
		const parseImg = canvasCaptureDataSrc.value.split('data:image/png;base64,')
		if (typeof fn === 'function') {
			fn(parseImg.length > 1 ? parseImg[1] : '')
		} else if (typeof fn === 'string') {
			// eslint-disable-next-line no-eval
			eval(`ifWin.${fn}('${parseImg.length > 1 ? parseImg[1] : ''}')`)
		}
	}
	ifWin.HybridApp.startSilvySTTMode = (val: any) => {
		consola.success(`window.HybridApp.startSilvySTTMode(${val})`)
		const str = '버리야 안녕 나는 씩씩한 냥이야. 도덕 공부를 하고 있어.'
		if (typeof ifWin.HybridApp.onResultSTTMode === 'function') {
			ifWin.HybridApp.onResultSTTMode(str)
		} else if (typeof ifWin.setSilvyText === 'function') {
			// callback msg 를 넣어야할듯
			ifWin.setSilvyText(str)
		} else {
			consola.info('해당부분은 셀비음성 API 호출이 안되 다음으로 넘김')
			ifWin.HybridApp.nextMenu()
		}
	}
	// Record
	ifWin.HybridApp.startRecord = async (id: any) => {
		debugger
		consola.success(`window.HybridApp.startRecord(${id})`)
		if (navigator.mediaDevices) {
			const devices = await navigator.mediaDevices.enumerateDevices()
			const videoDevices = devices.filter(device => device.kind === 'videoinput')
			if (videoDevices.length > 0) {
				if (ifWinRecord.value === undefined) {
					const videoEl = ifWin.document.createElement('video')
					videoEl.setAttribute('id', 'ifWinCamera')
					// videoEl.setAttribute('playsinline', '')
					videoEl.setAttribute('autoplay', '')
					videoEl.setAttribute('muted', '')
					// videoEl.style.position = 'fixed'
					// videoEl.style.marginTop = `${Math.abs(x) + 20}px`
					// video.style.left = `${y}px`
					ifWinRecord.value = videoEl
					ifWin.document.body.firstElementChild.prepend(videoEl)
				}
				/* Setting up the constraint */
				const constraints = {
					audio: true,
					video: true,
				}
				/* Stream it to video element */
				navigator.mediaDevices?.getUserMedia(constraints).then(async function success(stream) {
					// ifWinRecord.value.srcObject = stream
					const lengthInMS = 5000
					debugger
					const ret = await startRecording(stream, lengthInMS)
					if (ret) {
						console.log(ret)
					}
				})
			}
		} else {
			consola.error('마이크 설정이 되어있지 않습니다.')
		}
	}
	ifWin.HybridApp.stopRecord = () => {
		debugger
		consola.success(`window.HybridApp.stopRecord`)
	}
	// 	// Sound
	ifWin.HybridApp.createSound = (strId: string, strPath: any) => {
		// consola.success(`window.HybridApp.createSound(${strId}, ${strPath})`)
		if (audioList.value?.findIndex((item: { id: any }) => item.id === strId) === -1) {
			const spl = frame.value.src.split('/HTML_TEST/')
			let path = ''
			const nDot = strPath.startsWith('../') ? 2 : 1
			if (spl.length > 1) {
				path = spl[1]
					.split('/')
					.slice(0, spl[1].split('/').length - nDot)
					.join('/')
			}
			const fullPath = `${spl[0]}/HTML_TEST/${path}/${strPath.replace('../', '')}`
			audioList.value.push({
				id: strId,
				src: fullPath,
			} as ISoundInfo)
		}
	}
	ifWin.HybridApp.playSound = (strId: string, bLoop: any, nVolume: any, strCallbackName: any) => {
		if (typeof window === 'undefined') return
		// consola.success(
		// 	`window.HybridApp.playSound(${strId}, ${bLoop}, ${nVolume}, ${strCallbackName})`,
		// )
		const audioItem = audioList.value?.find((m: { id: string }) => m.id === strId)
		if (audioItem != null) {
			Object.assign(audioItem, {
				loop: bLoop || false,
				volume: nVolume,
				callback: strCallbackName,
				isplaying: true,
			} as ISoundInfo)
			setTimeout(() => {
				const audioEl = document.querySelector(`#${audioItem.id}`) as HTMLAudioElement
				if (audioEl) {
					if (audioEl.paused && audioEl.duration > 0 && !audioEl.ended) {
						audioEl.play()
					}
					if (audioItem.callback !== undefined && audioItem.callback) {
						audioEl.addEventListener('ended', function () {
							// eslint-disable-next-line no-eval
							eval(`ifWin.${audioItem.callback}('${audioItem.id}')`)
							// consola.info(`ifWin.${audioItem.callback}('${audioItem.id}')`)
						})
					}
				}
			}, 300)
		}
	}
	ifWin.HybridApp.seekSound = (strId: string, nMilliSec: number) => {
		// consola.success(`window.HybridApp.seekSound(${strId}, ${nMilliSec})`)
		const audioEl = document.querySelector(`#${strId}`) as HTMLAudioElement
		if (audioEl) {
			audioEl.currentTime = nMilliSec || 0
			audioEl.pause()
		}
	}
	ifWin.HybridApp.pauseSound = (strId: string) => {
		// consola.success(`window.HybridApp.pauseSound(${strId})`)
		const audioEl = document.querySelector(`#${strId}`) as HTMLAudioElement
		audioEl?.pause()
	}
	ifWin.HybridApp.resumeSound = (strId: string) => {
		// consola.success(`window.HybridApp.resumeSound(${strId})`)
		const audioEl = document.querySelector(`#${strId}`) as HTMLAudioElement
		audioEl?.play()
	}
	ifWin.HybridApp.getSoundDuration = (strId: string) => {
		// 사운드 전체 시간 반환
		const audioEl = document.querySelector(`#${strId}`) as HTMLAudioElement
		// consola.success(`return window.HybridApp.getSoundDuration(${strId}=> ${audioEl?.duration})`)
		return audioEl?.duration
	}
	ifWin.HybridApp.getSoundCurrent = (strId: string) => {
		// 사운드 현재 시간 반환
		const audioEl = document.querySelector(`#${strId}`) as HTMLAudioElement
		if (audioEl) {
			consola.success(`return window.HybridApp.getSoundCurrent(${strId}, ${audioEl.currentTime})`)
			return audioEl.currentTime
		}
		return 0
	}
	ifWin.HybridApp.setVolume = (strId: string, nVolumn: any) => {
		const audioEl = document.querySelector(`#${strId}`) as HTMLAudioElement
		if (audioEl) {
			consola.success(`window.HybridApp.setVolume(${strId}, ${nVolumn})`)
			audioEl.volume = nVolumn
		}
	}
	ifWin.HybridApp.playMovie = async (path: string, mode: any, nextPath: any) => {
		const res = await loadMovie(path)
		videoSrc.value = res
		frameSrc.value = ''
		videoNextPath.value = nextPath
		consola.success(`window.HybridApp.playMovie(${path}, ${mode}, ${nextPath})`)
	}
	ifWin.HybridApp.onClosePopupMovie = () => {
		if (ifWin.opener) {
			ifWin.opener.close()
		}
		consola.success(`window.HybridApp.onClosePopupMovie()`)
	}
	ifWin.HybridApp.isFirstLoadedMenu = (): boolean => {
		consola.success(`window.HybridApp.isFirstLoadedMenu => 최초로드 DB 연동필요`)
		return ifLastStep.value === 0
	}

	ifWin.HybridApp.isContinueStudy = (): boolean => {
		consola.success(`window.HybridApp.isContinueStudy => 최초로드 DB 연동필요`)
		return false
	}

	// 팝업 동영상 플레이어를 실행한다.
	ifWin.HybridApp.showPopMovie = function (url: string) {
		consola.success(`window.HybridApp.showPopMovie(${url})`)
	}
	// 팝업 종료 이벤트 핸들러
	ifWin.HybridApp.onClosePopupMovie = function () {
		consola.success(`window.HybridApp.onClosePopupMovie`)
		if (window.opener) {
			window.opener.close()
		}
	}
	// Intent 데이터를 가지고 온다.
	ifWin.HybridApp.getIntentData = function () {
		consola.success(`window.HybridApp.getIntentData`)
		return {
			id: 'moo2',
			mCode: '',
		}
		// var str = window.HybridApp.getIntentData() || "id=아무개임돠&mCode=지정되지않았습니다.";
		// var arr = str.split("&");
		// var objRet = {};
		// for (var i = 0;i<arr.length;++i){
		//     var t = arr[i].split("=");
		//     if(t.length<2) continue;
		//     objRet[t[0]] = t[1];
		// }
		// return objRet;
	}
	ifWin.parent.addEventListener(
		'message',
		(event: { data: string }) => {
			if (['object', 'string'].includes(typeof event.data)) {
				const jsonData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
				if (jsonData.type && jsonData.type !== '') {
					consola.info(jsonData)
				}
			}
		},
		false,
	)
}

const startRecording = (stream: MediaStream, lengthInMS: number) => {
	debugger
	const recorder = new MediaRecorder(stream)
	const data = [] as any

	recorder.ondataavailable = event => data.push(event.data)
	recorder.start()
	consola.info(`${recorder.state} for ${lengthInMS / 1000} seconds...`)

	const stopped = new Promise((resolve, reject) => {
		recorder.onstop = resolve
		recorder.onerror = (event: any) => reject(event.name)
	})
	const wait = (delay: number) => {
		return new Promise(resolve => setTimeout(resolve, delay))
	}
	const recorded = wait(lengthInMS).then(() => {
		if (recorder.state === 'recording') {
			recorder.stop()
		}
	})
	return Promise.all([stopped, recorded]).then(() => data)
}

const loadScriptIFrame = (iframe: any, src: string) => {
	return new Promise(function (resolve, reject) {
		let shouldAppend = false
		let el = iframe.document.querySelector('script[src="' + src + '"]')
		if (!el) {
			el = iframe.document.createElement('script')
			el.type = 'text/javascript'
			el.async = true
			el.src = src
			shouldAppend = true
		} else if (el.hasAttribute('data-loaded')) {
			resolve(el)
			return
		}

		el.addEventListener('error', reject)
		el.addEventListener('abort', reject)
		el.addEventListener('load', function loadScriptHandler() {
			el.setAttribute('data-loaded', true)
			resolve(el)
		})

		if (shouldAppend) iframe.document.head?.appendChild(el)
	})
}
