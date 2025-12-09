<template>
    <div class="edit-page">
      <van-nav-bar
        title="编辑文章"
        left-text="返回"
        left-arrow
        fixed
        placeholder
        @click-left="$router.back()"
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
  
          <van-field
            v-model="form.content"
            name="content"
            label="内容"
            type="textarea"
            rows="10"
            placeholder="请输入文章内容"
            autosize
            :rules="[{ required: true, message: '请填写内容' }]"
          />
        </van-cell-group>
  
        <div style="margin: 30px 16px;">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            保存修改
          </van-button>
        </div>
      </van-form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import request from '@/utils/request';
  import { showSuccessToast, showFailToast } from 'vant';
  
  const route = useRoute();
  const router = useRouter();
  const loading = ref(false);
  
  // 表单数据
  const form = ref({
    id: null,
    title: '',
    categoryId: null,
    coverImg: '',
    content: '',
    state: '' 
  });
  
  // 图片上传列表
  const fileList = ref([]);
  
  // 分类选择器相关
  const showPicker = ref(false);
  const categoryName = ref('');
  const categoryColumns = ref([]);
  
  // 1. 获取文章详情
  const getDetail = async () => {
    const id = route.params.id;
    if (!id) return;
    
    try {
      const res = await request.get(`/article/detail?id=${id}`);
      const data = res.data;
      
      // 回填表单
      form.value = {
        id: data.id,
        title: data.title,
        categoryId: data.categoryId,
        coverImg: data.coverImg,
        content: data.content,
        state: data.state
      };
  
      // 回显图片
      if (data.coverImg) {
        fileList.value = [{ url: data.coverImg, isImage: true }];
      }
      
      // 尝试回显分类名称
      matchCategoryName();
    } catch (e) {
      showFailToast('获取详情失败');
    }
  };
  
  // 2. 获取分类列表
  const getCategories = async () => {
    try {
      const res = await request.get('/category/public/list'); 
      categoryColumns.value = res.data.map(item => ({
        text: item.categoryName,
        value: item.id
      }));
      matchCategoryName();
    } catch (e) {
      console.error(e);
    }
  };
  
  const matchCategoryName = () => {
    if (form.value.categoryId && categoryColumns.value.length > 0) {
      const target = categoryColumns.value.find(c => c.value === form.value.categoryId);
      if (target) categoryName.value = target.text;
    }
  };
  
  const onConfirmCategory = ({ selectedOptions }) => {
    form.value.categoryId = selectedOptions[0].value;
    categoryName.value = selectedOptions[0].text;
    showPicker.value = false;
  };
  
  // 3. 图片上传
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
      file.message = '上传成功';
    } catch (e) {
      file.status = 'failed';
      file.message = '上传失败';
    }
  };
  
  const beforeDelete = () => {
    form.value.coverImg = '';
    return true;
  };
  
  // 4. 提交修改
  const onSubmit = async () => {
    if (!form.value.coverImg) {
      showFailToast('请上传封面图');
      return;
    }
    
    loading.value = true;
    try {
      // 调用更新接口
      await request.put('/article/update', form.value);
      
      showSuccessToast('修改成功');
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (e) {
      // 错误处理
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(async () => {
    await getCategories(); // 先加载分类
    await getDetail();     // 再加载文章详情
  });
  </script>
  
  <style scoped>
  .edit-page {
    min-height: 100vh;
    background: #f7f8fa;
  }
  </style>