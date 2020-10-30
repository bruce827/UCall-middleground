const Mock = require('mockjs')

const {
  param2Obj
} = require('./utils')
/**
 * 任务日志mock数据
 */
const data = Mock.mock({
  'items|50': [{
    // 任务id
    missionId: '@id',
    // 运行时间
    runTime: '@datetime',
    // 任务名称
    missionName: '@ctitle(6, 10)',
    // 任务描述
    missionContent: '@cparagraph(1)',
    // 任务状态
    'missionStus|1':[0,1], 
    // 获取数据量
    dataNum: '@natural(0,1000)',
    // 下次计划时间
    nextRunTime:'@datetime',
    // 错误日志
    errorLog:'{data:"错误的文字..."}'
  }]
})

module.exports = [
  {
    url: '/vue-admin-template/missionLog/list',
    type: 'get',
    response: config => {
        // 获取参数
      const { 
        // 任务类型
        missionStus,
        pageNum = 1, 
        pageSize = 20, 
      } = param2Obj(config.url)
      // 条件过滤
      let mockList = data.items.filter(item => {
        // 任务类型
        if (missionStus && item.missionStus != missionStus) return false
        return true
      })

      // // 排序规则
      // if (sort === '-id') {
      //   mockList = mockList.reverse()
      // }

      // 分页
      const pageList = mockList.filter(
        (item, index) => index < pageSize * pageNum && index >= pageSize * (pageNum - 1)
      )
      
      return {
        code: 200,
        total:mockList.length,
        rows: pageList
      }
    }
  }
]
