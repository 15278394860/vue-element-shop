<template>
  <div>
    <el-container>
      <!-- 头部 -->
      <el-header>
        <div class="header">
          <img src="../assets/1.png" alt="" width="50px" height="50px" />
          <span>后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <el-container>
        <!-- 左侧菜单 -->
        <el-aside width="200px">
          <el-row class="tac">
            <el-col :span="12">
              <!-- 左侧菜单区域 -->
              <el-menu background-color="#545c64" text-color="#fff" active-text-color="blue" unique-opened router
                :default-active="activePath">
                <!-- 一级菜单 -->
                <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                  <template slot="title">
                    <i :class="iconsObj[item.id]"></i>
                    <span>{{ item.authName }}</span>
                  </template>
                  <!-- 二级菜单 -->
                  <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
                    @click="saveNavState('/' + subItem.path)"><template slot="title">
                      <i class="el-icon-menu"></i>
                      <span>{{ subItem.authName }}</span>
                    </template></el-menu-item>
                </el-submenu>
              </el-menu>
            </el-col>
          </el-row>
        </el-aside>
        <!-- 内容主体 -->
        <el-container>
          <el-main>
            <!-- 路由占位符 -->
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 左侧菜单数据
        menulist: [],
        //字体图标
        iconsObj: {
          125: 'el-icon-user-solid',
          103: 'el-icon-unlock',
          101: 'el-icon-suitcase',
          102: 'el-icon-tickets',
          145: 'el-icon-pie-chart',
        },
        //被激活的链接地址
        activePath: '',
      }
    },
    created() {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      //   退出登录按钮
      logout() {
        window.sessionStorage.clear()
        this.$router.push('./login')
      },
      // 获取所有菜单
      async getMenuList() {
        const { data: res } = await this.$http.get('menus')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menulist = res.data
        // console.log(this.menulist)
      },
      // 保存链接的激活状态
      saveNavState(activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      },
    },
  }
</script>

<style lang="less" scoped>
  .el-header {
    display: flex;
    justify-content: space-between;
    padding: 5px;
    align-items: center;
    background: rgb(196, 188, 188);
  }

  .header {
    display: flex;
    align-items: center;
  }

  .header span {
    margin-left: 10px;
    font-weight: 900;
    font-size: 25px;
  }

  .el-col-12 {
    width: 100%;
  }

  .el-aside {
    background-color: rgb(84, 92, 100);
  }

  .el-menu {
    border-right: none;
  }
</style>