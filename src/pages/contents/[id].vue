<script setup lang="ts">
import type { IMenuState } from '~/types/menu'

definePageMeta({ layout: 'default', middleware: 'check-route' })
useHead({
	title: 'MilkT Multi Device',
})
const menusStore = useMenusStore()
const { setPid } = menusStore
const { menuData } = storeToRefs(menusStore)
const cont = ref()
interface IRouteParam {
	id: string | ''
}
const route = useRoute()
useFrameResize()

watch(
	() => (route.params as IRouteParam).id,
	val => {
		if (menuData != null) {
			const menuInfo = menuData?.value as IMenuState
			if (menuInfo?.pid === undefined || val === undefined) {
				setPid(menuInfo?.menuItems[0].id)
			} else {
				setPid(val)
			}
		}
	},
	{ deep: true, immediate: true },
)
</script>

<template>
	<div id="cont" ref="cont">
		<div class="center">
			<ContentsFrame :menus="menuData" />
		</div>
	</div>
</template>

<style>
.center {
	text-align: center;
	margin-top: 0px;
	background-color: #ffffff;
}
</style>
