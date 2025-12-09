import axios from 'axios';
import { showToast, showFailToast } from 'vant';
import router from '@/router';

const baseURL = import.meta.env.DEV ? '/api' : '';
const instance = axios.create({ baseURL});

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (err) => Promise.reject(err)
);

// 响应拦截器
instance.interceptors.response.use(
    (res) => {
        if (res.data.code === 0) {
            return res.data;
        }
        // 业务失败提示
        showFailToast(res.data.message || '操作失败');
        return Promise.reject(res.data);
    },
    (err) => {
        // 401 错误处理（未登录或 Token 过期）
        if (err.response?.status === 401) {
            showToast('请先登录');
            localStorage.removeItem('token'); // 清除无效 Token
            // 这里的 router.push 可能需要根据你的实际情况调整，或者由组件自己处理跳转
            // router.push('/client-login'); 
        } else {
            showFailToast('网络繁忙');
        }
        return Promise.reject(err);
    }
);

export default instance;