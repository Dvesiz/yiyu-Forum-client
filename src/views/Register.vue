<template>
  <div class="register-page">
    <div class="header">
      <img src="@/assets/yiyu.png" class="logo" />
      <h2>注册新账号</h2>
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
          placeholder="请输入用户名 (5-16位)"
          :rules="[
            { required: true, message: '请填写用户名' },
            { pattern: /^\S{5,16}$/, message: '用户名必须是5-16位非空字符' }
          ]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码 (5-16位)"
          :rules="[
            { required: true, message: '请填写密码' },
            { pattern: /^\S{5,16}$/, message: '密码必须是5-16位非空字符' }
          ]"
        />
        <van-field
          v-model="rePassword"
          type="password"
          name="rePassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[{ validator: validatePass, message: '两次密码不一致' }]"
        />
      </van-cell-group>
      
      <div style="margin: 30px 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          立即注册
        </van-button>
        <van-button round block plain type="default" class="back-btn" @click="$router.back()">
          返回登录
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
const rePassword = ref('');
const loading = ref(false);
const router = useRouter();

// 校验两次密码是否一致
const validatePass = (val) => val === password.value;

const onSubmit = async (values) => {
  loading.value = true;
  try {
    // 构造 x-www-form-urlencoded 格式参数 (后端要求的)
    const params = new URLSearchParams();
    params.append('username', values.username);
    params.append('password', values.password);

    // 调用后端注册接口
    await request.post('/user/register', params);
    
    showSuccessToast('注册成功，请登录');
    // 注册成功后，跳转回登录页
    router.replace('/client-login');
  } catch (err) {
    // 错误已经在 request.js 拦截器里处理了，这里只负责停止 loading
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-top: 50px;
}
.header {
  text-align: center;
  margin-bottom: 30px;
}
.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}
.back-btn {
  margin-top: 15px;
  border: none;
  background: transparent;
  color: #666;
}
</style>