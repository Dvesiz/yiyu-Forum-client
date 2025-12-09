import { createRouter, createWebHashHistory } from 'vue-router';
import Layout from '@/views/Layout.vue';
import Home from '@/views/Home.vue';
import Detail from '@/views/ArticleDetail.vue';
import Message from '@/views/Message.vue';
import User from '@/views/User.vue';
import ClientLogin from '@/views/ClientLogin.vue';
import Register from '@/views/Register.vue';
import MyArticles from '@/views/MyArticles.vue';
import History from '@/views/History.vue';
import MyFavorites from '@/views/MyFavorites.vue';
import ArticleEdit from '@/views/ArticleEdit.vue';
import ArticleAdd from '@/views/ArticleAdd.vue';

const routes = [
  // 1. 登录页（放在这里，不要放在 Layout 里面！）
  { 
    path: '/client-login', 
    component: ClientLogin, 
    meta: { title: '用户登录' } 
  },

  { 
    path: '/register', 
    component: Register, 
    meta: { title: '注册账号' } 
  },

  // 2. 主页面（包含底部导航栏）
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      { path: 'home', component: Home, meta: { title: '最新资讯' } },
      { path: 'message', component: Message, meta: { title: '消息通知' } },
      { path: 'user', component: User, meta: { title: '个人中心' } },
    ]
  },

  // 3. 文章详情页
  {
    path: '/article/:id',
    component: Detail,
    meta: { title: '文章详情' }
  },

  // 4. 我的文章页
  { 
    path: '/my-articles', 
    component: MyArticles, 
    meta: { title: '我的文章' } 
  },
  
  // 5. 浏览历史页
  { 
    path: '/history', 
    component: History, 
    meta: { title: '浏览历史' } 
  },
  { 
    path: '/my-favorites', 
    component: MyFavorites, 
    meta: { title: '我的收藏' } 
  },
  // 6. 文章编辑页
  { 
    path: '/article/edit/:id', 
    component: ArticleEdit, 
    meta: { title: '编辑文章' } 
  },
  // 7. AI 生成/发布页
  { 
    path: '/article/add', 
    component: ArticleAdd, 
    meta: { title: '发布文章' } 
  },

];

const router = createRouter({
  // 使用 Hash 模式，并传入 base url，彻底解决刷新 404 问题
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
});

export default router;