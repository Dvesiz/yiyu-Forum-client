<template>
  <div class="user-page">
    <div class="user-card">
      <div class="user-info" v-if="isLogin">
        <van-image round width="64px" height="64px" :src="userInfo.userPic || defaultAvatar" />
        <div class="text-box">
          <h3 class="name">{{ userInfo.nickname || userInfo.username }}</h3>
          <p class="email">{{ userInfo.email }}</p>
        </div>
      </div>
      
      <div class="user-info unlogin" v-else @click="$router.push('/client-login')">
        <div class="avatar-placeholder">
          <van-icon name="user-o" size="32" />
        </div>
        <div class="text-box">
          <h3 class="name">未登录</h3>
          <p class="tips">点击登录/注册账号</p>
        </div>
        <van-icon name="arrow" color="#fff" />
      </div>
    </div>

    <van-cell-group inset class="menu-group">
      <van-cell title="我的文章" icon="records" is-link to="/my-articles" />
      <van-cell title="浏览历史" icon="clock-o" is-link to="/history" />
      <van-cell title="我的收藏" icon="star-o" is-link to="/my-favorites" />
    </van-cell-group>

    <van-cell-group inset class="menu-group">
      <van-cell title="意见反馈" icon="comment-o" is-link />
      <van-cell title="关于我们" icon="info-o" is-link value="v1.0.0" />
    </van-cell-group>

    <div class="logout-box" v-if="isLogin">
      <van-button block color="#ee0a24" @click="logout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request';
import { useRouter } from 'vue-router';
import { showConfirmDialog } from 'vant';

const router = useRouter();
const isLogin = ref(false);
const userInfo = ref({});
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

onMounted(async () => {
  const token = localStorage.getItem('token');
  if (token) {
    isLogin.value = true;
    try {
      // 获取用户信息
      const res = await request.get('/user/userinfo');
      userInfo.value = res.data;
    } catch (e) {
      // Token 过期或无效
      isLogin.value = false;
      localStorage.removeItem('token');
    }
  }
});

const logout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确认退出登录吗？',
  }).then(() => {
    localStorage.removeItem('token');
    isLogin.value = false;
    userInfo.value = {};
    router.push('/home');
  }).catch(() => {});
};
</script>

<style scoped>
.user-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 50px;
}
.user-card {
  background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);
  padding: 40px 20px;
  color: #fff;
  margin-bottom: 15px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.avatar-placeholder {
  width: 64px;
  height: 64px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.text-box {
  flex: 1;
}
.name {
  margin: 0 0 5px 0;
  font-size: 20px;
}
.email, .tips {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}
.menu-group {
  margin-bottom: 12px;
}
.logout-box {
  padding: 20px;
}
</style>