<template>
    <div>
        <!-- 图片验证弹窗 -->
        <el-dialog :title="tokenDialogTitle+'验证'" :visible.sync="tokenDialogVisible" @close="closeDialog">
            <el-form :model="temp" :rules="rules" label-position="left" label-width="100px" ref="goodsForm" style="max-width: 80%; margin:auto">
                <!-- 账号 -->
                <el-form-item :label="'账户名'" prop="account" >
                    <el-input placeholder="在此输入账号" v-model="temp.account" :disabled="true"/>
                </el-form-item>
                <!-- 验证码图片 -->
                <el-form-item :label="'验证图片'">
                    <img alt="验证码" :src="temp.imgSrc" style="width: 200px; height: 60px;"/>
                    <el-button  @click="getImgData" size="medium" type="text">刷新</el-button>
                </el-form-item>
                    
                <!-- 验证码 -->
                <el-form-item label="验证码" prop="code">
                    <el-input placeholder="在此输入验证码" v-model="temp.code"/>
                </el-form-item>
            </el-form>
            <div class="dialog-footer" slot="footer">
                    <el-button @click="closeDialog">
                        取消
                    </el-button>
                    <el-button @click="handelCommitCode" type="primary">
                        提交
                    </el-button>
            </div>
        </el-dialog>
    </div>
</template>

    <script>
        import {
            /** 
             * 学而思
            */
            // 获取验证码图片
            getAccountToken,
            // 提交验证码
            submitVerification,
            /** 
             * 水滴
            */
            // 获取水滴验证码
            getSDCode,
            // 水滴登录
            submitSDVerification
        } from "@/api/company";

        export default {
            name: 'UpdateTokenFromImg',
            data() {
                return {
                    temp: {
                        account: null,
                        code: null,
                        // 图片编码
                        imgSrc:null,
                    },
                    // 表单验证规则
                    rules: {
                        code: [
                            {
                                required: true,
                                message: "请输入验证码",
                                trigger: "blur"
                            }
                        ]
                    }
                }
            },
            props: {
                // 弹窗可见性
                tokenDialogVisible: {
                    type: Boolean,
                    default: false
                },
                // 弹窗的状态
                tokenDialogTitle: {
                    type: String,
                    default: ""
                },
                // 点击编辑时父级传递的数据
                currentRow: {
                    type: Object
                }

            },
            watch: {
                currentRow: function() {
                    this.getImgData();
                    // 取消校验
                    this.$nextTick(() => {
                            this
                                .$refs
                                .goodsForm
                                .clearValidate()
                    })
                }
            },
            methods: {
                // xrs获取图片验证码
                getImgData(){
                    // 获取验证码图片
                    getAccountToken({sysUserId:this.currentRow.sysUserId}).then(res=>{
                        this.temp = Object.assign({},this.currentRow,{
                            account:this.currentRow.account,
                            imgSrc:res.data.image
                        })
                    })
                },
                // 水滴获取验证码
                getSDCode(){
                    
                },
                // 关闭弹窗
                closeDialog() {
                    this.$emit('update:tokenDialogVisible', false)
                },
                // 提交验证码
                handelCommitCode(){
                    this.$refs.goodsForm.validate(valid => {
                        if(valid){
                            submitVerification({
                                sysUserId:this.currentRow.sysUserId,
                                code:this.temp.code
                            }).then(res=>{
                                this.closeDialog();
                                this.$notify({title: "成功", message: res.msg, type: "success", duration: 2000});
                            })
                        }
                    })
                }
            }
        }
    </script>

    <style></style>