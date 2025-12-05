<template>
  <div class="my-articles-page">
    <van-nav-bar title="我的文章" left-arrow @click-left="$router.back()" fixed placeholder />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-empty v-if="list.length === 0 && !loading" description="你还没有发布过文章" />

        <div 
          v-for="item in list" 
          :key="item.id" 
          class="art-card"
          @click="$router.push(`/article/${item.id}`)"
        >
          <div class="art-info">
            <h3 class="art-title">{{ item.title }}</h3>
            <div class="art-meta">
              <van-tag :type="item.state === '已发布' ? 'success' : 'warning'">{{ item.state }}</van-tag>
              <span class="time">{{ formatTime(item.createTime) }}</span>
            </div>
          </div>
          <div class="art-cover" v-if="item.coverImg">
            <van-image :src="item.coverImg" fit="cover" radius="4" />
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import request from '@/utils/request';

const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageNum = ref(1);

const onLoad = async () => {
  if (refreshing.value) {
    list.value = [];
    refreshing.value = false;
  }
  
  try {
    // 关键点：调用 /article/listsearch 接口
    // 后端会自动根据 Header 里的 Token 识别当前用户，只返回该用户的文章
    const res = await request.get('/article/listsearch', { 
        params: { pageNum: pageNum.value, pageSize: 10 } 
    });
    const newItems = res.data.items || [];
    
    if (newItems.length === 0) {
      finished.value = true;
    } else {
      list.value.push(...newItems);
      pageNum.value++;
    }
  } catch (e) {
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

const onRefresh = () => {
  finished.value = false;
  pageNum.value = 1;
  loading.value = true;
  onLoad();
};

const formatTime = (time) => {
  if (!time) return '';
  return time.split('T')[0];
};
</script>

<style scoped>
.my-articles-page {
  min-height: 100vh;
  background: #f7f8fa;
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