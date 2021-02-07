<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 消息提示框 -->
            <el-alert title="添加商品信息" type="info" show-icon center :closable="false">
            </el-alert>
            <!-- 步骤条 -->
            <el-steps finish-status="success" :space="200" :active="activeIndex-0" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form :model="addForm" :rules="AddFormRules" ref="addFormRef" label-position="top" label-width="100px">
                <!-- Tab栏 -->
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave"
                    @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader expandTrigger="hover" v-model="addForm.goods_cat" :options="cateList"
                                :props="cateProps" @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border>
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
                            list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce">
                        </quill-editor>
                        <el-button type="primary" @click="addProduct" class="btn">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%" :before-close="previewClose">
            <img :src="previewPath" alt="">
            <span slot="footer" class="dialog-footer">
                <el-button @click="previewVisible = false">取 消</el-button>
                <el-button type="primary" @click="previewVisible = false">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script>
    import _ from 'lodash'
    export default {
        data() {
            return {
                activeIndex: '0',
                addForm: {
                    goods_name: '',
                    goods_price: 0,
                    goods_number: 0,
                    goods_weight: 0,
                    goods_cat: [],
                    pics: [],
                    // 商品详情描述
                    goods_introduce: '',
                    attrs: []
                },
                cateList: [],
                AddFormRules: {
                    goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
                    goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
                    goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
                    goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
                    goods_weight: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
                },
                cateProps: {
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children'
                },
                // 动态参数列表
                manyTableData: [],
                // 静态属性列表
                onlyTableData: [],
                // 图片上传地址
                uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
                headerObj: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                previewPath: '',
                // 图片对话框的显示与隐藏
                previewVisible: false,
            }
        },
        created() {
            this.getVateList()
        },
        methods: {
            async getVateList() {
                const { data: res } = await this.$http.get('categories')
                this.cateList = res.data
                // console.log(this.cateList);

            },
            handleChange() {
                if (this.addForm.goods_cat.length !== 3) {
                    this.addForm.goods_cat = []
                }
            },
            beforeTabLeave(activeName, oldActiveName) {
                if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                    this.$message.error('请选择商品分类!')
                    return false
                }
            },

            async tabClicked() {
                // 商品参数
                if (this.activeIndex === '1') {
                    const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
                    // console.log(res.data);
                    res.data.forEach(item => {
                        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
                    })
                    this.manyTableData = res.data
                } else if (this.activeIndex === '2') {
                    const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
                    console.log(res.data);
                    this.onlyTableData = res.data
                }
            },
            // 显示图片的对话框
            handlePreview(file) {
                console.log(file);
                this.previewPath = file.response.data.url
                this.previewVisible = true
            },
            // 删除图片
            handleRemove(file) {
                const filePath = file.response.data.tmp_path
                const i = this.addForm.pics.splice(i, 1)
                console.log(this.addForm);
            },
            // 添加图片
            handleSuccess(res) {
                const picInfo = { pic: res.data.tmp_path }
                this.addForm.pics.push(picInfo)
                // console.log(this.addForm);
            },
            previewClose() {
                // this.previewVisible
            },
            addProduct() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) {
                        return this.$message.error('请填写必要的表单项!')
                    }
                    const form = _.cloneDeep(this.addForm)
                    form.goods_cat = this.addForm.goods_cat.join(',')
                    console.log(form);
                    // 处理动态参数
                    this.manyTableData.forEach(item => {
                        const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
                        this.addForm.attrs.push(newInfo)
                    })
                    // 处理静态属性
                    this.onlyTableData.forEach(item => {
                        const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
                        this.addForm.attrs.push(newInfo)
                    })
                    form.attrs = this.addForm.attrs
                    const { data: res } = await this.$http.post('goods', form)
                    console.log(res);
                    if (res.meta.status !== 201) return this.$message.error('商品创建失败')
                    this.$message.success('商品创建成功')
                })
            }
        },
        computed: {
            cateId() {
                if (this.addForm.goods_cat.length === 3) {
                    return this.addForm.goods_cat[2]
                }
                return null
            }
        }
    }
</script>
<style lang="less" scope>
    .el-card {
        margin-top: 20px;
    }

    .el-steps {
        margin-top: 30px;
    }

    .el-tabs {
        margin-top: 20px;
    }

    .el-checkbox {
        margin: 0 5px 0 0 !important;
    }

    .ql-editor {
        min-height: 200px;
        border-bottom: 1px solid rgb(209, 197, 197);
    }

    .btn {
        margin-top: 20px !important;
    }
</style>