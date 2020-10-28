import request from '@/utils/request'

const siteUrl = '/vue-admin-template'
// 业务方列表
export function getList(params) {
    return request({
        url: siteUrl+'/company/list',
        method: 'get',
        params
    })
}
// 创建、编辑
export function createOrEdit(params) {
    return request({
        url: siteUrl+'/company/createOrEdit',
        method: 'post',
        data:params
    })
}
// 删除
export function deleteOne(params) {
    return request({
        url: siteUrl+'/company/deleteOne',
        method: 'post',
        data:params
    })
}
