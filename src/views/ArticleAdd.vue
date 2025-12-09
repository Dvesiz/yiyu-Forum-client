<template>
    <div class="add-page">
    <van-nav-bar
      title="发布新文章"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="$router.push('/home')"
    />
  
      <van-form @submit="onSubmit">
        <van-cell-group inset style="margin-top: 15px;">
          <van-field
            v-model="form.title"
            name="title"
            label="标题"
            placeholder="请输入文章标题"
            :rules="[{ required: true, message: '请填写标题' }]"
          />
          
          <van-field
            v-model="categoryName"
            is-link
            readonly
            name="categoryId"
            label="分类"
            placeholder="点击选择分类"
            @click="showPicker = true"
            :rules="[{ required: true, message: '请选择分类' }]"
          />
          <van-popup v-model:show="showPicker" position="bottom">
            <van-picker
              :columns="categoryColumns"
              @confirm="onConfirmCategory"
              @cancel="showPicker = false"
            />
          </van-popup>
  
          <van-field name="coverImg" label="封面">
            <template #input>
              <van-uploader 
                v-model="fileList" 
                :max-count="1" 
                :after-read="afterRead"
                :before-delete="beforeDelete"
              />
            </template>
          </van-field>
  
          <div class="ai-toolbar">
            <van-button 
              size="small" 
              icon="magic-stick" 
              type="primary" 
              plain 
              class="ai-btn"
              native-type="button" 
              @click="showAiDialog = true"
            >
              AI 帮我写
            </van-button>
          </div>
  
          <van-field
            v-model="form.content"
            name="content"
            label="内容"
            type="textarea"
            rows="10"
            placeholder="请输入文章内容，或者点击上方 AI 按钮自动生成"
            autosize
            :rules="[{ required: true, message: '请填写内容' }]"
          />
        </van-cell-group>
  
        <div style="margin: 30px 16px;">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            发布文章
          </van-button>
        </div>
      </van-form>
  
      <van-dialog v-model:show="showAiDialog" title="AI 写作助手" show-cancel-button @confirm="generateContent">
        <div style="padding: 15px;">
          <van-field
            v-model="aiPrompt"
            rows="3"
            autosize
            type="textarea"
            placeholder="例如：帮我写一篇关于 Vue3 学习心得的文章，风格幽默一点..."
            style="background: #f7f8fa; border-radius: 8px;"
          />
        </div>
      </van-dialog>
  
      <!-- <van-overlay :show="aiLoading" style="display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div class="ai-loading-box">
          <van-loading size="36px" type="spinner" color="#4f46e5" vertical>
            AI 正在思考中...
          </van-loading>
        </div>
      </van-overlay> -->
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import request from '@/utils/request';
  import { showSuccessToast, showFailToast, showToast } from 'vant';
  
  const router = useRouter();
  const loading = ref(false);
  
  // 表单数据
  const form = ref({
    title: '',
    categoryId: null,
    coverImg: '',
    content: '',
    state: '已发布' // 默认为发布状态
  });
  
  const fileList = ref([]);
  const showPicker = ref(false);
  const categoryName = ref('');
  const categoryColumns = ref([]);
  
  // AI 相关数据
  const showAiDialog = ref(false);
  const aiPrompt = ref('');
  const aiLoading = ref(false); // 控制遮罩层显示/隐藏
  
  // 获取分类
  const getCategories = async () => {
    try {
      const res = await request.get('/category/public/list');
      categoryColumns.value = res.data.map(item => ({
        text: item.categoryName,
        value: item.id
      }));
    } catch (e) {
      console.error(e);
    }
  };
  
  const onConfirmCategory = ({ selectedOptions }) => {
    form.value.categoryId = selectedOptions[0].value;
    categoryName.value = selectedOptions[0].text;
    showPicker.value = false;
  };
  
  // 上传图片
  const afterRead = async (file) => {
    file.status = 'uploading';
    file.message = '上传中...';
    try {
      const formData = new FormData();
      formData.append('file', file.file);
      const res = await request.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      form.value.coverImg = res.data;
      file.status = 'done';
    } catch (e) {
      file.status = 'failed';
      showFailToast('上传失败');
    }
  };
  
  const beforeDelete = () => {
    form.value.coverImg = '';
    return true;
  };
  
  // === 核心功能：调用后端 AI 接口 ===
  const generateContent = async () => {
  if (!aiPrompt.value) {
    showToast('请输入提示词');
    setTimeout(() => showAiDialog.value = true, 100);
    return;
  }

  aiLoading.value = true;
  try {
    // 调用接口
    const res = await request.get('/article/ai/generate', {
      params: { prompt: aiPrompt.value }
    });
    
    // === 修改部分开始 ===
    // 后端现在返回的是 Map: { title: "...", content: "..." }
    const { title, content } = res.data;

    // 1. 填充标题 (AI生成的标题)
    if (title) {
      form.value.title = title;
    }

    // 2. 填充内容 (去掉了标题的正文)
    if (content) {
      form.value.content = content;
    }
    // === 修改部分结束 ===

    showSuccessToast('生成成功！');
    
  } catch (e) {
    showFailToast('AI 生成失败，请稍后再试');
    console.error(e);
  } finally {
    aiLoading.value = false;
    aiPrompt.value = ''; 
  }
};
  
  // 提交发布
  const onSubmit = async () => {
    if (!form.value.coverImg) {
      showFailToast('请上传封面图');
      return;
    }
    
    loading.value = true;
    try {
      await request.post('/article/add', form.value);
      showSuccessToast('发布成功');
      setTimeout(() => {
        router.push('/my-articles'); // 发布成功后去我的文章列表
      }, 1000);
    } catch (e) {
      // error
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(() => {
    getCategories();
  });
  </script>
  
  <style scoped>
  .add-page {
    min-height: 100vh;
    background: #f7f8fa;
  }
  .ai-toolbar {
    padding: 0 16px;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    border-bottom: 1px solid #f5f6f7;
  }
  .ai-btn {
    border: none;
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
    color: #fff !important;
    margin: 5px 0;
    border-radius: 12px;
  }
  .ai-loading-box {
    background: white;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
  }
  </style>