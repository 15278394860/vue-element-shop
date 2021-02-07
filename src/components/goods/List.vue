<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getData" style="width: 30%;">
                <el-button slot="append" icon="el-icon-search" @click="getData"></el-button>
            </el-input>
            <el-button type="primary" @click="goAdd">添加商品</el-button>
            <el-table :data="listData" border style="width: 100%">
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column prop="goods_name" label="商品名称">
                </el-table-column>
                <el-table-column prop="goods_price" label="商品价格(元)">
                </el-table-column>
                <el-table-column prop="goods_weight" label="商品重量">
                </el-table-column>
                <el-table-column prop="add_time" label="创建时间">
                    <template slot-scope="scope">
                        {{scope.row.add_time|dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-tooltip content="编辑" placement="top">
                            <el-button type="primary" icon="el-icon-edit" circle size="mimn"
                                @click="editProduct(scope.row.goods_id)"></el-button>
                        </el-tooltip>
                        <el-tooltip content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" circle
                                @click="removeList(scope.row.goods_id)" size="mimn">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- <img :src="http://image.suning.cn/uimg/sop/commodity/177319254312693660616785_x.jpg?from=mobile&amp;format=80q.webp"
                alt=""> -->
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 50]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 编辑对话框 -->
        <el-dialog title="编辑商品" :visible.sync="editDialogVisible" width="50%" :before-close="editHandleClose">
            <el-form :model="editList" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="editList.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格" prop="goods_price">
                    <el-input v-model="editList.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model="editList.goods_number"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="editList.goods_weight"></el-input>
                </el-form-item>
                <!-- <el-form-item label="上传的图片" prop="goods_introduce">
                    <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
                        list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item> -->
            </el-form>
            <span slot="footer" class="dialog-footer">
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
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 5
                },
                listData: [],
                total: 0,
                //编辑表单数据
                editList: {},
                editDialogVisible: false,
                editForm: {},
                editFormRules: {}
            }
        },
        created() {
            this.getListData()
        },
        methods: {
            async getListData() {
                const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
                this.listData = res.data.goods
                this.total = res.data.total
                console.log(this.listData);
            },
            //监听分页
            handleSizeChange(page) {
                this.queryInfo.pagesize = page
                this.getListData()
            },
            handleCurrentChange(page) {
                this.queryInfo.pagenum = page
                this.getListData()
            },
            // 搜索
            getData() {
                this.getListData()
            },
            //添加
            goAdd() {
                this.$router.push('/goods/add')
            },
            //编辑
            async editProduct(goods_id) {
                const { data: res } = await this.$http.get(`goods/${goods_id}`, this.editForm)
                this.editList = res.data
                this.editDialogVisible = true
            },
            async edit() {
                console.log(this.editList.goods_name);
                const { data: res } = await this.$http.put(`goods/${this.editList.cat_id}`, this.editList)
                if (res.meta.status !== 200) return this.$message.error('编辑失败')
                this.$message.success('编辑成功')
                // console.log(res);
            },
            editHandleClose() {

            },
            // 删除
            async removeList(goods_id) {
                console.log(goods_id);
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
                const { data: res } = await this.$http.delete('goods/' + goods_id)
                if (res.meta.status !== 200) return this.$message.error('删除用户失败')
                this.$message.success('删除用户成功')
                this.getListData()
            }
        }
    }
</script>
<style lang="less" scoped>
    .el-input {
        width: 100%;
    }

    .el-button {
        margin-left: 15px;
    }

    .el-pagination {
        float: right;
        margin: 20px;
    }
</style>