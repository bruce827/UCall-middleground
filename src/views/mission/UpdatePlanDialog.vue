<template>
    <div>
        <!-- 添加/编辑任务弹窗 -->
        <el-dialog title="编辑计划" :visible.sync="visible" @close="closeDialog">
            <!-- 任务表单自定义校验规则 -->
            <el-form 
                :model="goodsFormTemp" 
                :rules="rules" 
                label-position="right" 
                label-width="140px" 
                ref="goodsForm">
                <!-- 任务 -->
                <el-form-item :label="'任务名称'" prop="missionName">
                    <el-input placeholder="在此输入名称" disabled v-model="goodsFormTemp.missionName"/>
                </el-form-item>
                <!-- 执行时间 -->
                <el-form-item :label="'每日执行时间'" prop="planTime">
                    <el-time-picker
                        clearable
                        v-model="goodsFormTemp.planTime"
                        placeholder="请选择执行时间"
                        style="width:100%"
                        >
                    </el-time-picker>
                </el-form-item>
            </el-form>
            <div class="dialog-footer" slot="footer">
                <el-button @click="closeDialog">
                    取消
                </el-button>
                <el-button @click="updateData()" type="primary">
                    确定
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {
        // 编辑计划
        updateOnePlan
    } from "@/api/mission";
    import { parseTime } from "@/utils";
    import moment from "moment"
    export default {
        name: "UpdatePlanDialog",
        data() {
            return {
                visible: this.updatePlanVisible,
                // 执行账户级联选择
                AccountOptions: [],
                // 添加表单模板
                goodsFormTemp: {
                    missionName: "",
                    planTime:""
                },
                // 表单验证规则
                rules: {
                    planTime: [
                        {
                            required: true,
                            message: "请选择执行时间",
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
            updatePlanVisible: {
                type: Boolean,
                default: false
            },
            // 点击编辑时父级传递的数据
            updateGoods: {
                type: Object
            }
        },
        watch: {
            // 只要可见性改变，就会重新刷新表单
            updatePlanVisible: function () {
                // 清空表单
                this.resetGoodsTemp();
                // 切换可见性
                this.visible = this.updatePlanVisible;
                
                this.goodsFormTemp = Object.assign({}, this.updateGoods,{
                });
                console.log(this.goodsFormTemp);
                 // 取消校验
                    this.$nextTick(() => {
                        this
                            .$refs
                            .goodsForm
                            .clearValidate();
                    });
            }
        },
        methods: {
            // 重置表单数据绑定
            resetGoodsTemp() {
                this.goodsFormTemp = {
                    missionName: "",
                    planTime:''
                };
            },
            // 关闭弹窗
            closeDialog() {
                // 关闭弹窗
                this.$emit("update:updatePlanVisible", false);
            },
            // 更新数据
            updateData() {
                this
                    .$refs
                    .goodsForm
                    .validate((valid) => {
                        if (valid) {
                            var tempData = Object.assign({},{
                                missonId:this.goodsFormTemp?.missionId,
                                planTime:moment(this.goodsFormTemp.planTime).format('HH:mm:ss')
                            });
                            updateOnePlan(tempData).then((response) => {
                                console.log(response);
                                this.closeDialog();
                                this.$notify({title: "成功", message: response.msg, type: "success"});
                            });
                        }
                    });
            }
        }
    };
</script>

<style></style>