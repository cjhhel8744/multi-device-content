<script lang="ts" setup>
import LayoutHeader from '~/components/header.vue'
const menusStore = useMenusStore()
const { fetchMenuData } = menusStore
const { menuData } = storeToRefs(menusStore)
await fetchMenuData()
useHead({
	link: [
		{
			rel: 'stylesheet',
			href: `//cdndata.milkt.co.kr/ele/www/web-static/css/common_v5.css?20231011172741`,
		},
	],
})
</script>

<template>
	<div id="contents">
		<Navbar :menus="menuData"></Navbar>
		<div><slot /></div>
	</div>
</template>

<style>
body {
	width: 100%;
	overflow-x: hidden;
	min-width: 1280px !important;
}
#__nuxt {
	width: 100%;
	height: 100%;
	background-color: #ffffff;
}
</style>
