import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 1. 引入 Vant 样式
import 'vant/lib/index.css'

// 2. 引入组件 (这次补全了 Empty 和 CellGroup)
import { 
    Button, NavBar, Tabbar, TabbarItem, List, Cell, CellGroup, 
    Image as VanImage, PullRefresh, Icon, Tag, Loading, 
    Search, Sticky, Tab, Tabs, Form, Field, Empty, Toast, Dialog 
} from 'vant'

const app = createApp(App)

// 3. 注册组件
app.use(Button)
app.use(NavBar)
app.use(Tabbar)
app.use(TabbarItem)
app.use(List)
app.use(Cell)
app.use(CellGroup) // <--- 修复: 注册单元格组
app.use(VanImage)
app.use(PullRefresh)
app.use(Icon)
app.use(Tag)
app.use(Loading)
app.use(Search)
app.use(Sticky)
app.use(Tab)
app.use(Tabs)
app.use(Form)
app.use(Field)
app.use(Empty)     // <--- 修复: 注册空状态组件
app.use(Toast)
app.use(Dialog)

app.use(router)

app.mount('#app')