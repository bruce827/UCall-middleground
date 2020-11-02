import request from '@/utils/request'

const siteUrl = '/vue-admin-template'
// 任务列表
export function getList(params) {
    return request({
        url: siteUrl+'/mission/list',
        method: 'get',
        params
    })
}
// 创建任务
export function create(params) {
    return request({
        url: siteUrl+'/mission/createOne',
        method: 'post',
        data:params
    })
}
// 编辑任务
export function update(params) {
    return request({
        url: siteUrl+'/mission/update',
        method: 'post',
        data:params
    })
}
// 删除任务
export function deleteOne(params) {
    return request({
        url: siteUrl+'/mission/deleteOne',
        method: 'post',
        data:params
    })
}
// 添加任务计划
export function updateOnePlan(params) {
    return request({
        url: siteUrl+'/mission/updateOnePlan',
        method: 'post',
        data:params
    })
}