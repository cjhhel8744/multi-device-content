export const useFrameResize = () => {
	onMounted(() => {
		if (typeof window === 'undefined') return
		const div = document.querySelector('#contents') as HTMLDivElement
		window.addEventListener('resize', resizeEvent)
		initScaleResize(div)
		setTimeout(() => initScaleResize(div), 100)
		setTimeout(() => {
			window.scrollTo(0, document.body.scrollHeight)
		}, 500)
	})

	onUnmounted(() => {
		if (typeof window === 'undefined') return
		window.removeEventListener('resize', resizeEvent)
	})
	function resizeEvent() {
		const div = document.querySelector('#contents') as HTMLDivElement
		fillDiv(div, true)
	}

	function initScaleResize(div: HTMLDivElement) {
		if (typeof window === 'undefined' || div == null) return
		fillDiv(div, true)
		if ('onorientationchange' in window) {
			console.log('Using orientationchange')
			addResizeEvt(div, 'orientationchange', 500)
		} else if ('ondeviceorientation' in window) {
			console.log('Using deviceorientation')
			addResizeEvt(div, 'deviceorientation', 500)
		} else {
			addResizeEvt(div, 'resize', 0)
		}
	}

	function addResizeEvt(div: HTMLDivElement, evtName: string, delay: number) {
		if (typeof window === 'undefined' || div == null) return
		window.addEventListener(evtName, function () {
			const proportional = true
			if (delay === 0) {
				fillDiv(div, proportional)
			} else {
				setTimeout(function () {
					fillDiv(div, proportional)
				}, delay)
			}
		})
	}

	function getMaxHeight(div: HTMLDivElement) {
		if (typeof window === 'undefined' || div == null) return
		let mHeight = div.offsetHeight
		div.childNodes.forEach((elm: any, i: any) => {
			const bufHeight = Math.max(elm.offsetHeight, elm.clientHeight, elm.scrollHeight)
			if (mHeight < bufHeight) {
				mHeight = bufHeight
			}
		})
		return mHeight
	}

	function fillDiv(div: HTMLDivElement, proportional?: boolean) {
		if (typeof window === 'undefined' || div == null) return
		if (!process.client) return
		const { isMobile } = useDevice()
		const mHeight = getMaxHeight(div) // div.offsetHeight
		if (window.innerWidth > 1200) {
			Object.assign(div.style, {
				'-webkit-transform': 'translate(0px, 0px) scale3d(1, 1, 1)',
				'-webkit-transform-origin': '0 0',
				width: `100%`,
				height: `${mHeight}px`,
			})
			return
		}
		const availableWidth = window.innerWidth
		const scalePer = availableWidth / (isMobile ? 720 : 1280)
		Object.assign(div.style, {
			'-webkit-transform': 'translate(0px, 0px) scale3d(' + scalePer + ', ' + scalePer + ', 1)',
			'-webkit-transform-origin': '0 0',
			width: `${isMobile ? 720 : 1280}px`,
		})
		if (mHeight != null) {
			Object.assign(div.style, {
				height: `${mHeight * scalePer}px`,
			})
		}
	}
}
