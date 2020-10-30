const Mock = require('mockjs')

const {
    param2Obj
} = require('./utils')
/**
 * 业务方数据
 */
const data = Mock.mock({
    'items|50': [{
        // 任务id
        missionId: '@id',
        // 创建时间
        createDate: '@date',
        // 任务名称
        missionName: '@ctitle(6, 10)',
        // 任务描述
        missionDesc: '@cparagraph(1)',
        // 业务方
        company:{
            code:'001',
            name:'测试业务方'
        },
        // 执行账户
        account:'001',
        // 是否有计划
        'isPlan|1':[0,1]

    }]
})

module.exports = [
    // 任务列表
    {
        url: '/vue-admin-template/mission/list',
        type: 'get',
        response: config => {
            // 获取参数
            const {
                // 任务Id
                missonId,
                // 业务方Id
                companyId,
                // 是否有计划
                isPlan,
                pageNum = 1,
                pageSize = 20,
            } = param2Obj(config.url)
            // 条件过滤
            let mockList = data.items.filter(item => {
                // 任务id
                if (missonId && item.missonId != missonId) return false
                // 业务方id
                if (companyId && item.company.companyId != companyId) return false
                // 计划
                if (isPlan && item.isPlan != isPlan) return false

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
    // 新增一个任务
    {
        url: '/vue-admin-template/mission/createOne',
        type: 'post',
        response: (req,res) => {
            // 获取参数
            const {
                missionName,
                sysUserId,
                account,
                missonDesc,
                missonUrl,
            } = req.body
            console.log(req.body);
            return {
                code: 200,
                msg:'新增操作成功',
                success: 0
            }
        }
    },
    // 编辑任务
    {
        url: '/vue-admin-template/mission/update',
        type: 'post',
        response: (req,res) => {
            // 获取参数
            const {
                missonId,
                missionName,
                sysUserId,
                account,
                missonDesc,
                missonUrl,
            } = req.body
            console.log(req.body);
            return {
                code: 200,
                msg:'更新成功',
                success: 0
            }
        }
    },
    // 删除一个任务
    {
        url: '/vue-admin-template/mission/deleteOne',
        type: 'post',
        response: (req,res) => {
            console.log(req.body);

            return {
                code: 200,
                msg: '删除'+'操作成功',
                success: 0
            }
        }
    }
]
