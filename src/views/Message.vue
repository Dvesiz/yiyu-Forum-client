<template>
  <div class="msg-page">
    <van-nav-bar title="消息通知" fixed placeholder />

    <div v-if="!isLogin" class="unlogin-box">
      <van-empty image="network" description="登录后查看消息通知" />
      <van-button type="primary" round block class="login-btn" to="/client-login">
        去登录
      </van-button>
    </div>

    <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
      <van-list>
        <div v-for="item in list" :key="item.id" class="msg-card">
          <div class="msg-header">
            <van-tag :type="item.type === '系统' ? 'primary' : 'warning'" mark>
              {{ item.type }}
            </van-tag>
            <span class="time">{{ formatTime(item.createTime) }}</span>
          </div>
          <h3 class="title">{{ item.title }}</h3>
          <p class="content">{{ item.content }}</p>
        </div>
        
        <van-empty v-if="list.length === 0" description="暂无新消息" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request';

const isLogin = ref(false);
const list = ref([]);
const refreshing = ref(false);

const checkLogin = () => {
  const token = localStorage.getItem('token');
  isLogin.value = !!token;
  if (isLogin.value) {
    getMessages();
  }
};

const getMessages = async () => {
  try {
    const res = await request.get('/message/list');
    list.value = res.data || [];
  } catch (e) {
    // Token 可能失效
    isLogin.value = false;
  } finally {
    refreshing.value = false;
  }
};

const onRefresh = () => {
  getMessages();
};

const formatTime = (time) => {
  if (!time) return '';
  return time.replace('T', ' ').substring(0, 16);
};

onMounted(() => {
  checkLogin();
});
</script>

<style scoped>
.msg-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 50px;
}
.unlogin-box {
  padding: 50px 20px;
  text-align: center;
}
.login-btn {
  width: 200px;
  margin: 20px auto;
}
.msg-card {
  margin: 15px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.time {
  font-size: 12px;
  color: #999;
}
.title {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
}
.content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}
</style>