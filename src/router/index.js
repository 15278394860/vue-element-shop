import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')
// import Users from '../components/user/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'

const Categories = () => import(/* webpackChunkName: "Categories_Params" */ '../components/goods/Categories.vue')
const Params = () => import(/* webpackChunkName: "Categories_Params" */ '../components/goods/Params.vue')
// import Categories from '../components/goods/Categories.vue'
// import Params from '../components/goods/Params.vue'

const List = () => import(/* webpackChunkName: "List_Add_Order_Report" */ '../components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "List_Add_Order_Report" */ '../components/goods/Add.vue')
const Order = () => import(/* webpackChunkName: "List_Add_Order_Report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "List_Add_Order_Report" */ '../components/report/Report.vue')
// import List from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'


Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [{
        path: '/welcome', component: Welcome
      }, {
        path: '/users', component: Users
      }, {
        path: '/rights', component: Rights
      }, {
        path: '/roles', component: Roles
      }, {
        path: '/categories', component: Categories
      }, {
        path: '/params', component: Params
      }, {
        path: '/goods', component: List
      }, {
        path: '/goods/add', component: Add
      }, {
        path: '/orders', component: Order
      }, {
        path: '/reports', component: Report
      }]
    }
  ]
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {

  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router