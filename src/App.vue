<script setup>
// 这里不需要引入 HelloWorld 了，交给路由去管理页面
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式：去除浏览器默认的边距，设置背景色 */
body {
  margin: 0;
  padding: 0;
  background-color: #f7f8fa;
  -webkit-font-smoothing: antialiased;
}
#app {
  height: 100vh;
}
</style>