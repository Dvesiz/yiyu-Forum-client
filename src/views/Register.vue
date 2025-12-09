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
          v-model="email"
          name="email"
          label="邮箱"
          placeholder="请输入您的邮箱地址"
          :rules="[
            { required: true, message: '请填写邮箱' },
            { type: 'email', message: '邮箱格式不正确' } 
          ]"
        />

        <van-field
          v-model="verificationCode"
          name="code"
          label="验证码"
          placeholder="请填写收到的6位验证码"
          :rules="[
            { required: true, message: '请填写验证码' },
            { pattern: /^\d{6}$/, message: '验证码格式错误 (6位数字)' } 
          ]"
        >
          <template #button>
            <van-button 
                size="small" 
                type="primary" 
                :disabled="countdown > 0 || isSending" 
                :loading="isSending"
                @click.prevent="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s 后重发` : '发送验证码' }}
            </van-button>
          </template>
        </van-field>

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
import { showNotify } from 'vant';
const username = ref('');
const email = ref(''); 
const verificationCode = ref(''); // 验证码
const password = ref('');
const rePassword = ref('');

// 状态变量
const loading = ref(false);
const isSending = ref(false);     // 正在发送中
const countdown = ref(0);         // 倒计时秒数
const TOTAL_COUNTDOWN_SECONDS = 60; // 倒计时总秒数

const router = useRouter();
let timer = null; // 用于存储计时器实例

// 校验两次密码是否一致
const validatePass = (val) => val === password.value;

// 启动倒计时
const startCountdown = () => {
    countdown.value = TOTAL_COUNTDOWN_SECONDS;
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
            timer = null;
        }
    }, 1000);
};

// 发送验证码到邮箱
const sendCode = async () => {
    // 1. 基础校验：检查邮箱是否填写正确（这里只做简单正则校验，Vant 表单会自动做更严格的校验）
    const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!email.value || !emailRegex.test(email.value)) {
        showFailToast('请填写正确的邮箱格式');
        return;
    }
    
    // 2. 防止重复发送和正在倒计时
    if (countdown.value > 0 || isSending.value) return; 

    isSending.value = true;
    try {
        // 调用后端发送验证码接口 (POST /user/code?email=...)
        // 注意：这里使用 POST 方法发送 GET 参数是为了兼容一些 API 设计，确保后端能正确接收
        await request.post(`/user/sendCode?email=${email.value}`); 
        showSuccessToast('验证码已发送至您的邮箱，请查收');
        startCountdown(); // 成功后启动倒计时
    } catch (err) {
        // 错误处理由 request.js 拦截器处理
        // 如果后端返回了具体的错误消息，通常会被 Vant 拦截器显示
        
    } finally {
        isSending.value = false;
    }
};


const onSubmit = async (values) => {
    loading.value = true;
    try {
        // 构造 x-www-form-urlencoded 格式参数 (后端要求的)
        const params = new URLSearchParams();
        params.append('username', values.username);
        params.append('email', values.email); 
        params.append('password', values.password);
        // 提交验证码
        params.append('code', verificationCode.value); 

        // 调用后端注册接口
        await request.post('/user/register', params);
        
        showNotify({ type: 'success', message: '注册成功，请登录' });
        // 注册成功后，跳转回登录页
        router.replace('/client-login');
    } catch (err) {
        // 错误已经在 request.js 拦截器里处理了
        showNotify({ type: 'danger', message: '注册失败' });
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* 样式保持不变 */
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