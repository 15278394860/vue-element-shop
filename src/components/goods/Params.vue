<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-alert title="注意: 只允许为第三方分类设置相关参数!" type="warning" show-icon>
            </el-alert>
            <el-row style="margin-top: 15px;">
                <el-col>
                    <span>选择商品分类:</span>
                    <el-cascader v-model="selectedKeys" :options="ParamsList" :props="cascaderProp"
                        style="margin-left: 20px;" @change="paramsHandleChange" expandTrigger="hover" clearable>
                    </el-cascader>
                </el-col>
            </el-row>
            <el-tabs v-model="activeName" @tab-click="handleTabClick" type="card" style="margin-top: 20px;">
                <el-tab-pane label="用户管理" name="many">
                    <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                                    @close="handleClose(index,scope.row)">{{item}}
                                </el-tag>
                                <!-- 循环渲染tab标签 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="input-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-tooltip content="编辑" placement="top">
                                    <el-button type="primary" icon="el-icon-edit" circle size="mimn"
                                        @click="edit(scope.row.attr_id)"></el-button>
                                </el-tooltip>
                                <el-tooltip content="删除" placement="top" :enterable="false">
                                    <el-button type="danger" icon="el-icon-delete" circle
                                        @click="removeId(scope.row.attr_id)" size="mimn">
                                    </el-button>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 静态参数表格 -->
                <el-tab-pane label="配置管理" name="only">
                    <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                                    @close="handleClose(index,scope.row)">{{item}}
                                </el-tag>
                                <!-- 循环渲染tab标签 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="input-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!-- <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-tooltip content="编辑" placement="top">
                                    <el-button type="primary" icon="el-icon-edit" circle size="mimn"
                                        @click="edit(scope.row.id)"></el-button>
                                </el-tooltip>
                                <el-tooltip content="删除" placement="top" :enterable="false">
                                    <el-button type="danger" icon="el-icon-delete" circle @click="removeId(scope.row)"
                                        size="mimn">
                                    </el-button>
                                </el-tooltip>
                            </template>
                        </el-table-column> -->
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" @close="addDialogClosed" width="50%">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑用户对话框 -->
        <el-dialog :title="'编辑'+titleText" :visible.sync="editDialogVisible" width="50%">
            <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>

</template>
<script>
    export default {
        data() {
            return {
                ParamsList: [],
                cascaderProp: {
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children',
                },
                selectedKeys: [],
                // 默认选中的标签
                activeName: 'many',
                // 动态参数数据
                manyTableData: [],
                // 静态参数数据
                onlyTableData: [],
                // 控制添加对话框的显示与隐藏
                addDialogVisible: false,
                addForm: {},
                addFormRules: {
                    attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
                },
                editDialogVisible: false,
                editForm: {
                    attr_name: '',
                    attr_id: '',
                }

            }
        },
        created() {
            this.getParamsList()
            this.getParamsData()
        },
        methods: {
            async getParamsList() {
                const { data: res } = await this.$http.get('categories')
                console.log(res.data);
                this.ParamsList = res.data
            },
            // 级联选择器变化获取数据
            paramsHandleChange() {
                this.getParamsData()
            },
            // 页面切换获取数据
            handleTabClick() {
                this.getParamsData()
            },
            // 获取参数数据
            async getParamsData() {
                if (this.selectedKeys.length !== 3) {
                    this.selectedKeys = []
                    this.manyTableData = []
                    this.onlyTableData = []
                    return
                }
                const { data: res } = await this.$http.get(`categories/${this.paramsId}/attributes`, { params: { sel: this.activeName } })
                console.log(res);
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                    // 控制文本框的显示与隐藏
                    item.inputVisible = false
                    // 文本框输入的值
                    item.inputValue = ''
                })
                console.log(res.data);
                if (this.activeName === 'many') {
                    this.manyTableData = res.data
                } else {
                    this.onlyTableData = res.data
                }
            },
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            addParams() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return
                    const { data: res } = await this.$http.post(`categories/${this.paramsId}/attributes`, {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName
                    })
                    console.log(res);
                    if (res.meta.status !== 201) return this.$message.error('添加失败')
                    this.$message.success('添加成功')
                })

                this.addDialogVisible = false,
                    this.getParamsData()
            },

            async handleInputConfirm(row) {
                if (row.inputValue.trim().length === 0) {
                    row.inputValue = ''
                    row.inputVisible = false
                    return
                }
                row.attr_vals.push(row.inputValue.trim())
                row.inputValue = ''
                row.inputVisible = false
                this.saveAttrVals(row)

            },
            // 发起请求
            async saveAttrVals(row) {
                // 提交数据
                const { data: res } = await this.$http.put(`categories/${this.paramsId}/attributes/${row.attr_id}`, {
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(' ')
                })
                if (res.meta.status !== 200) return this.$message.error('操作失败')
                this.$message.success('操作成功')
                console.log(res);
            },
            // 编辑
            async edit(attr_id) {
                console.log(this.paramsId);
                const { data: res } = await this.$http.get(`categories/${this.paramsId}/attributes/${attr_id}`, { params: { attr_sel: this.activeName } })
                console.log(res);
                this.editForm = res.data
                this.editDialogVisible = true
            },
            editParams() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return
                    const { data: res } = await this.$http.put(`categories/${this.paramsId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.editForm.attr_sel })
                    console.log(res);
                    if (res.meta.status !== 200) return this.$message.error('编辑失败')
                    this.$message.success('编辑成功')
                    this.editDialogVisible = false
                    this.getParamsData()
                })
            },
            // 删除参数
            async removeId(id) {
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
                const { data: res } = await this.$http.delete(`categories/${this.paramsId}/attributes/${id}`)
                console.log(res);
                this.getParamsData()
            },
            // 删除标签
            handleClose(index, row) {
                console.log(index);
                row.attr_vals.splice(index, 1)
                this.saveAttrVals(row)
            },
            showInput(row) {
                row.inputVisible = true
                // 文本框自动获得焦点
                this.inputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            }
        },
        computed: {
            // 判断按钮是否被禁用
            isBtnDisabled() {
                if (this.selectedKeys.length !== 3) {
                    return true
                } else {
                    false
                }
            },
            // 当前选中的三级分类id
            paramsId() {
                if (this.selectedKeys.length === 3) {
                    return this.selectedKeys[2]
                }
                return null
            },
            // 动态计算添加标题
            titleText() {
                if (this.activeName === 'many') {
                    return '动态参数'
                }
                return '静态属性'
            }
        }
    }
</script>
<style style lang="less" scoped>
    .el-tag {
        margin-left: 10px;
    }

    .input-new-tag {
        width: 100px;
        margin-left: 10px;
    }
</style>