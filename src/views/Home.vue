<template>
  <div class="home-page">
    <van-sticky>
      <div class="top-bar">
        <van-search
          v-model="keyword"
          shape="round"
          background="#4f46e5"
          placeholder="请输入搜索关键词"
          show-action
          action-text="搜索"
          clear-trigger="always"
          @search="onSearch"
          @click-action="onSearch"
          @clear="onClear"
        >
           <template #action>
             <div @click="onSearch" style="color: #fff; padding: 0 10px; font-weight: bold;">搜索</div>
           </template>
        </van-search>
        
        <van-tabs v-model:active="activeTab" @click-tab="onTabChange" color="#4f46e5" title-active-color="#4f46e5">
          <van-tab title="推荐" :name="0"></van-tab>
          <van-tab 
            v-for="cat in categories" 
            :key="cat.id" 
            :title="cat.categoryName" 
            :name="cat.id"
          ></van-tab>
        </van-tabs>
      </div>
    </van-sticky>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-empty v-if="list.length === 0 && !loading" description="暂无相关文章" />

        <div 
          v-for="item in list" 
          :key="item.id" 
          class="art-card"
          @click="$router.push(`/article/${item.id}`)"
        >
          <div class="art-info">
            <h3 class="art-title">{{ item.title }}</h3>
            <div class="art-meta">
              <van-tag plain type="primary" style="margin-right: 5px">
                {{ getCategoryName(item.categoryId) }}
              </van-tag>
              <span class="author">{{ item.nickname || '用户' }}</span>
              <span class="fav-btn" @click.stop="toggleFav(item)">
                <van-icon 
                  :name="item.isFavorite ? 'star' : 'star-o'" 
                  :color="item.isFavorite ? '#ffc107' : '#999'" 
                  size="16"
                />
              </span>
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
import { ref, onMounted } from 'vue';
import request from '@/utils/request';
import { showToast, showSuccessToast } from 'vant';

const keyword = ref('');
const activeTab = ref(0);
const categories = ref([]);
const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageNum = ref(1);

// 辅助函数：根据ID获取分类名称
const getCategoryName = (id) => {
  const cat = categories.value.find(c => c.id === id);
  return cat ? cat.categoryName : '资讯';
};

const getCategories = async () => {
  try {
    const res = await request.get('/category/public/list');
    categories.value = res.data || [];
  } catch (e) {
    console.error(e);
  }
};

const onLoad = async () => {
  if (refreshing.value) {
    list.value = [];
    refreshing.value = false;
  }
  
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: 10,
      keyword: keyword.value
    };
    
    // 关键逻辑：如果选中的不是"推荐(0)"，就把分类ID传给后端
    if (activeTab.value !== 0) {
      params.categoryId = activeTab.value;
    }

    const res = await request.get('/article/public/list', { params });
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
// 切换收藏状态
const toggleFav = async (item) => {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('请先登录');
    return;
  }

  try {
    if (item.isFavorite) {
      // 取消收藏
      await request.delete(`/favorite/delete?articleId=${item.id}`);
      item.isFavorite = false; // 更新视图状态
      showToast('已取消');
    } else {
      // 添加收藏
      const params = new URLSearchParams();
      params.append('articleId', item.id);
      await request.post('/favorite/add', params);
      item.isFavorite = true; // 更新视图状态
      showSuccessToast('收藏成功');
    }
  } catch (e) {
    // 错误处理
  }
};
const onRefresh = () => {
  finished.value = false;
  pageNum.value = 1;
  loading.value = true; // 手动置为加载中，防止重复触发
  list.value = [];      // 清空列表，视觉上更明显
  onLoad();
};

const onClear = () => {
  keyword.value = ''; // 1. 强制清空绑定值
  onRefresh(); // 2. 重新加载数据（加载全部）
};

const onSearch = () => {
  showToast(`正在搜索：${keyword.value}`); // 给个提示
  onRefresh();
};

const onTabChange = () => {
  // 切换分类时，清空搜索词（符合一般习惯，也可保留）
  // keyword.value = ''; 
  showToast('切换分类中...');
  onRefresh();
};

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  return `${date.getMonth() + 1}-${date.getDate()}`;
};

onMounted(() => {
  getCategories();
});
</script>

<style scoped>
.home-page {
  padding-bottom: 50px;
  background: #f5f7f9;
  min-height: 100vh;
}
.top-bar {
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
/* 强制把 Vant 搜索栏右侧文字颜色改成白色，因为背景是深紫 */
:deep(.van-search__action) {
  color: #fff; 
}
:deep(.van-search__action:active) {
  background-color: rgba(0,0,0,0.1);
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
  transition: all 0.2s;
}
.art-card:active {
  background: #fafafa;
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
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
}
.art-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  margin-top: 10px;
}
.author {
  margin-right: 10px;
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

.fav-btn {
  margin-left: auto; /* 把星星推到最右边 */
  padding: 5px; /* 增加点击区域 */
  display: flex;
  align-items: center;
}
</style>