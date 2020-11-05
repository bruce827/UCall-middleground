<template>
    <div class="app-container">
        <!-- 搜索条件 -->
        <div class="filter-container">
            <!-- 业务方名称搜索，过滤首尾空格 -->
            <el-input @keyup.enter.native="handleFilter" class="filter-item" clearable="clearable" placeholder="回车搜索名称" style="width: 200px;" v-model.trim="listQuery.account"/>
            <!-- 业务方，筛选table中的业务方，如果账户中没有业务方则不显示 -->
            <el-select :placeholder="'业务方'" class="filter-item" clearable="clearable" style="width: 130px" v-model="listQuery.companyId">
                <el-option :key="item.code" :label="item.name" :value="item.code" v-for="item in companyNameMapper"/>
            </el-select>
            <!-- 搜索 -->
            <el-button @click="handleFilter" class="filter-item" icon="el-icon-search" type="primary">搜索</el-button>
        </div>
        <!-- 搜索条件结束 -->
        <!-- 新建 -->
        <el-button @click="handleCreate" class="filter-item" icon="el-icon-plus" type="primary">
            新建
        </el-button>
        <el-checkbox
            v-model="showReviewer"
            class="filter-item"
            style="margin-left:15px;"
            @change="tableKey=tableKey+1">
            账户备注
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
            >
            <!-- 复选框 -->
            <!-- <el-table-column v-show="false" type="selection" width="40" align="center"/> -->
            <!-- 序号,暂时不显示 -->
            <el-table-column :label="'#'" align="center" type="index" v-show="false" width="65"/>
            <!-- 账号 -->
            <el-table-column :label="'账号'" align="left" min-width="110px">
                <template slot-scope="scope">
                    <span @click="handleUpdate(scope.row)" class="link-type">{{ scope.row.account }}</span>
                    <!-- 账户类型，需要传入码表,其它状态不显示标签 -->
                    <el-tag effect="plain" :type="scope.row.accountType | accountTypeTagFilter" v-if="+scope.row.accountType !== 0">
                        {{ scope.row.accountType | accountTypeFilter }}
                    </el-tag>
                </template>
            </el-table-column>
            <!-- 绑定任务 -->
            <el-table-column :label="'绑定任务'" max-width="80px" prop="missions"/>
            <!-- 创建日期 -->
            <el-table-column :label="'创建日期'" align="center" prop="createDate" width="120px">
                <template slot-scope="scope">
                        {{ scope.row.createDate | dateTimeFilter }}
                </template>
            </el-table-column>
            <!-- 最后使用时间 -->
            <el-table-column :label="'最后使用时间'" align="center" prop="LastRunTime" width="160px"/>
            <!-- 账户状态 -->
            <el-table-column :label="'业务方'" align="center" prop="companyName" min-width="120px"/>
            <!-- 账户状态 -->
            <el-table-column label="账户状态" align="center" prop="accountStus" width="120px">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.accountStus | accountStusTypeFilter">
                        {{ scope.row.accountStus | accountStusFilter }}
                    </el-tag>
                </template>
            </el-table-column>
            <!-- 账户描述，看情况是不是要显示 -->
            <el-table-column v-if="showReviewer" :label="'备注'" align="left" prop="accountDesc" width="120px"></el-table-column>
            <!-- 操作栏，根据当前行的不同状态显示按钮 -->
            <el-table-column :label="'操作栏'" align="center" class-name="small-padding fixed-width" width="230">
                <template slot-scope="scope">
                    <!-- 编辑按钮 -->
                    <el-button @click="handleUpdate(scope.row)" size="mini" type="primary">编辑</el-button>
                    <!-- 更新 -->
                    <el-button @click="handelupdateToken(scope.row)" size="mini" type="primary">更新</el-button>
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
        <!-- 添加弹窗 -->
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
            <!-- 自定义表单的校验规则 -->
            <el-form :model="temp" :rules="rules" label-position="right" label-width="100px" ref="dataForm" style="max-width: 80%; margin:auto">
                <!-- 业务方 -->
                <el-form-item :label="'业务方名称'" prop="companyId">
                    <el-select 
                        class="filter-item" 
                        placeholder="请选择业务方" 
                        v-model="temp.companyId"
                        >
                        <el-option 
                            :key="item.value" 
                            :label="item.label" 
                            :value="item.value" 
                            v-for="item in dialogCompanyMapper"/>
                    </el-select>
                </el-form-item>
                <!-- 账户类型 -->
                <el-form-item :label="'账户类型'" prop="accountType">
                    <el-select class="filter-item" placeholder="请选择账户类型" v-model="temp.accountType">
                        <el-option 
                            :key="item.key" 
                            :label="item.label" 
                            :value="item.value" 
                            v-for="item in accountTypeMapper">
                        </el-option>
                    </el-select>
                </el-form-item>
                <!-- 账号 -->
                <el-form-item :label="'账号'" prop="account">
                    <el-input placeholder="在此输入账号" v-model="temp.account"/>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item :label="'密码(明文)'" prop="password">
                    <el-input placeholder="在此输入密码" v-model="temp.password"/>
                </el-form-item>
                <!-- 描述：文本域根据父级容器大小自适应 -->
                <el-form-item :label="'备注'" prop="accountDesc">
                    <el-input :autosize="{ minRows: 2, maxRows: 4}" placeholder="请在此输入您描述" type="textarea" v-model="temp.accountDesc"/>
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
        <!-- 更新token弹窗，由于每个业务的验证方式可能不同，故采用组件形式引入 -->
        <UpdateTokenFromImg
            :tokenDialogVisible.sync="tokenDialogVisible"
            :tokenDialogTitle="tokenDialogTitle"
            @fetch="getList"
            :currentRow = "currentRow"
        />

    </div>
