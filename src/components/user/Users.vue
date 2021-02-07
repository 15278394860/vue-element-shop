<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加 -->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input placeholder="请输入内容" clearable @clear="getUserList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加按钮</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userSateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170px">
          <template slot-scope="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button type="primary" icon="el-icon-edit" circle size="mimn" @click="edit(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" circle @click="removeUser(scope.row.id)" size="mimn">
              </el-button>
            </el-tooltip>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" circle size="mimn" @click="setRole(scope.row)">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 5, 10, 20]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 内容主体 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑用户对话框 -->
      <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <!-- 内容主体 -->
        <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog title="分配角色" :visible.sync="saveRoleInfoDialogVisible" width="50%" @close="setRoleDialogClosed">
        <el-form :model="editForm" label-width="70px">
          <div>
            <p>当前的用户:{{userInfo.username}}</p>
            <p>当前的角色:{{userInfo.role_name}}</p>
            <p>分配新用户: <el-select v-model="selectedRoleId" placeholder="请选择">
                <el-option v-for="item in valueData" :key="item.id" :label="item.roleName" :value="item.id">
                </el-option>
              </el-select>
            </p>
          </div>
        </el-form>
        <span slot="footer">
          <el-button @click="saveRoleInfoDialogVisible= false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
  export default {
    data() {
      // 自定义邮箱验证规则
      var checkEmail = (rule, value, cb) => {
        const regEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
        if (regEmail.test(value)) {
          return cb()
        }
        cb(new Error('请输入合法的邮箱名'))
      }
      // 自定义手机号验证规则
      var checkMobile = (rule, value, cb) => {
        const regEmail = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regEmail.test(value)) {
          return cb()
        }
        cb(new Error('请输入合法的手机号'))
      }

      return {
        //获取用户列表的参数
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 5,
        },
        userlist: [],
        total: 0,
        // 添加对话框的显示与隐藏
        addDialogVisible: false,
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: '',
        },
        //   添加用户表单的验证规则
        addFormRules: {
          username: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
          password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
          email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }],
          mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { validator: checkMobile, trigger: 'blur' }],
        },
        // 编辑对话框的显示与隐藏
        editDialogVisible: false,
        editForm: {},

        //  控制分配角色的显示与隐藏
        saveRoleInfoDialogVisible: false,
        // 分配角色的用户信息
        userInfo: {},
        valueData: [],
        selectedRoleId: ''
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      //获取数据列表
      async getUserList() {
        const { data: res } = await this.$http.get('users', {
          params: this.queryInfo,
        })

        if (res.meta.status !== 200) return this.$message.error('获取数据失败')
        // this.$message.success('获取数据成功')
        this.userlist = res.data.users
        this.total = res.data.total
        console.log(this.userlist)
      },
      //监听分页
      handleSizeChange(page) {
        this.queryInfo.pagesize = page
        this.getUserList()
      },
      handleCurrentChange(page) {
        this.queryInfo.pagenum = page
        this.getUserList()
      },
      //监听switch开关的状态
      async userSateChange(userinfo) {
        console.log(userinfo)
        const { data: res } = await this.$http.put(
          `users/${userinfo.id}/state/${userinfo.mg_state}`
        )
        if (res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state
          return this.$message.error('更新用户状态失败!')
        }
        this.$message.success('更新用户状态成功!')
      },
      //监听添加用户对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 添加用户
      addUser() {
        this.$refs.addFormRef.validate(async (valid) => {
          //   console.log(valid)
          if (!valid) return
          // 发起添加请求
          const { data: res } = await this.$http.post('users', this.addForm)
          console.log(res)
          if (res.meta.status !== 201) return this.$message.error('添加数据失败')
          this.$message.success('添加数据成功')

          this.addDialogVisible = false
          this.getUserList()
        })
      },
      // 编辑用户对话框
      async edit(id) {
        this.editDialogVisible = true
        const { data: res } = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) return this.$message.error('查询失败')
        // this.$message.success('查询成功')
        this.editForm = res.data
        console.log(this.editForm)
      },
      // 编辑用户
      async editUser() {
        this.$refs.editFormRef.validate(async (valid) => {
          console.log(valid)
          if (!valid) return
          // 发起添加请求
          console.log(this.editForm)
          const { data: res } = await this.$http.put(
            'users/' + this.editForm.id,
            { email: this.editForm.email, mobile: this.editForm.mobile }
          )
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('编辑用户失败')
          this.$message.success('编辑用户成功')

          this.editDialogVisible = false
          this.getUserList()
        })
      },
      //监听编辑用户对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 删除用户
      async removeUser(id) {
        const confirmResult = await this.$confirm(
          '此操作将永久删除该用户, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).catch((err) => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败')
        this.$message.success('删除用户成功')
        this.getUserList()
      },
      // 分配角色对话框关闭事件
      setRoleDialogClosed() {

      },
      // 分配角色对话框
      async setRole(userInfo) {
        this.userInfo = userInfo
        const { data: res } = await this.$http.get('roles')
        console.log(res);
        this.valueData = res.data
        console.log(this.selectedRoleId);
        this.saveRoleInfoDialogVisible = true

      },
      // 设置角色
      async saveRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error('请选择要分配的角色!')
        }
        const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
        if (res.meta.status !== 200) return this.$message.error('设置角色成功失败')
        this.$message.success('设置角色成功成功')
        this.saveRoleInfoDialogVisible = false
        this.getUserList()
      }
    }

  }
</script>
<style lang="less" scoped>
  .el-pagination {
    float: right;
    margin-top: 15px;
  }

  .el-pagination {
    margin: 20px;
  }
</style>