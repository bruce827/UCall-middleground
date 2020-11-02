<template>
    <div class="app-container">
        <!-- 搜索条件 -->
        <div class="filter-container">
            <!-- 任务id -->
            <el-input 
                @keyup.enter.native="handleFilter" 
                class="filter-item" 
                clearable="clearable" 
                placeholder="回车搜索任务id" 
                style="width: 200px;" 
                v-model.trim="listQuery.missonId"
            />
            <!-- 业务方，筛选table中的业务方，如果账户中没有业务方则不显示 -->
            <el-select 
                :placeholder="'业务方'" 
                class="filter-item" 
                clearable="clearable" 
                style="width: 130px" 
                v-model="listQuery.companyId">
                <el-option 
                    :key="item.code" 
                    :label="item.name" 
                    :value="item.code" 
                    v-for="item in companyNameMapper"
                />
            </el-select>
            <!-- 是否有计划 -->
            <el-select :placeholder="'业务方'" class="filter-item" clearable="clearable" style="width: 130px" v-model="listQuery.missonId">
                <el-option 
                    :key="item.code" 
                    :label="item.name" 
                    :value="item.code" 
                    v-for="item in isPlanStusMapper"
                />
            </el-select>
            <!-- 搜索 -->
            <el-button @click="handleFilter" class="filter-item" icon="el-icon-search" type="primary">搜索</el-button>
        </div>
        <!-- 搜索条件结束 -->
        <!-- 新建 -->
        <el-button @click="handleCreate" class="filter-item" icon="el-icon-plus" type="primary">
            新建
        </el-button>
        <el-button @click="" class="filter-item" icon="el-icon-plus" type="primary">
            批量执行
        </el-button>
        <el-checkbox
            v-model="showMissionId"
            class="filter-item"
            style="margin-left:15px;"
            @change="tableKey=tableKey+1">
            任务id
        </el-checkbox>
        <el-checkbox
            v-model="showCreateDate"
            class="filter-item"
            style="margin-left:15px;"
            @change="tableKey=tableKey+1">
            创建日期
        </el-checkbox>
        <el-checkbox
            v-model="showMissionUrl"
            class="filter-item"
            style="margin-left:15px;"
            @change="tableKey=tableKey+1">
            任务Url
        </el-checkbox>
        <!-- table主体，具备加载等待动画、边框、宽度自适应、高亮当前行等交互 -->
        <el-table 
            :data="list" 
            :key="tableKey" 
            border="border" 
            element-loading-spinner="el-icon-loading" 
            element-loading-text="列表加载中" 
            fit="fit" 
            highlight-current-row="highlight-current-row" 
            style="width: 100%;" 
            v-loading="listLoading"
            @selection-change="handleSelectionChange"
            >
            <!-- 复选框 -->
            <el-table-column type="selection" width="40" align="center"/>
            <!-- 任务编号 -->
            <el-table-column v-if="showMissionId" :label="'任务编号'" align="left" min-width="110px" prop="missionId"/>
            <!-- 创建日期 -->
            <el-table-column v-if="showCreateDate" :label="'创建日期'" align="center" prop="createDate" width="120px"/>
            <!-- 任务名称 -->
            <el-table-column :label="'任务名称'" min-width="100px" prop="missionName"/>
            <!-- url -->
            <el-table-column v-if="showMissionUrl" :label="'任务url'" align="center" prop="missionUrl" min-width="160px"/>
            <!-- 任务描述 -->
            <el-table-column :label="'任务描述'" align="left" prop="missionDesc"/>
            <!-- 业务方 -->
            <el-table-column :label="'业务方'" align="center" prop="company.name" max-width="120px"/>
            <!-- 是否有计划 -->
            <el-table-column label="计划" align="center" width="120px">
                <template slot-scope="scope">
                        {{ scope.row.isPlan | isPlanStusFilter }}
                </template>
            </el-table-column>
            <!-- 执行账户 -->
            <el-table-column :label="'执行账户'" align="center" prop="account" width="160px"/>
            <!-- 操作栏，根据当前行的不同状态显示按钮 -->
            <el-table-column :label="'操作栏'" align="center" class-name="small-padding fixed-width" width="230">
                <template slot-scope="scope">
                    <!-- 编辑按钮 -->
                    <el-button @click="handleUpdate(scope.row)" size="mini" type="primary">编辑</el-button>
                    <!-- 计划 -->
                    <el-button @click="handelUpdatePlan(scope.row)" size="mini" type="primary">计划</el-button>
                    <!-- 确认删除对话框 -->
                    <el-popconfirm @onConfirm="handleDelete(scope.row)" title="删除后不可恢复确定删除吗？">
                        <el-button size="mini" slot="reference">删除</el-button>
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
        <!-- 这里的弹窗较多，所以使用组件 -->
        <!-- 添加或编辑弹窗 -->
        <AddOrEditDialog
            :addFormVisible.sync="addFormVisible"
            :addFormStatus="addFormStatus"
            @fetch="getList"
            @fakeAddGood="fakeAddRow"
            :updateGoods = "currentRow"
            @fakeUpdateGood=""
        />
        <!-- 计划弹窗，由于现在写的计划就是一个玩笑，只能改变任务执行时间，所以将模块抽离出来以便后期维护 -->
        <UpdatePlanDialog
            :updatePlanVisible.sync="palnDialogVisible"
            @fetch="getList"
            :updateGoods = "currentRow"
        />
    </div>