</template>

<script>
    // 接口api
    import {
        // 业务方列表
        getList,
        getAccountList,
        createOrEditAccount,
        deleteOneAccount
    } from "@/api/company";
    import {parseTime} from "@/utils";
    // 分页组件，封装了element组件
    import Pagination from "@/components/Pagination";
    // 图片验证码弹窗
    import UpdateTokenFromImg from "./UpdateTokenFromImg"

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

    export default {
        name: "CompanyAccount",
        components: {
            Pagination,
            UpdateTokenFromImg
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
                return accountStusMapper[+code]?.tagType;
            },
            // 任务状态文字
            accountStusFilter(code) {
                return accountStusMapper[+code]?.label;
            }
        },
        data() {
            return {
                tableKey: 0, list: [], total: 0, listLoading: true,
                // 查询条件
                listQuery: {
                    pageNum: 1,
                    pageSize: 10, // 为适应低分辨浏览器，默认每页显示10条
                    // 任务状态
                    account: "",
                    // 业务方id
                    companyId: ""
                },
                // 复选框数据
                multipleSelection:[],
                // 显示描述
                showReviewer : false,
                // 新建/编辑窗口
                dialogFormVisible: false,
                dialogStatus: "",
                // 对话框title
                textMap: {
                    update: "编辑账户",
                    create: "新建账户"
                },
                // 业务方筛选
                dialogCompanyMapper: [],
                // 账户类型选择
                accountTypeMapper:accountTypeMapper,
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
                    // 业务方名称
                    companyName:undefined,
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
                // 图片验证码弹窗
                tokenDialogVisible:false,
                tokenDialogTitle:'学而思',
                // 当前获取验证码账户
                currentRow:null,

            };
        },
        computed: {
            // 动态筛选账户的业务方
            companyNameMapper() {
                const mapper = this
                    .list
                    .reduce((total, currentValue, currentIndex, arr) => {
                        if(!total.some(item=>(item.code == currentValue.companyId))){
                            total.push({
                                code:currentValue.companyId,
                                name:currentValue.companyName
                            })
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
                getAccountList(this.listQuery).then((response) => {
                    this.list = response.rows;
                    this.total = response.total;
                    console.log(this.list);
                    
                    // 模拟请求延时效果 setTimeout(() => {     this.listLoading = false; }, 2.6 * 1000);
                    this.listLoading = false;
                });
            },
            getCompanyList() {
                getList().then((res) => {
                    // 处理数据
                    const _mapper = [...res.rows];
                    this.dialogCompanyMapper = _mapper.reduce((total, curr) => {
                        total.push({label: curr.companyName, value: curr.companyId});
                        return total;
                    }, []);
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
            async handleCreate () {
                // 重置表单
                await this.resetTemp();
                // 获取业务方选项
                await this.getCompanyList();
                // 弹窗状态
                this.dialogStatus = "create";
                this.dialogFormVisible = true;
                this.$nextTick(() => {
                    // 创建页面加载时不需要校验
                    this
                        .$refs["dataForm"]
                        .clearValidate();
                });
            },
            // 创建
            createData() {
                this
                    .$refs["dataForm"]
                    .validate((valid) => {
                        // 表单校验与重名校验都通过
                        if (valid) {
                            this.temp.type = 0;
                            createOrEditAccount(this.temp).then((res) => {
                                this.dialogFormVisible = false;
                                this.getList()
                                this.$notify({title: "成功", message: res.msg, type: "success", duration: 2000});
                            });
                        }
                    });
            },
            // 编辑业务方
            async handleUpdate(row) {
                // 选项需要映射后单独赋值
                this.temp = Object.assign({}, row,{
                    // 业务方id
                    companyId:row.companyId,
                    // 业务方
                    companyName:row.companyName,
                    // 账户类型
                    accountType:accountTypeMapper[row.accountType]?.label
                });
                // 获取全部业务方列表
                await this.getCompanyList();
                this.dialogStatus = "update";
                this.dialogFormVisible = true;
                this.$nextTick(() => {
                    this
                        .$refs["dataForm"]
                        .clearValidate();
                });
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
                    // const index = this
                    //     .list
                    //     .indexOf(row);
                    // this
                    //     .list
                    //     .splice(index, 1);

                    // TODO:联调时候打开
                    this.getList()

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
            handelupdateToken(row){
                this.currentRow = row
                this.tokenDialogVisible = true
            }
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