<template>
    <div>
        <!-- 添加/编辑任务弹窗 -->
        <el-dialog :title="addFormStatus == 'create'? '新建任务':'编辑任务'" :visible.sync="visible" @close="closeDialog">
            <!-- 任务表单自定义校验规则 -->
            <el-form 
                :model="goodsFormTemp" 
                :rules="rules" 
                label-position="right" 
                label-width="100px" 
                ref="goodsForm">
                <!-- 任务 -->
                <el-form-item :label="'任务名称'" prop="missionName">
                    <el-input placeholder="在此输入名称" v-model="goodsFormTemp.missionName"/>
                </el-form-item>
                <!-- 任务地址 -->
                <el-form-item :label="'任务URL'" prop="missionUrl">
                    <el-input placeholder="在此输入接口URL" v-model="goodsFormTemp.missionUrl"/>
                </el-form-item>
                <!-- 执行账户 -->
                <el-form-item :label="'执行账户'" prop="selectAccount">
                    <el-cascader 
                        :options="AccountOptions" 
                        @change="handleCascaderChange" 
                        v-model="goodsFormTemp.selectAccount"
                        style="width:100%"
                    />
                </el-form-item>
                <!-- 任务描述 -->
                <el-form-item :label="'备注'" prop="missionDesc">
                    <el-input :autosize="{ minRows: 3, maxRows: 4}" placeholder="请在此输入您描述" type="textarea" v-model="goodsFormTemp.missionDesc"/>
                </el-form-item>
            </el-form>
            <div class="dialog-footer" slot="footer">
                <el-button @click="closeDialog">
                    取消
                </el-button>
                <el-button @click="addFormStatus == 'create'?createData():updateData()" type="primary">
                    确定
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {
        // 账户列表
        getAccountList,
        // 业务方列表
        // getList
    } from "@/api/company";
    import {
        // 添加任务
        create,
        // 修改商品
        update
    } from "@/api/mission";
    export default {
        name: "AddOrEditDialog",
        data() {
            return {
                visible: this.addFormVisible,
                // 执行账户级联选择
                AccountOptions: [],
                // 添加表单模板
                goodsFormTemp: {
                    missionName: "",
                    selectAccount: null,
                    sysUserId:'',
                    missionDesc: "",
                    missionUrl:''
                },
                // 表单验证规则
                rules: {
                    missionName: [
                        {
                            required: true,
                            message: "请输入任务名称",
                            trigger: "blur"
                        }
                    ],
                    selectAccount: [
                        {
                            required: true,
                            message: "请选择账户",
                            trigger: "blur"
                        }
                    ]
                },
                // 商品分类级联选择，用于绑定表单中的一级和二级菜单
                cateCascader: {
                    value: [],
                    options: []
                },
                // 商家信息
                businessMapper: [],
                // 用于缓存图片
                dialogImageUrl: "",
                dialogVisible: false,
                // 对已有的图片做数据映射
                fileList: []
            };
        },
        props: {
            // 弹窗可见性
            addFormVisible: {
                type: Boolean,
                default: false
            },
            // 弹窗的状态
            addFormStatus: {
                type: String,
                default: ""
            },
            // 点击编辑时父级传递的数据
            updateGoods: {
                type: Object
            }
        },
        watch: {
            // 只要可见性改变，就会重新刷新表单
            addFormVisible: function () {
                // 切换可见性
                this.visible = this.addFormVisible;
                // 加载表单码表数据
                this.handleCreate();
                // 编辑页面回显数据
                if (this.addFormStatus == "update") {
                    // 如果是编辑需要将数据绑定到表单上
                    this.goodsFormTemp = Object.assign({}, this.updateGoods);
                    // 执行账户级联映射
                    // TODO:mock数据级联数据写死，联调时候删除
                    this.goodsFormTemp.selectAccount = ["650000198607309651","410000200301234912"]
                     // 联调时候放开
                    // this.goodsFormTemp.selectAccount = [this.goodsFormTemp.company?.code,this.goodsFormTemp.account]
                    // 取消校验
                    this.$nextTick(() => {
                        this
                            .$refs
                            .goodsForm
                            .clearValidate();
                    });
                }
            }
        },
        methods: {
            handleCreate() {
                // 重置表单,防止详情或编辑页面的数据有残留
                this.resetGoodsTemp();
                /** 
                 * 重构账户信息数据，使其符合级联菜单。
                 * 原则是不显示没有可用账户的业务方。
                 * 级联选择只关心系统的用户id,由于有默认分页，理论上应该直接获取list的总数再查询一次
                 * 这里为了简便，就直接给了一个后台无法拒绝的数目
                */
                getAccountList({pageSize:500}).then((response) => {
                    var accountData = response.rows;
                    // console.log(accountData);
                    // 将业务方数据进行处理
                    this.AccountOptions = accountData.reduce((acc, cur) => {
                        // 因为账号名可能不唯一，显示的是账号名，传值为系统用户名
                        let _child = {
                            label:cur?.account,
                            value:cur?.sysUserId
                        }
                        let _label = cur?.company.name;
                        let _value = cur?.company.code;
                        
                        // 如果没有相同的业务方则添加
                        if(!acc.some(v => v.value == _value)){
                            acc.push(
                                {
                                    label:_label,
                                    value:_value,
                                    children:[
                                        {
                                            ..._child
                                        }
                                    ]
                                }
                            )
                        }else{
                            for(let i=0;i<acc.length;i++){
                                // 将当前账号插入到指定业务方下
                                if(acc[i].value == _value){
                                    acc[i].children.push(_child)
                                    continue
                                }
                            }
                        }
                        return acc;
                    }, []);
                    // console.log(this.AccountOptions);
                    // debugger
                });
                // 弹窗的dom可能会延迟更新数据，确保在dom加载之后执行
                this.$nextTick(() => {
                    this
                        .$refs
                        .goodsForm
                        .clearValidate();
                });
            },
            // 重置表单数据绑定
            resetGoodsTemp() {
                this.goodsFormTemp = {
                    missionName: "",
                    selectAccount: null,
                    sysUserId:'',
                    missionDesc: "",
                    missionUrl:''
                };
            },
            // 商品类目菜单改变
            handleCascaderChange(value) {
                this.goodsFormTemp.sysUserId = value[1]
            },
            // 新增任务
            createData() {
                this
                    .$refs
                    .goodsForm
                    .validate((valid) => {
                        if (valid) {
                            // 执行新增，为其赋予默认状态
                            var _missionData = {
                                ...this.goodsFormTemp,
                                sysUserId:this.goodsFormTemp?.selectAccount[1]
                            };
                            console.log(_missionData);
                            debugger
                            
                            // 调用请求接口
                            create(_missionData).then((response) => {
                                // 在前台手动模拟一条数据，刷新后消失
                                // TODO：向父级组件传递新增数据，联调时删除
                                this.$emit('fakeAddGood',_missionData)
                                // 关闭弹窗
                                this.closeDialog();
                                // TODO:刷新父级组件,联调时候打开
                                // this.$emit("fetch");
                                // 提示成功
                                this.$notify({title: "成功", message: response.msg, type: "success", duration: 4000});
                            });
                        }
                    });
            },
            // 关闭弹窗
            closeDialog() {
                // 关闭弹窗
                this.$emit("update:addFormVisible", false);
            },
            // 更新数据
            updateData() {
                this
                    .$refs
                    .goodsForm
                    .validate((valid) => {
                        if (valid) {
                            // 复制一份数据
                            var tempData = Object.assign({},this.goodsFormTemp, {
                                sysUserId : this.goodsFormTemp?.selectAccount[1]
                            });
                            // 样例接口，不需要返回
                            update(tempData).then((response) => {
                                this.closeDialog();
                                this.$notify({title: "成功", message: response.msg, type: "success"});
                            });
                        }
                    });
            },
            // 级联改变时触发
            handleCascaderChange(value) {
                console.log(value);
                // debugger
            }
        
        }
    };
</script>

<style></style>