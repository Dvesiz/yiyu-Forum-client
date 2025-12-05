<template>
  <div class="login-page">
    <div class="header">
      <img src="@/assets/yiyu.png" class="logo" />
      <h2>欢迎来到亿语论坛</h2>
    </div>


    <van-nav-bar
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="router.back()"
    />
    <van-form @submit="onSubmit" class="form-box">
      <van-cell-group inset>
        <van-field
          v-model="username"
          name="username"
          label="账号"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      
      <div style="margin: 30px 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          立即登录
        </van-button>
        <van-button round block plain type="primary" class="reg-btn" to="/register">
          注册账号
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import request from '@/utils/request';
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';

const username = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();

const onSubmit = async (values) => {
  loading.value = true;
  try {
    // 这里复用后端的登录接口，参数格式可能需要 URLSearchParams
    const params = new URLSearchParams();
    params.append('username', values.username);
    params.append('password', values.password);

    const res = await request.post('/user/login', params);
    localStorage.setItem('token', res.data);
    showSuccessToast('登录成功');
    router.replace('/user'); // 登录后去个人中心
  } catch (err) {
    showFailToast('登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-top: 80px;
}
.header {
  text-align: center;
  margin-bottom: 40px;
}
.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}
.reg-btn {
  margin-top: 15px;
  border: none; 
  background: transparent;
}
</style>