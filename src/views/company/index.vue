<template>
    <div class="app-container">
        <!-- 搜索条件 -->
        <div class="filter-container">
            <!-- 业务方名称搜索，过滤首尾空格 -->
            <el-input @keyup.enter.native="handleFilter" class="filter-item" clearable="clearable" placeholder="回车搜索名称" style="width: 200px;" v-model.trim="listQuery.companyName"/>
            <!-- 搜索 -->
            <el-button @click="handleFilter" class="filter-item" icon="el-icon-search" type="primary">搜索</el-button>
        </div>
        <!-- 搜索条件结束 -->
        <!-- 新建 -->
        <el-button @click="handleCreate" class="filter-item" icon="el-icon-plus" type="primary">
            新建
        </el-button>
        <el-checkbox
            v-model="showUCallBusiness"
            class="filter-item"
            style="margin-left:15px;"
            @change="tableKey=tableKey+1">
            UCall业务类型
        </el-checkbox>
        <!-- table主体，具备加载等待动画、边框、宽度自适应、高亮当前行等交互 -->
        <el-table :data="list" :key="tableKey" border="border" element-loading-spinner="el-icon-loading" element-loading-text="列表加载中" fit="fit" highlight-current-row="highlight-current-row" style="width: 100%;" v-loading="listLoading">
            <!-- 序号 -->
            <el-table-column :label="'#'" align="center" type="index" width="65"/>
            <!-- 创建日期 -->
            <el-table-column :label="'创建日期'" align="center" prop="createDate" width="120px"></el-table-column>
            <!-- 业务方名称 -->
            <el-table-column :label="'业务方名称'" align="center" min-width="110px" prop="companyName"/>
            <!-- UCall业务类型 -->
            <el-table-column 
                v-if="showUCallBusiness"
                :label="'UCall业务类型'" 
                align="center" 
                min-width="110px"
                prop="ucallBusinessType"
                >
                <!-- <template slot-scope="scope">
                    <span>{{scope.row.ucallBusinessTypeId | ucallBusinessTypeFilter(ucallBusinessTypeMapper)}}</span>
                </template> -->
            </el-table-column>

            <!-- 任务描述 -->
            <el-table-column :label="'任务描述'" min-width="180px" prop="companyDesc"/>
            <!-- 操作栏，根据当前行的不同状态显示按钮 -->
            <el-table-column :label="'操作栏'" align="center" class-name="small-padding fixed-width" width="230">
                <template slot-scope="scope">
                    <!-- 编辑按钮 -->
                    <el-button @click="handleUpdate(scope.row)" size="mini" type="primary">编辑</el-button>
                    <!-- 确认删除对话框 -->
                    <el-popconfirm
                        title="删除后不可恢复确定删除吗？"
                        @onConfirm="handleDelete(scope.row)"
                        >
                            <el-button
                            size="mini"
                            slot="reference">删除</el-button>
                    </el-popconfirm>
                    <!-- 确认删除对话框 -->
                </template>
            </el-table-column>
        </el-table>
        <!-- table主体结束 -->
        <!-- 分页组件，如果没有数据默认不显示，如果显示器高度大于1000px则默认每页显示20条
        这里封装了el-pagination，具体配置项可以查看组件的注释，很多非常规需求在这里没有列出
        -->
        <pagination :limit.sync="listQuery.pageSize" :page.sync="listQuery.pageNum" :total="total" @pagination="getList" v-show="total>0"/>
        <!-- 添加弹窗 -->
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
            <!-- 自定义表单的校验规则 -->
            <el-form 
                :model="temp" 
                :rules="rules" 
                label-position="right" 
                label-width="100px" 
                ref="dataForm" 
                style="max-width: 80%; margin:auto">
                <!-- 业务方名称:必填、长度校验 -->
                <el-form-item :label="'业务方名称'" prop="companyName">
                    <el-input placeholder="在此输入名称" v-model="temp.companyName"/>
                </el-form-item>
                <!-- UCall业务类型，非必填 -->
                <el-form-item :label="'业务方名称'" prop="ucallBusinessType">
                    <el-select 
                        v-model="temp.ucallBusinessType" 
                        clearable 
                        placeholder="请选择UCall业务方"
                        style="width:100%"
                        @clear="clearBussinessOption"
                        @change="selectChange"
                        >
                        <el-option
                        v-for="item in temp.selectUCallBusiness"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <!-- 描述：文本域根据父级容器大小自适应 -->
                <el-form-item :label="'描述'" prop="companyDesc">
                    <el-input :autosize="{ minRows: 2, maxRows: 4}" placeholder="请在此输入您描述" type="textarea" v-model="temp.companyDesc"/>
                </el-form-item>
            </el-form>
            <div class="dialog-footer" slot="footer">
                <el-button @click="dialogFormVisible = false">
                    取消
                </el-button>
                <el-button @click="dialogStatus==='create'?createData():updateData()" type="primary">
                    提交
                </el-button>
            </div>
        </el-dialog>
        <!-- 添加弹窗结束 -->
        
    </div>
</template>

