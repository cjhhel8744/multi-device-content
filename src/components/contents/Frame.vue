<script lang="ts" setup>
import type { IMenuState } from '@/types/menu'
import { consola } from 'consola'
import type { AudioHTMLAttributes } from 'vue'

interface IProps {
	menus: IMenuState
}
interface IRouteParam {
	id: string | ''
}

interface ICdnMovie {
	strMCode: string
	strAuthUrl: string
}
const route = useRoute()
const config = useRuntimeConfig()
const { menus } = defineProps<IProps>()
const menusStore = useMenusStore()
const { setIfXmlDocMenuIdx } = menusStore
const isLocal = config.public.BASE_TARGET === 'local'

const frame = ref()
const frameSrc = ref<string>('')

const videoPlayer = ref()
const videoSrc = ref<string>('')
const videoNextPath = ref<string>('')

const ifWinCamera = ref()
const canvasCapture = ref()
const canvasCaptureDataSrc = ref<string>('')

interface ISoundInfo {
	id: string
	src: string
	loop: { type: boolean; default: false }
	volume: any
	callback: any
	isplaying: boolean
}
const audioPlayer = ref()
const audioList = ref<ISoundInfo[]>([])
const audioSrc = ref<string>('')

const loaded = ref<boolean>(false)
const ifData = ref<string>('')
const ifLastStep = ref<number>(0)
const ifInstantData = ref<string>('')

onMounted(() => {
	frame.value.addEventListener('load', () => {
		try {
			const iDoc = frame.value?.contentDocument || frame.value?.contentWindow?.document
			if (iDoc !== undefined) {
				loaded.value = true
				initFrameEvt()
			}
		} catch (e) {
			loaded.value = false
			console.log(e)
		}
	})
})

const filePath = computed(() => {
	if (process.client) {
		const uid = (route?.params as IRouteParam)?.id
		const menuId = menus.curMenuItem?.id
		const xmlFilePath =
			menus.ifXmlDoc?.menu?.length > 0
				? menus.ifXmlDoc?.menu[menus.ifXmlDoc?.menuIdx]?.file_path
				: undefined
		if (
			(uid === undefined || uid === menuId) &&
			menuId !== undefined &&
			xmlFilePath !== undefined
		) {
			return `${isLocal ? '' : config.public.API_PILOT_URI}/HTML_TEST/${menuId}/${xmlFilePath}`
		}
	}
	return ''
})

watch(
	() => filePath?.value,
	async val => {
		if (val !== '') {
			try {
				audioList.value = [] as ISoundInfo[]
				if (val.endsWith('.mp4')) {
					const res = await loadMovie(val)
					videoSrc.value = res
					frameSrc.value = ''
					console.log(val)
				} else {
					// if (frame.value?.contentWindow && frame.value?.contentWindow?.document) {
					// 	loadScriptIFrame(frame.value.contentWindow, '/js/ext-hybrid-app.js')
					// }
					videoSrc.value = ''
					videoNextPath.value = ''
					frameSrc.value = val
				}
			} catch (e) {
				console.log(e)
			}
		}
	},
	{ deep: true, immediate: true },
)
watch(
	() => videoPlayer.value,
	val => {
		if (val != null) {
			try {
				val.addEventListener('ended', (event: Event) => {
					videoSrc.value = ''
					if (videoNextPath.value === '') {
						const ifWin = frame.value?.contentWindow
						ifWin.HybridApp.nextMenu()
					} else {
						frameSrc.value = `${isLocal ? '' : config.public.API_PILOT_URI}/HTML_TEST/${menus
							.curMenuItem?.id}/${videoNextPath.value}`
					}
				})
			} catch (e) {
				console.log(e)
			}
		}
	},
	{ deep: true, immediate: true },
)
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

const initFrameEvt = () => {
	const ifWin = frame.value?.contentWindow
	if (!ifWin) return
	if (!ifWin.HybridApp) {
		ifWin.HybridApp = {}
	}
	setTimeout(() => {
		const video = ifWin.document.querySelector('video')
		if (video && video.paused) {
			video.muted = true
			video.play()
			// video.muted = false
		}
	}, 1000)

	ifWin.HybridApp.completeContents = () => {
		consola.success(`window.HybridApp.completeContents`)
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
	ifWin.HybridApp.getMenuIndex = () => {
		consola.success(`return window.HybridApp.getMenuIndex => ${menus.ifXmlDoc?.menuIdx}`)
		return menus.ifXmlDoc?.menuIdx // idx
	}
	ifWin.HybridApp.getMenuCount = () => {
		consola.success(`return window.HybridApp.getMenuCount => ${menus.ifXmlDoc?.menu?.length}`)
		return menus.ifXmlDoc?.menu?.length // mCnt
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
		consola.success(`window.HybridApp.getLastStep`)
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
		consola.success(`return window.HybridApp.getNowStatus => 0`)
		return 0
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
			navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
				ifWinCamera.value.srcObject = stream
			})
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
		debugger
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
		debugger
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
	ifWin.HybridApp.startRecord = (id: any) => {
		consola.success(`window.HybridApp.startRecord(${id})`)
	}
	ifWin.HybridApp.stopRecord = () => {
		consola.success(`window.HybridApp.stopRecord`)
	}
	// Sound
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

	ifWin.HybridApp.isFirstLoadedMenu = () => {
		consola.success(`window.HybridApp.isFirstLoadedMenu`)
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

function audioBindItem(item: ISoundInfo) {
	const attr = {} as AudioHTMLAttributes
	if (item.isplaying) {
		attr.autoplay = true
	}
	if (item.loop) {
		attr.loop = true
	}
	return attr
}
</script>

<template>
	<iframe
		v-show="frameSrc !== ''"
		id="frmContent"
		ref="frame"
		:src="frameSrc"
		:data-src="filePath"
		width="1280px"
		height="800px"
		frameborder="0"
		scrolling="no"
		allow="autoplay"
		allowfullscreen="true"
	></iframe>
	<video
		v-if="videoSrc !== ''"
		ref="videoPlayer"
		style="width: 100%; max-width: 1280px"
		:data-src="filePath"
		autoplay
		controlsList="nodownload"
		oncontextmenu="return false"
		controls
	>
		<source :src="videoSrc" type="video/mp4" />
	</video>
	<div>
		<audio
			v-for="(item, index) in audioList"
			:id="item.id"
			:key="index"
			v-bind="audioBindItem(item)"
		>
			<source :src="item.src" type="audio/mpeg" />
		</audio>
	</div>
	<div style="display: none">
		<canvas ref="canvasCapture"></canvas>
	</div>
	<!-- <audio v-if="audioSrc != ''" ref="audioPlayer" controls autoplay>
		<source ref="audioPlayerSource" :src="audioSrc" type="audio/mpeg" />
	</audio> -->
</template>
