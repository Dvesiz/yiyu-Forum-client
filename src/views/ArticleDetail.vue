<template>
  <div class="detail-page">
    <van-nav-bar
      title="文章详情"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    >
      <template #right>
        <van-icon 
          :name="isFav ? 'star' : 'star-o'" 
          :color="isFav ? '#ffc107' : '#333'" 
          size="22" 
          @click="toggleFavorite"
        />
      </template>
    </van-nav-bar>
    
    <div v-if="article" class="content-wrapper">
      <h1 class="art-title">{{ article.title }}</h1>
      <div class="art-meta">
        <span class="author">作者: {{ article.nickname || '官方发布' }}</span>
        <span class="date">{{ article.createTime?.replace('T', ' ') }}</span>
      </div>
      <div v-if="article.coverImg" class="cover-box">
        <img :src="article.coverImg" alt="cover" class="cover-img" />
      </div>
      <div class="art-content" v-html="article.content"></div>
    </div>

    <van-loading v-else size="24px" vertical class="loading">加载中...</van-loading>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import request from '@/utils/request';
import { showSuccessToast, showToast } from 'vant';

const route = useRoute();
const article = ref(null);
const isFav = ref(false); // 收藏状态

// 检查收藏状态
const checkFavStatus = async (id) => {
  // 如果没登录，就不查了
  if (!localStorage.getItem('token')) return;
  try {
    const res = await request.get(`/favorite/check?articleId=${id}`);
    isFav.value = res.data;
  } catch (e) {
    // 忽略错误
  }
};

// 切换收藏
const toggleFavorite = async () => {
  if (!localStorage.getItem('token')) {
    showToast('请先登录');
    return;
  }
  
  const id = article.value.id;
  if (isFav.value) {
    // 取消收藏
    await request.delete(`/favorite/delete?articleId=${id}`);
    showToast('已取消收藏');
    isFav.value = false;
  } else {
    // 添加收藏 (注意：POST请求如果后端用 key=value 接收，这里可以用 FormData 或 Params)
    // 这里根据后端 Controller 定义，add(Integer articleId) 只要参数名对上就行
    const params = new URLSearchParams();
    params.append('articleId', id);
    await request.post('/favorite/add', params);
    showSuccessToast('收藏成功');
    isFav.value = true;
  }
};

const saveToHistory = (item) => {
  const HISTORY_KEY = 'BIG_EVENT_HISTORY';
  // 1. 取出旧数据
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  
  // 2. 删除重复的（如果以前看过，先删掉，再加到最前面，保证最新）
  history = history.filter(h => h.id !== item.id);
  
  // 3. 添加新的（只存列表需要的字段，省空间）
  history.unshift({
    id: item.id,
    title: item.title,
    coverImg: item.coverImg,
    nickname: item.nickname,
    createTime: item.createTime,
    viewTime: new Date().toISOString() // 记录观看时间
  });
  
  // 4. 限制数量（比如只存最近 50 条）
  if (history.length > 50) history.pop();
  
  // 5. 存回去
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await request.get(`/article/public/detail?id=${id}`);
    article.value = res.data;
    saveToHistory(res.data);
    
    // 加载完文章后，检查是否收藏
    checkFavStatus(id);
    // 获取成功后，保存到历史记录
    saveToHistory(res.data);
  } catch (e) {
    // 忽略错误
  }
});

</script>

<style scoped>
.detail-page {
  background: #fff;
  min-height: 100vh;
}
.content-wrapper {
  padding: 20px;
}
.art-title {
  font-size: 22px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 15px;
}
.art-meta {
  font-size: 13px;
  color: #969799;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}
.cover-img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 20px;
}
.art-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  overflow-x: hidden;
}
/* 处理内容中的图片自适应 */
:deep(.art-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
.loading {
  margin-top: 100px;
}
</style>