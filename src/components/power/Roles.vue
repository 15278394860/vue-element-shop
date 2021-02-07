<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-button type="primary" @click="addRole">添加角色</el-button>
            <!-- 表格 -->
            <el-table :data="rolesList" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbotton',index1===0 ? 'bdtop':'','vcenter']"
                            v-for="(item1,index1) in scope.row.children" :key="item1.id">
                            <el-col :span="5">
                                <el-tag @close="removeRoles(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row :class="[index2===0 ? '':'bdtop','vcenter']"
                                    v-for="(item2,index2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" @close="removeRoles(scope.row,item2.id)" closable>
                                            {{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-row v-for="(item3,index3) in item2.children" :key="item3.id">
                                            <el-tag type="warning" @close="removeRoles(scope.row,item3.id)" closable>
                                                {{item3.authName}}
                                            </el-tag>
                                        </el-row>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" prop="level">
                    <template slot-scope="scope">
                        <el-tooltip content="编辑" placement="top">
                            <el-button type="primary" icon="el-icon-edit" circle size="mimn"
                                @click="editRole(scope.row.id)"></el-button>
                        </el-tooltip>
                        <el-tooltip content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" circle @click="remove(scope.row.id)"
                                size="mimn"></el-button>
                        </el-tooltip>
                        <el-tooltip content="分配权限" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" circle size="mimn"
                                @click="showSetRightDialong(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分配权限对话框 -->
            <el-dialog title="分配权限" :visible.sync="SetRightDialogVisible" @close="SetRightDialogClosed" width="50%">
                <!-- 树形控件 -->
                <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id"
                    :default-checked-keys="defKeys" default-expand-all ref="treeRef"></el-tree>
                <span slot="footer">
                    <el-button @click="SetRightDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="allotRights">确 定</el-button>
                </span>
            </el-dialog>

        </el-card>
        <!-- 添加角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%">
            <el-form label-width="70px">
                <div>
                    <el-form :model="addForm" :rules="addRules" ref="addRuleForm" label-width="100px">
                        <el-form-item label="角色名称" prop="roleName">
                            <el-input v-model="addForm.roleName"></el-input>
                        </el-form-item>
                        <el-form-item label="角色描述" prop="roleDesc">
                            <el-input v-model="addForm.roleDesc"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </el-form>
            <span slot="footer">
                <el-button @click="addRoleDialogVisible= false">取 消</el-button>
                <el-button type="primary" @click="add">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑角色对话框 -->
        <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" width="50%">
            <el-form label-width="70px">
                <div>
                    <el-form :model="editForm" :rules="addRules" ref="editFormRef" label-width="100px">
                        <el-form-item label="角色名称" prop="roleName">
                            <el-input v-model="editForm.roleName"></el-input>
                        </el-form-item>
                        <el-form-item label="角色描述" prop="roleDesc">
                            <el-input v-model="editForm.roleDesc"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </el-form>
            <span slot="footer">
                <el-button @click="editRoleDialogVisible= false">取 消</el-button>
                <el-button type="primary" @click="edit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                rolesList: [],
                // 分配权限对话框的显示与隐藏
                SetRightDialogVisible: false,
                //权限信息
                rightsList: [],
                // 树形控件属性绑定
                treeProps: {
                    label: 'authName',
                    children: 'children'
                },
                // 默认选中节点id值的数组
                defKeys: [],
                // 当前分配角色权限的id
                roleId: '',
                // 控制添加角色的对话框
                addRoleDialogVisible: false,
                addForm: {
                    roleName: '',
                    roleDesc: ''
                },
                //   添加用户表单的验证规则
                addRules: {
                    roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
                },
                editRoleDialogVisible: false,
                editForm: {
                    roleName: '',
                    roleDesc: '',
                    id: ''
                }
            }
        },
        created() {
            this.getRolesList()
        },
        methods: {
            // 获取数据
            async getRolesList() {
                const { data: res } = await this.$http.get('roles')
                this.rolesList = res.data
            },
            // 添加角色
            addRole() {
                this.addRoleDialogVisible = true
            },
            addRuleForm() {
                this.$refs.addRuleForm.resetFields()
            },
            async add() {
                const { data: res } = await this.$http.post('roles', this.addForm)
                if (res.meta.status !== 201) return this.$message.error('添加角色失败')
                this.$message.success('添加角色成功')
                this.addRoleDialogVisible = false
                this.getRolesList()
            },
            // 编辑角色
            async editRole(row) {
                const { data: res } = await this.$http.get('roles/' + row)
                this.editForm = res.data
                this.editRoleDialogVisible = true

            },
            async edit() {
                this.$refs.editFormRef.validate(async (valid) => {
                    if (!valid) return
                    const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, this.editForm)
                    this.editRoleDialogVisible = false
                    this.getRolesList()
                })

            },
            // 删除角色
            async remove(id) {
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
                const { data: res } = await this.$http.delete(`roles/${id}`)
                if (res.meta.status !== 200) return this.$message.error('删除角色失败')
                this.$message.success('删除角色成功')
                this.getRolesList()
            },
            //删除权限
            async removeRoles(role, rightId) {
                console.log(rightId);
                const confirmResult = await this.$confirm(
                    '此操作将永久删除该权限, 是否继续?',
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
                const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if (res.meta.status !== 200) return this.$message.error('删除该权限失败')
                this.$message.success('删除该权限成功')
                // 重新获取最新数据
                role.children = res.data
            },
            // 展示分配权限对话框
            async showSetRightDialong(role) {
                this.roleId = role.id
                const { data: res } = await this.$http.get('rights/tree')
                // console.log(res);
                this.rightsList = res.data
                // 调用递归函数
                this.getLeafKeys(role, this.defKeys)
                this.SetRightDialogVisible = true

            },
            // 通过递归获取角色下所有三级权限id保存到defKeys
            getLeafKeys(node, arr) {
                // 如果当前node节点不包括children属性则是三级节点
                if (!node.children) {
                    return arr.push(node.id)
                }
                node.children.forEach(item => {
                    this.getLeafKeys(item, arr)
                });
            },
            // 监听对话框关闭事件，清空数组
            SetRightDialogClosed() {
                this.defKeys = []
            },
            // 点击为角色分配权限
            async allotRights() {
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ]
                // console.log(keys);
                const idStr = keys.join(',')
                const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
                if (res.meta.status !== 200) return this.$message.error('更改用户权限失败')
                this.$message.success('更改用户权限成功')
                this.getRolesList()
                this.SetRightDialogVisible = false

            }

        }
    }
</script>
<style lang="less" scoped>
    .el-tag {
        margin: 10px;
    }

    .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbotton {
        border-bottom: 1px solid #eee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>