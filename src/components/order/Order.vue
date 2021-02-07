<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getData">
                <el-button slot="append" icon="el-icon-search" @click="getData"></el-button>
            </el-input>
            <el-table :data="orderList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="order_number" label="订单编号" width="180"></el-table-column>
                <el-table-column prop="order_price" label="订单价格" width="180"></el-table-column>
                <el-table-column prop="pay_status" label="是否付款" width="180">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_status==='1'" type="success">已付款</el-tag>
                        <el-tag v-else type="danger">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货" width="180"></el-table-column>
                <el-table-column prop="update_time" label="下单时间" width="180">
                    <template slot-scope="scope">
                        {{scope.row.update_time|dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-tooltip content="编辑地址" placement="top">
                            <el-button type="primary" icon="el-icon-edit" @click="editOrder" size="mimn"></el-button>
                            <!-- <el-button type="primary" icon="el-icon-edit" circle size="mimn" @click="editOrder">
                            </el-button> -->
                        </el-tooltip>
                        <el-tooltip content="物流进度" placement="top" :enterable="false">
                            <el-button type="success" icon="el-icon-location-outline" size="mimn"
                                @click="showLogistics">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 50]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
            <!-- 修改地址对话框 -->
            <el-dialog title="修改地址" :visible.sync="editdialogVisible" width="50%" @close="editDialogClosed">
                <el-form :model="editForm" :rules="editRules" label-width="100px" ref="editFormRef" class="form">
                    <el-form-item label="省市区/县" prop="address1">
                        <el-cascader :options="cityData" v-model="editForm.address1" class="aa"></el-cascader>
                    </el-form-item>
                    <el-form-item label="详细地址" prop="address2">
                        <el-input v-model="editForm.address2" class="aa"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editdialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editAddress">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 查看物流进度 -->
            <el-dialog title="物流进度" :visible.sync="showdialogVisible" width="50%">
                <!-- 时间线 -->
                <!-- <el-timeline>
                    <el-timeline-item v-for="(activity, index) in activities" :key="index"
                        :timestamp="activity.timestamp">
                        {{activity.content}}
                    </el-timeline-item>
                </el-timeline> -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="showdialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editAddress">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>
<script>
    import cityData from './citydata.js'
    export default {
        data() {
            return {
                orderList: [],
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 5,
                    user_id: '',
                    pay_status: ''
                },
                total: 0,
                editdialogVisible: false,
                editForm: {
                    address1: [],
                    address2: ''
                },
                editRules: {
                    address1: [{ required: true, message: '请输入地址', trigger: 'blur' }],
                    address2: [{ required: true, message: '请输入地址', trigger: 'blur' }]
                },
                cityData,
                // 查看物流进度对话框
                showdialogVisible: false
            }
        },
        created() {
            this.getOrdersList()
        },
        methods: {
            async getOrdersList() {
                const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
                this.orderList = res.data.goods
                this.total = res.data.total
                console.log(res);
            },
            // 搜索
            getData() {
                this.getOrdersList()
            },
            //监听分页
            handleSizeChange(page) {
                this.queryInfo.pagesize = page
                this.getOrdersList()
            },
            handleCurrentChange(page) {
                this.queryInfo.pagenum = page
                this.getOrdersList()
            },
            editOrder() {
                this.editdialogVisible = true
            },
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            editAddress() {
                this.$http.get('/kuaidi/:id')
            },
            //    获取物流进度
            async showLogistics() {
                this.showdialogVisible = true
                // const { data: res } = await this.$http.get('/kuaidi/1106975712662')
                // console.log(res);
            }
        }
    }
</script>
<style lang="less" scoped>
    .el-input {
        width: 30%;
    }

    .el-pagination {
        float: right;
        margin: 20px;
    }

    .aa {
        width: 100%;
    }
</style>