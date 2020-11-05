const Mock = require('mockjs')

const {
    param2Obj
} = require('./utils')
/** 
 * 所有账户的更新token接口
 * 
*/

module.exports = [
    // xrs获取验证码
    {
        url: '/vue-admin-template/AccountXRS/getToken',
        type: 'post',
        response: (req,res) => {
            console.log(req.body);

            return {
                code: 200,
                msg: '成功',
                data:{
                    // 学而思的图片
                    image: require('./urls').xrsImgUrl
                },
                success: 0
            }
        }
    },
    // xrs提交验证码
    {
        url: '/vue-admin-template/AccountXRS/submitVerification',
        type: 'post',
        response: (req,res) => {
            console.log(req.body);

            return {
                code: 200,
                msg: '验证码发送成功',
                success: 0
            }
        }
    },
    // 京东登录
    {
        url: '/vue-admin-template/AccountJD/login',
        type: 'post',
        response: (req,res) => {
            console.log(req.body);

            return {
                code: 200,
                msg: '验证码发送成功',
                success: 0
            }
        }
    },
    // 水滴获取验证码获取
    {
        url: '/vue-admin-template/AccountSD/getToken',
        type: 'get',
        response: (req,res) => {
            console.log(req.body);

            return {
                code: 200,
                msg: '成功',
                success: 0
            }
        }
    },
    // 水滴登录
    {
        url: '/vue-admin-template/AccountSD/login',
        type: 'post',
        response: (req,res) => {
            console.log(req.body);

            return {
                code: 200,
                msg: '验证码发送成功',
                success: 0
            }
        }
    },
]
