const Mock = require('mockjs')

const {
    param2Obj
} = require('./utils')
/** 
 * UCall业务类型
 * 
*/
const UCallBusinessType = Mock.mock({
    'items|10': [{
        BusinessId:'@id',
        code:'@string',
        name:'@cword(7)'
    }]
})
/**
 * 业务方数据
 */
const data = Mock.mock({
    'items|20': [{
        // 业务方id
        companyId: '@id',
        // 创建时间
        createDate: '@date',
        // 业务方名称
        companyName: '@ctitle(6, 10)',
        // 业务方描述
        companyDesc: '@cparagraph(1)',
        // UCall业务类型,实际接口为1对1绑定
        ucallBusinessType:UCallBusinessType.items[0].code
    }]
})
/**
 * 业务方账户数据
 */
const accountData = Mock.mock({
    'items|20': [{
        // 系统用户id
        sysUserId: '@id',
        // 账号
        account: '@word(8,12)',
        // 账号绑定任务
        missions:'任务一、任务二',
        // 账户类型
        'accountType|1':[0,1,2],
        // 创建时间
        createDate: '@datetime',
        // 最后使用时间
        LastRunTime: '@datetime',
        company: ()=>{
            let _company = data.items[Math.floor(Math.random() * data.items.length)]
            return {
                code:_company.companyId,
                name:_company.companyName
            }
        },
        // 账户状态
        'accountStus|1': [0,1,2,3],
        // 账户描述
        accountDesc:'@csentence()',
        // 密码
        password:"@word()"
    
    }]
})


module.exports = [
    // 业务方列表
    {
        url: '/vue-admin-template/company/list',
        type: 'get',
        response: config => {
            // 获取参数
            const {
                // 业务方名称
                companyName,
                pageNum = 1,
                pageSize = 20,
            } = param2Obj(config.url)
            // 条件过滤
            let mockList = data.items.filter(item => {
                // 业务方名称模糊查询
                if (companyName && item.companyName.indexOf(companyName) < 0) return false
                return true
            })

            // 分页
            const pageList = mockList.filter(
                (item, index) => index < pageSize * pageNum && index >= pageSize * (pageNum - 1)
            )

            return {
                code: 200,
                total: mockList.length,
                rows: pageList
            }
        }
    },
    // 新增/编辑一个业务方
    {
        url: '/vue-admin-template/company/createOrEdit',
        type: 'post',
        response: (req,res) => {
            // 获取参数
            const {
                // 类型
                type
            } = req.body
            return {
                code: 200,
                msg: (type == 0?'新增':'编辑')+'操作成功',
                success: 0
            }
        }
    },
    // 删除一个业务方
    {
        url: '/vue-admin-template/company/deleteOne',
        type: 'post',
        response: (req,res) => {
            console.log(req.body);

            return {
                code: 200,
                msg: '删除'+'操作成功',
                success: 0
            }
        }
    },
    // 账户列表
    {
        url: '/vue-admin-template/companyAccount/list',
        type: 'get',
        response: config => {
            // 获取参数
            const {
                // 账户名
                account,
                // 业务方id
                companyId,
                pageNum = 1,
                pageSize = 20,
            } = param2Obj(config.url)
            
            // 条件过滤
            let mockList = accountData.items.filter(item => {
                // 账户名称模糊查询
                if (account && item.account.indexOf(account) < 0) return false
                // 业务方筛选
                if (companyId && item.company?.code != companyId) return false
                return true
            })

            // 分页
            const pageList = mockList.filter(
                (item, index) => index < pageSize * pageNum && index >= pageSize * (pageNum - 1)
            )

            return {
                code: 200,
                total: mockList.length,
                rows: pageList
            }
        }
    },
    // 新增/编辑一个账户
    {
        url: '/vue-admin-template/companyAccount/createOrEdit',
        type: 'post',
        response: (req,res) => {
            // 获取参数
            const {
                // 类型
                type
            } = req.body
            console.log('新增');
            
            console.log(req.body);
            
            return {
                code: 200,
                msg: (type == 0?'新增':'编辑')+'操作成功',
                success: 0
            }
        }
    },
     // 删除一个业务方
    {
        url: '/vue-admin-template/companyAccount/deleteOne',
        type: 'post',
        response: (req,res) => {
            console.log(req.body);

            return {
                code: 200,
                msg: '删除'+'操作成功',
                success: 0
            }
        }
    },
    // 更新一个账户的token
    {
        url: '/vue-admin-template/companyAccount/getToken',
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
    // 提交验证码
    {
        url: '/vue-admin-template/companyAccount/submitVerification',
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
    // UCall业务类型
    {
        url: '/vue-admin-template/company/ucallBusinessType',
        type: 'get',
        response: config => {
            return {
                code: 200,
                total: UCallBusinessType.items.length,
                rows: UCallBusinessType.items
            }
        }
    },
    
]