<script>
    // 接口api
    import {
        getList, 
        createOrEdit, 
        deleteOne,
        // 获取UCall业务类型
        getUcallBusinessType
        } from '@/api/company'
    import {parseTime} from '@/utils'
    // 分页组件，封装了element组件
    import Pagination from '@/components/Pagination'

    export default {
        name: 'Company',
        components: {
            Pagination
        },
        filters: {
            // UCall业务类型
            ucallBusinessTypeFilter(code,mapper){
                return mapper?.find(v=>v.id == code)?.name
            }
        },
        data() {
            return {
                tableKey: 0,
                list: null, total: 0, listLoading: true,
                // 查询条件
                listQuery: {
                    pageNum: 1,
                    pageSize: 10, // 为适应低分辨浏览器，默认每页显示10条
                    // 任务状态
                    companyName: null
                },
                // 新建/编辑窗口
                dialogFormVisible: false,
                dialogStatus: '',
                // 对话框title
                textMap: {
                    update: '编辑业务方',
                    create: '新建业务方'
                },
                // 新建、编辑页面数据绑定
                temp: {
                    // 类型
                    type: null,
                    // 业务方id
                    companyId: undefined,
                    // 业务方名称
                    companyName: '',
                    // 业务方描述
                    companyDesc: '',
                    // UCall业务方类型
                    ucallBusinessTypeId:null,
                    ucallBusinessType:null,
                    // 可选业务类型
                    selectUCallBusiness:[]
                },
                // 表单校验规则
                rules: {
                    // 业务方名称
                    companyName: [
                        {
                            required: true,
                            message: '名称为必填',
                            trigger: 'blur'
                        }
                    ],
                    companyDesc: [
                        {
                            required: true,
                            message: '描述为必填',
                            trigger: 'blur'
                        }
                    ]

                },
                // ucall商业类型码表
                ucallBusinessTypeMapper:[],
                // 显示UCall业务方
                showUCallBusiness:true
            
            }
        },
        created() {
            this.getList()
        },
        mounted() {
            this.getDy()
            // 获取UCall类型码表
            // this.getUCallbusinessType()
        },
        methods: {
            getList() {
                this.listLoading = true

                getList(this.listQuery).then(response => {
                    this.list = response.rows
                    this.total = response.total
                    // 模拟请求延时效果 setTimeout(() => {     this.listLoading = false; }, 2.6 * 1000);
                    this.listLoading = false
                })
            },
            // 获取UCall业务类型
            getUCallbusinessType(id){
                if(id){
                    // 编辑操作
                    getUcallBusinessType({companyId:id}).then(res => {
                        this.temp.selectUCallBusiness = res.data
                    })
                }else{
                    // 页面加载或新增时
                    getUcallBusinessType().then(res=>{
                        this.temp.selectUCallBusiness = res.data
                    })
                }
            },
            // 搜索
            handleFilter() {
                // 跳转到第一页
                this.listQuery.page = 1
                this.getList()
            },
            // 重置表单
            resetTemp() {
                this.temp = {
                    type: null,
                    companyId: undefined,
                    companyName: '',
                    companyDesc: '',
                    ucallBusinessType:null,
                    ucallBusinessTypeId:null,
                    selectUCallBusiness:[]
                }
            },
            // 创建业务方
            async handleCreate() {
                // 重置表单
                this.resetTemp()
                // 先获取可选择的UCall业务类型
                await this.getUCallbusinessType()

                 // 弹窗状态
                        this.dialogStatus = 'create'
                        this.dialogFormVisible = true
                        this.$nextTick(() => {
                            // 创建页面加载时不需要校验
                            this
                                .$refs['dataForm']
                                .clearValidate()
                        })
                
            },
            // 创建
            createData() {
                this
                    .$refs['dataForm']
                    .validate(valid => {
                        // 表单校验与重名校验都通过
                        if (valid) {
                            this.temp.type = 0
                            // 模拟请求，不需要返回结果
                            createOrEdit(this.temp).then((res) => {
                                this.dialogFormVisible = false
                                this.getList()
                                this.$notify({title: '成功', message: res.msg, type: 'success', duration: 2000})
                            })
                        }
                    })
            },
            // 编辑业务方
            handleUpdate(row) {
                // 清空表单
                this.resetTemp()
                // 先获取可选择的UCall业务类型
                getUcallBusinessType({companyId:row.companyId}).then(res => {
                        this.temp = Object.assign({}, row)
                        this.temp.selectUCallBusiness = res.data
                        this.dialogStatus = 'update'
                        this.dialogFormVisible = true
                        console.log(this.temp);
                        debugger

                        this.$nextTick(() => {
                            this
                                .$refs['dataForm']
                                .clearValidate()
                        })
                })
            },
            // 修改
            updateData() {
                this
                    .$refs['dataForm']
                    .validate(valid => {
                        if (valid) {
                            const tempData = Object.assign({}, this.temp, {
                                type:1,
                                // ucallBusinessTypeId:this.temp.ucallBusinessType
                                })
                            console.log(tempData);
                            debugger
                            createOrEdit(tempData).then((res) => {
                                this.getList()
                                this.dialogFormVisible = false
                                this.$notify({title: '成功', message: res.msg, type: 'success', duration: 2000})
                            })
                        }
                    })
            },
            handleDelete(row) {
                deleteOne({companyId:row.companyId}).then(res=>{
                    this.getList()
                    this.$notify({title: '成功', message: res.msg, type: 'success', duration: 2000})
                })
                
            },
            // 重名校验
            nameValidator(name, list) {
                let flag = list.every((curr, index) => (curr.companyName !== name))
                !flag && this.$notify({title: '校验失败', message: "业务方名称不能相同。", type: 'error', duration: 2000})
                return flag
            },
            getDy() {
                const dyHeight = document.body.clientHeight
                if (dyHeight > 768) {
                    this.listQuery.pageSize = 20
                }
            },
            clearBussinessOption(val){
                this.temp.ucallBusinessTypeId = null
            },
            selectChange(val){
                this.temp.ucallBusinessTypeId = val
            }
        }
    }
</script>

<style scoped="scoped">
    /* 随便写的测试样式，可以删除 */
    .meta-item__icon {
        fill: red;
    }

    .blue {
        fill: royalblue;
    }

    .filter-item {
        margin-bottom: 0;
    }

    .filter-container {
        padding-top: 8px;
        padding-bottom: 8px;
    }
</style>