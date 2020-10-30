import request from '@/utils/request'

const siteUrl = '/vue-admin-template'
// const siteUrl = 'http://192.168.25.139:8081'
// 业务方列表
export function getList(params) {
    return request({
        url: siteUrl+'/company/list',
        // url:'http://192.168.25.139:8081/businessconfig/list',
        method: 'get',
        params
    })
}
// 创建、编辑业务方
export function createOrEdit(params) {
    return request({
        url: siteUrl+'/company/createOrEdit',
        method: 'post',
        data:params
    })
}
// 删除业务方
export function deleteOne(params) {
    return request({
        url: siteUrl+'/company/deleteOne',
        method: 'post',
        data:params
    })
}
// 账户列表
export function getAccountList(params) {
    return request({
        url: siteUrl+'/companyAccount/list',
        method: 'get',
        params
    })
}
// 新建、编辑账户列表
export function createOrEditAccount(params) {
    return request({
        url: siteUrl+'/companyAccount/createOrEdit',
        method: 'post',
        data:params
    })
}
// 删除一个账户
export function deleteOneAccount(params) {
    return request({
        url: siteUrl+'/companyAccount/deleteOne',
        method: 'post',
        data:params
    })
}
// 更新一个账户的token
export function getAccountToken(params) {
    return request({
        url: siteUrl+'/companyAccount/getToken',
        method: 'post',
        data:params
    })
}
// 提交验证码
export function submitVerification(params) {
    return request({
        url: siteUrl+'/companyAccount/submitVerification',
        method: 'post',
        data:params
    })
}