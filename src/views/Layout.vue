<template>
  <div class="app-container">
    <router-view />
    
    <van-tabbar route fixed active-color="#4f46e5">
      <van-tabbar-item replace to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/message" icon="comment-o">消息</van-tabbar-item>
      <van-tabbar-item replace to="/article/add" icon="edit">发布</van-tabbar-item>
      <van-tabbar-item replace to="/user" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
/* 保持原有样式不变 */
.app-container {
  padding-bottom: 50px;
  background-color: #f7f8fa;
  min-height: 100vh;
}
.app-container {
  padding-bottom: 50px;
  background-color: #f7f8fa;
  min-height: 100vh;
}
</style>