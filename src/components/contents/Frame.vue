<script lang="ts" setup>
import type { IMenuState } from '@/types/menu'
import type { ISoundInfo } from '@/types/frame'
import { consola } from 'consola'
import type { AudioHTMLAttributes } from 'vue'
import { useHybridApp } from '~/composables/use-hybrid-app'
import type { VideoHTMLAttributes } from 'vue'

interface IProps {
	menus: IMenuState
}
interface IRouteParam {
	id: string | ''
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

const canvasCapture = ref()
const canvasCaptureDataSrc = ref<string>('')

const audioList = ref<ISoundInfo[]>([])

const loaded = ref<boolean>(false)

const hbApp = useHybridApp()

onMounted(() => {
	frame.value.addEventListener('load', () => {
		try {
			const iDoc = frame.value?.contentDocument || frame.value?.contentWindow?.document
			if (iDoc !== undefined) {
				loaded.value = true
				hbApp.initFrameEvt(
					setIfXmlDocMenuIdx,
					menus,
					frame,
					audioList,
					frameSrc,
					videoSrc,
					videoNextPath,
					canvasCapture,
					canvasCaptureDataSrc,
				)
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
					const res = await hbApp.loadMovie(val)
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
				val.addEventListener('ended', (_event: Event) => {
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
</template>
