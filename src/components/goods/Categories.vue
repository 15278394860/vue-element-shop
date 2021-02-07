<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-button type="primary" @click="addCategoriesDialog">添加分类</el-button>
            <!-- 表格 -->
            <tree-table :data="CategoriesList" :columns="columns" :selection-type="false" border :expand-type="false"
                style="margin-top: 20px;" show-index>
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:green"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
                    <el-tag v-else="scope.row.cat_level===2" type="warning">三级</el-tag>
                </template>
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCategory(scope.row.cat_id)">编辑
                    </el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="remove(scope.row.cat_id)">删除
                    </el-button>
                </template>
            </tree-table>
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum" :page-sizes="[5, 10, 20, 30]" :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" style="float:right;margin: 20px;">
            </el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog title="添加分类" :visible.sync="addDialogVisible" @close="addDialogClosed" width="50%">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <!-- 级联选择器 -->
                    <el-cascader v-model="selectedKeys" :options="ParentCategoriesList" :props="cascaderProp"
                        @change="parentHandleChange" expandTrigger="hover" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCategories">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑分类对话框 -->
        <el-dialog title="编辑分类" :visible.sync="editDialogVisible" @close="editDialogClosed" width="50%">
            <el-form :model="editForm" :rules="addFormRules" ref="editFormRef">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="edit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                // 分页参数
                querInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                CategoriesList: [],
                // 页面总数
                total: 0,
                //table列的定义
                columns: [{
                    label: '分类名称',
                    prop: 'cat_name'
                }, {
                    label: '是否有效',
                    // 表示当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用模板名称
                    template: 'isok',
                }, {
                    label: '排序',
                    // 表示当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用模板名称
                    template: 'order',
                }, {
                    label: '操作',
                    // 表示当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用模板名称
                    template: 'opt',
                }],
                // 控制添加分类对话框
                addDialogVisible: false,
                // 添加对话框数据
                addForm: {
                    cat_name: '',
                    cat_pid: '0',
                    cat_level: '0',
                },
                // 添加表单验证规则
                addFormRules: {
                    cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
                },
                // 获取父级分类数据列表
                ParentCategoriesList: [],
                cascaderProp: {
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children',
                },
                // 选中的父级分类id数组
                selectedKeys: [],
                editDialogVisible: false,
                editForm: {}
            }
        },
        created() {
            this.getCategoriesList()

        },
        methods: {
            // 获取数据
            async getCategoriesList() {
                const { data: res } = await this.$http.get('categories', { params: this.querInfo })
                console.log(res.data);
                this.CategoriesList = res.data.result
                this.total = res.data.total
            },
            // 分页
            handleSizeChange(page) {
                this.querInfo.pagesize = page
                this.getCategoriesList()
            },
            handleCurrentChange(page) {
                this.querInfo.pagenum = page
                this.getCategoriesList()
            },
            // 添加对话框
            addCategoriesDialog() {
                this.addDialogVisible = true
                this.getParentCategoriesList()
            },
            // 获取商品分类数据列表
            async getParentCategoriesList() {
                const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
                console.log(res.data);
                this.ParentCategoriesList = res.data
            },
            // 选择项发生变化触发这个函数
            parentHandleChange() {
                console.log(this.selectedKeys);
                if (this.selectedKeys.length > 0) {
                    // 为当前分类id赋值
                    this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                    this.addForm.cat_level = this.selectedKeys.length
                    console.log(this.addForm.cat_pid, this.addForm.cat_level);
                    return
                } else {
                    this.addForm.cat_pid = 0
                    this.addForm.cat_level = 0
                }

            },
            // 添加分类
            addCategories() {
                console.log(this.addForm);
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return
                    const { data: res } = await this.$http.post('categories', this.addForm)
                    if (res.meta.status !== 201) return this.$message.error('获取数据失败')
                    this.$message.success('添加分类成功')
                    this.getCategoriesList()
                })
                this.addDialogVisible = false
                this.getCategoriesList()

            },
            // 关闭表单时清空表单数据
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
                this.selectedKeys = []
                this.addForm.cat_pid = 0
                this.addForm.cat_level = 0
            },
            async editCategory(cat_id) {
                this.editDialogVisible = true
                const { data: res } = await this.$http.get('categories/' + cat_id)
                this.editForm = res.data
            },
            editDialogClosed() {

            },
            async edit() {
                console.log(this.editForm);
                const { data: res } = await this.$http.put(`categories/` + this.editForm.cat_id, this.editForm)
                if (res.meta.status !== 200) return this.$message.error('编辑失败')
                this.$message.success('编辑成功')
                this.editDialogVisible = false
                this.getCategoriesList()
            },
            async remove(cat_id) {
                console.log(cat_id);
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
                const { data: res } = await this.$http.delete('categories/' + cat_id)
                if (res.meta.status !== 200) return this.$message.error('删除用户失败')
                this.$message.success('删除用户成功')
                this.getCategoriesList()
            }

        }
    }
</script>
<style style lang="less" scoped>
    .el-cascader {
        width: 100%;
    }
</style>