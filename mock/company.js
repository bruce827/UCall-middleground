const Mock = require('mockjs')

const {
    param2Obj
} = require('./utils')
/**
 * 任务日志mock数据
 */
const data = Mock.mock({
    'items|20': [{
        // 业务方id
        companyId: '@id',
        // 创建时间
        createDate: '@date',
        // 任务名称
        companyName: '@ctitle(6, 10)',
        // 任务描述
        companyDesc: '@cparagraph(1)',
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
            console.log(companyName);
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
                code: 20000,
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
            console.log(req.body);
            return {
                code: 20000,
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
            // 获取参数
            // const {
            //     // 业务方id
            //     companyID
            // } = param2Obj(req.url)
            console.log(param2Obj(req.url));

            return {
                code: 20000,
                msg: '删除'+'操作成功',
                success: 0
            }
        }
    },

]