</template>

<script>
    // 接口api
    import {
        // 任务列表 
        getList,
    } from "@/api/mission";
    import {parseTime} from "@/utils";
    // 分页组件，封装了element组件
    import Pagination from "@/components/Pagination";

    // 添加、编辑弹窗
    import AddOrEditDialog from './AddOrEditDialog'
    // 计划弹窗
    import UpdatePlanDialog from './UpdatePlanDialog'
    // 业务码表
    // 账号类型码表
    const accountTypeMapper = [
        {
            key: 0,
            label: "其它",
            value: 1,
            tagType: null
        }, {
            key: 1,
            label: "管理",
            value: 1,
            tagType: "warning"
        }, {
            key: 2,
            label: "坐席",
            value: 2,
            tagType: "info"
        }
    ];
    // 账号状态码表
    const accountStusMapper = [
        {
            key: 0,
            label: "未更新",
            value: 1,
            tagType: "info"
        }, {
            key: 1,
            label: "正常",
            value: 1,
            tagType: ""
        }, {
            key: 2,
            label: "异常",
            value: 3,
            tagType: "danger"
        },
        {
            key: 3,
            label: "任务出错",
            value: 3,
            tagType: "warning"
        }
    ]
    // 是否有计划码表
    const isPlanStusMapper = [
        {
            key: 0,
            label: "是",
            value: 1,
            tagType: ""
        },
        {
            key: 0,
            label: "否",
            value: 1,
            tagType: ""
        }
    ]

    export default {
        name: "Mission",
        components: {
            Pagination,
            AddOrEditDialog,
            UpdatePlanDialog
        },
        filters: {
            // 账户类型文字
            accountTypeFilter(code) {
                return accountTypeMapper[+code]?.label
            },
            // 账户类型样式
            accountTypeTagFilter(code){
                return accountTypeMapper[+code]?.tagType

            },
            // 日期格式化
            dateTimeFilter(datetime){
                return parseTime(datetime,'{y}-{m}-{d}')
            },
            // 任务状态样式
            accountStusTypeFilter(code) {
                return accountStusMapper[+code]?.tagType
            },
            // 任务状态文字
            accountStusFilter(code) {
                return accountStusMapper[+code]?.label
            },
            // 是否有计划
            isPlanStusFilter(code){
                return isPlanStusMapper[+code]?.label
            }

        },
        data() {
            return {
                tableKey: 0, 
                list: [], 
                total: 0, 
                listLoading: true,
                // 显示任务id
                showMissionId:false,
                // 显示创建时间
                showCreateDate:false,
                // 显示Url     
                showMissionUrl:false,
                // 查询条件
                listQuery: {
                    pageNum: 1,
                    pageSize: 10, // 为适应低分辨浏览器，默认每页显示10条
                    // 任务状态
                    missonId: "",
                    // 业务方id
                    companyId: "",
                    // 是否有计划
                    missonId:null
                },
                // 复选框数据
                multipleSelection:[],
                // 显示描述
                showReviewer : false,
                // 新建/编辑窗口
                addFormVisible: false,
                addFormStatus: "",
                // 对话框title
                textMap: {
                    update: "编辑账户",
                    create: "新建账户"
                },
                // 业务方筛选
                dialogCompanyMapper: [],
                // 账户类型选择
                accountTypeMapper:accountTypeMapper,
                // 是否有计划
                isPlanStusMapper:isPlanStusMapper,
                // 新建、编辑页面数据绑定
                temp: {
                    // 系统用户id
                    sysUserId: undefined,
                    // 账号
                    account: "",
                    // 密码
                    password: "",
                    // 账户类型
                    accountType: null,
                    // 业务方id
                    companyId: undefined,
                    // 业务方描述
                    accountDesc: ""
                },
                // 表单校验规则
                rules: {
                    account: [
                        {
                            required: true,
                            message: "名称为必填",
                            trigger: "blur"
                        }
                    ],
                    password: [
                        {
                            required: true,
                            message: "密码为必填",
                            trigger: "blur"
                        }
                    ],
                    accountType: [
                        {
                            required: true,
                            message: "账户类型为必填，如不清楚请选择“其它”",
                            trigger: "blur"
                        }
                    ]
                },
                // 添加计划弹窗
                palnDialogVisible:false,
                // 当前选中任务
                currentRow:null,
                // 计划弹窗
                updatePlanVisible:false,


            };
        },
        computed: {
            // 动态筛选账户的业务方
            companyNameMapper() {
                const mapper = this
                    .list
                    .reduce((total, currentValue, currentIndex, arr) => {
                        let _obj = currentValue?.company;
                        if(!total.some(item=>(item.code == _obj.code))){
                            total.push(_obj)
                        }
                        return total;
                    }, []);
                return mapper;
            }
        },
        created() {
            this.getList();
        },
        mounted() {
            this.getDy();
        },
        methods: {
            getList() {
                this.listLoading = true;
                getList(this.listQuery).then((response) => {
                    this.list = response.rows;
                    this.total = response.total;
                    // 模拟请求延时效果 setTimeout(() => {     this.listLoading = false; }, 2.6 * 1000);
                    this.listLoading = false;
                });
            },
            // 搜索
            handleFilter() {
                // 跳转到第一页
                this.listQuery.pageNum = 1;
                this.getList();
            },
            // 重置表单
            resetTemp() {
                this.temp = {
                    // 系统用户id
                    sysUserId: undefined,
                    // 账号
                    account: "",
                    // 密码
                    password: "",
                    // 账户类型
                    accountType: null,
                    // 业务方id
                    companyId: undefined,
                    // 业务方描述
                    accountDesc: ""
                };
            },
            // 创建业务方
            handleCreate () {
                // 弹窗状态
                this.addFormStatus = "create";
                this.addFormVisible = true;
                // this.$nextTick(() => {
                //     // 创建页面加载时不需要校验
                //     this
                //         .$refs["dataForm"]
                //         .clearValidate();
                // });
            },
            // 编辑业务方
            handleUpdate(row) {
                // 当前数据回显
                this.currentRow = row;
                this.addFormStatus = "update";
                this.addFormVisible = true;
                // this.$nextTick(() => {
                //     this
                //         .$refs["dataForm"]
                //         .clearValidate();
                // });
            },
            // 修改
            updateData() {
                this
                    .$refs["dataForm"]
                    .validate((valid) => {
                        if (valid) {
                            const tempData = Object.assign({}, this.temp, {type: 1});
                            // this.tempData.type = 1
                            createOrEditAccount(tempData).then((res) => {
                                // TODO:联调时候删除
                                for (const v of this.list) {
                                    if (v.companyId === this.temp.companyId) {
                                        const index = this
                                            .list
                                            .indexOf(v);
                                        this
                                            .list
                                            .splice(index, 1, this.temp);
                                        break;
                                    }
                                }
                                // TODO：联调时候打开
                                // this.getList()
                                this.dialogFormVisible = false;
                                this.$notify({title: "成功", message: res.msg, type: "success", duration: 2000});
                            });
                        }
                    });
            },
            handleDelete(row) {
                deleteOneAccount({sysUserId: row.sysUserId}).then((res) => {
                    // TODO:联调时候删除
                    const index = this
                        .list
                        .indexOf(row);
                    this
                        .list
                        .splice(index, 1);

                    // TODO:联调时候打开
                    // this.getList()

                    this.$notify({title: "成功", message: res.msg, type: "success", duration: 2000});
                });
            },
            getDy() {
                const dyHeight = document.body.clientHeight;
                if (dyHeight > 768) {
                    this.listQuery.pageSize = 20;
                }
            },
            // 用于展示账户类型tag
            showAccountTypeTag(code){
                return accountTypeMapper[+code]?.tagType
            },
            // 多选
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 更新验证码图标
            handelUpdatePlan(row){
                this.currentRow = row
                this.palnDialogVisible = true
            },
            // mock数据时的新增方法，联调时可以删除
            fakeAddRow(rowData){
                console.log(rowData);
                this.list.push(rowData)
            },
            // 编辑业务方
            handleUpdate(row) {
                // 当前数据回显
                this.currentRow = row;
                this.updatePlanVisible = true;
            },
        }
    
    };
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