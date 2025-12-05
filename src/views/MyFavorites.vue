<template>
  <div class="fav-page">
    <van-nav-bar title="我的收藏" left-arrow @click-left="$router.back()" fixed placeholder />
    
    <div class="list-box">
      <van-empty v-if="list.length === 0" description="暂无收藏的文章" />

      <div 
        v-for="item in list" 
        :key="item.id" 
        class="art-card"
        @click="$router.push(`/article/${item.id}`)"
      >
        <div class="art-info">
          <h3 class="art-title">{{ item.title }}</h3>
          <div class="art-meta">
            <span class="author">{{ item.nickname || '用户' }}</span>
            <span class="time">{{ formatTime(item.createTime) }}</span>
          </div>
        </div>
        <div class="art-cover" v-if="item.coverImg">
          <van-image :src="item.coverImg" fit="cover" radius="4" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request';

const list = ref([]);

onMounted(async () => {
  try {
    const res = await request.get('/favorite/list');
    list.value = res.data || [];
  } catch (e) {
    // error
  }
});

const formatTime = (time) => {
  if (!time) return '';
  return time.split('T')[0];
};
</script>

<style scoped>
.fav-page {
  min-height: 100vh;
  background: #f7f8fa;
}
.list-box {
  padding-top: 10px;
}
.art-card {
  margin: 10px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}
.art-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.art-title {
  font-size: 16px;
  color: #333;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.art-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.art-cover {
  width: 110px;
  height: 75px;
  flex-shrink: 0;
}
.art-cover :deep(.van-image) {
  width: 100%;
  height: 100%;
}
</style>