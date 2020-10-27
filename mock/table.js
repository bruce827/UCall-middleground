const Mock = require('mockjs')

const data = Mock.mock({
  'items|30': [{
    id: '@id',
    title: '@sentence(10, 20)',
    'status|1': ['published', 'draft', 'deleted'],
    author: 'name',
    display_time: '@datetime',
    pageviews: '@integer(300, 5000)'
  }]
})

const missonLogData = Mock.mock({
  'items|50': [{
    // 任务id
    missonId: '@id',
    // 运行时间
    runTime: '@datetime',
    // 任务名称
    title: '@sentence(6, 12)',
    // 任务描述
    missionContent: '@paragraph(0,20)',
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
    url: '/vue-admin-template/table/list',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        data: {
          total: items.length,
          items: items
        }
      }
    }
  },
  {
    url: '/vue-admin-template/table/listest',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        data: {
          total: items.length,
          items: items
        }
      }
    }
  },
  // 查询任务日志
  {
    url: '/vue-admin-template/table/asd',
    type: 'get',
    response: config => {
      //   // 获取参数
      // const { 
      //   // 任务类型
      //   missionStus,
      //   pageNum = 1, 
      //   pageSize = 20, 
      // } = param2Obj(config.url)
      // // 条件过滤
      // let mockList = missonLogData.items.filter(item => {
      //   // 任务类型
      //   if (missionStus && item.missionStus !== missionStus) return false
      //   return true
      // })

      // // // 排序规则
      // // if (sort === '-id') {
      // //   mockList = mockList.reverse()
      // // }

      // // 分页
      // const pageList = mockList.filter(
      //   (item, index) => index < pageSize * pageNum && index >= pageSize * (pageNum - 1)
      // )
      
      return {
        code: 20000,
        // total:mockList.length,
        // rows: pageList
        data:123
      }
    }
  }
]
