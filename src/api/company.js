import request from '@/utils/request'

// const siteUrl = '/vue-admin-template'
const siteUrl = 'http://192.168.25.142:8081/center'
// 模块Url
const modelUrl = '/businessconfig'

// 业务方列表
export function getList(params) {
    return request({
        // url: siteUrl+'/company/list',
        url: siteUrl+modelUrl+'/list',
        method: 'get',
        params
    })
}
// 创建、编辑业务方
export function createOrEdit(params) {
    const {type} = params; 
    // type == 0?add(params):edit(params)
    if(type == 0){
        // 新增
        return add(params)
    }else {
        // 修改
        return edit(params)
    }
}

// 创建
function add(params) {
    return request({
        url: siteUrl+modelUrl+'/add',
        method: 'post',
        data:params
    })
}

// 编辑
function edit(params) {
    return request({
        url: siteUrl+modelUrl+'/edit',
        method: 'put',
        data:params
    })
}

// 删除业务方
export function deleteOne(params) {
    const {companyId} = params
    return request({
        url: siteUrl+modelUrl+'/remove'+'/'+companyId,
        method: 'delete',
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
// 获取UCall业务类型
export function getUcallBusinessType(params) {
    return request({
        // url: siteUrl+'/company/ucallBusinessType',
        url: siteUrl+modelUrl+'/getBusinessTypeList',
        method: 'get',
        params
    })
}