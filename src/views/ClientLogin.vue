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

    <van-tabs v-model:active="activeTab" class="form-box" shrink background="transparent">
      
      <van-tab title="账号密码登录">
        <van-form @submit="onPasswordLogin">
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
              登录
            </van-button>
          </div>
        </van-form>
      </van-tab>

      <van-tab title="邮箱验证码登录">
        <van-form @submit="onEmailLogin">
          <van-cell-group inset>
            <van-field
              v-model="email"
              name="email"
              label="邮箱"
              placeholder="请输入注册邮箱"
              :rules="[
                { required: true, message: '请填写邮箱' },
                { pattern: /.+@.+\..+/, message: '邮箱格式不正确' }
              ]"
            />
            <van-field
              v-model="code"
              name="code"
              label="验证码"
              placeholder="请输入6位验证码"
              :rules="[{ required: true, message: '请填写验证码' }]"
            >
              <template #button>
                <van-button 
                  size="small" 
                  type="primary" 
                  native-type="button" 
                  :disabled="countDown > 0"
                  @click="sendCode"
                >
                  {{ countDown > 0 ? `${countDown}s后重发` : '发送验证码' }}
                </van-button>
              </template>
            </van-field>
          </van-cell-group>
          <div style="margin: 30px 16px;">
            <van-button round block type="primary" native-type="submit" :loading="loading">
              登录
            </van-button>
          </div>
        </van-form>
      </van-tab>

    </van-tabs>

    <div style="margin: 0 16px;">
      <van-button round block plain type="primary" class="reg-btn" to="/register">
        注册账号
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import request from '@/utils/request';
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast, showToast } from 'vant';

const router = useRouter();
const activeTab = ref(0);
const loading = ref(false);

// 账号密码数据
const username = ref('');
const password = ref('');

// 邮箱登录数据
const email = ref('');
const code = ref('');
const countDown = ref(0); // 倒计时

// 发送验证码逻辑
const sendCode = async () => {
  // 校验邮箱格式
  if (!email.value || !/.+@.+\..+/.test(email.value)) {
    showToast('请输入正确的邮箱地址');
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append('email', email.value);
    
    await request.post('/user/sendCode', params);
    
    showSuccessToast('验证码已发送');
    // 启动60秒倒计时
    countDown.value = 60;
    const timer = setInterval(() => {
      countDown.value--;
      if (countDown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (err) {
    // 错误在 request.js 拦截器处理
  }
};

// 账号密码登录
const onPasswordLogin = async (values) => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('username', values.username);
    params.append('password', values.password);

    const res = await request.post('/user/login', params);
    localStorage.setItem('token', res.data);
    showSuccessToast('登录成功');
    router.replace('/user');
  } catch (err) {
    // error
  } finally {
    loading.value = false;
  }
};

// 邮箱登录
const onEmailLogin = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('email', email.value.trim());
    params.append('code', code.value.trim());

    const res = await request.post('/user/loginByEmail', params);
    localStorage.setItem('token', res.data);

    showSuccessToast('登录成功');
    router.replace('/user');
  } catch (err) {
    showFailToast('验证码错误或邮箱未注册');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-top: 50px;
}
.header {
  text-align: center;
  margin-bottom: 20px;
}
.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}
.form-box {
  margin-bottom: 20px;
}
/* 调整 Vant Tabs 样式，使其更融合背景 */
:deep(.van-tabs__nav) {
  background-color: transparent; 
}
.reg-btn {
  margin-top: 15px;
  border: none; 
  background: transparent;
}
</style>