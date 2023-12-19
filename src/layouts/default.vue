<script lang="ts" setup>
import LayoutHeader from '~/components/header.vue'
const menusStore = useMenusStore()
const { fetchMenuData } = menusStore
const { menuData } = storeToRefs(menusStore)
await fetchMenuData()
</script>

<template>
	<div id="contents">
		<LayoutHeader :menus="menuData"></LayoutHeader>
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
