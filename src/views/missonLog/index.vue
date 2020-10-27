<template>
  <div class="app-container">
    <!-- 搜索条件 -->
    <div class="filter-container">
      <!-- 类型 -->
      <el-select
        v-model="listQuery.missionStus"
        :placeholder="'任务状态'"
        clearable
        class="filter-item"
        style="width: 130px">
        <el-option
          v-for="item in missionStusMapper"
          :key="item.value"
          :label="item.label"
          :value="item.value"/>
      </el-select>
      <!-- 搜索 -->
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter">搜索</el-button>
    </div>
    <!-- 搜索条件结束 -->

    <!-- table主体，具备加载等待动画、边框、宽度自适应、高亮当前行等交互 -->
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      element-loading-text="列表加载中"
      element-loading-spinner="el-icon-loading"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <!-- 序号 -->
      <el-table-column :label="'#'" type="index" align="center" width="65"/>
      <!-- 运行时间 -->
      <el-table-column :label="'运行时间'" width="150px" align="center">
        <!-- 过滤日期格式 -->
        <template slot-scope="scope">
          <span>{{ scope.row.runTime | dateTimeFilter}}</span>
        </template>
      </el-table-column>
      <!-- 任务id -->
      <!-- <el-table-column :label="'任务id'" min-width="80px" prop="missionId">
      </el-table-column> -->
      <!-- 任务名称 -->
      <el-table-column
        :label="'任务名称'"
        min-width="110px"
        align="center"
        prop="missionName"/>

      <!-- 任务描述 -->
      <el-table-column :label="'任务描述'" min-width="180px" prop="missionContent"/>
      <!-- 获取数据量 -->
      <el-table-column :label="'获取数据量'" align="center" width="95" prop="dataNum"/>
      <!-- 运行状态 -->
      <el-table-column
        :label="'运行状态'"
        class-name="status-col"
        width="80">
        <!-- 根据不同的状态改变tag的样式，且提示显示中文 -->
        <template slot-scope="scope">
          <el-tag :type="scope.row.missionStus | statusFilter">{{ scope.row.missionStus | statusMsgFilter }}</el-tag>
        </template>
      </el-table-column>
      <!-- 下次计划运行时间 -->
      <el-table-column :label="'下次计划运行时间'" width="180px" align="center">
        <!-- 过滤日期格式 -->
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.nextRunTime | dateTimeFilter }}</span>
        </template>
      </el-table-column>
      中台
      <!-- 操作栏，根据当前行的不同状态显示按钮 -->
      <el-table-column
        :label="'操作栏'"
        align="center"
        width="230"
        class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- 错误日志 -->
          <el-button v-if="scope.row.missionStus != 0" type="primary" size="mini" @click="handleUpdate(scope.row)">错误日志</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- table主体结束 -->
    <!-- 分页组件，如果没有数据默认不显示，如果显示器高度大于1000px则默认每页显示20条
        这里封装了el-pagination，具体配置项可以查看组件的注释，很多非常规需求在这里没有列出
        -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"/>
    <!-- 错误日志弹窗 -->
    <el-dialog :visible.sync="dialogPvVisible" title="阅读设备统计">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="平台"/>
        <el-table-column prop="pv" label="点击量"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <!-- 点击阅读数弹窗结束 -->
  </div>
</template>

<script>
// 接口api
import { getList } from '@/api/missonLog'
import { parseTime } from '@/utils'
// 分页组件，封装了element组件
import Pagination from '@/components/Pagination'

/**
 * 点评输入框验证
 * params:text[string|number]=>输入的内容；callback[fun]：回调
 */
const remarkValidator = (rule, text, callback) => {
  if (!text) {
    callback(new Error('必须输入文字才可以哦'))
  } else {
    callback()
  }
}

export default {
  name: 'MissonLog',
  components: {
    Pagination
  },
  filters: {
    statusFilter(status) {
      /**
       * el-tag标签共支持4种样式，分别是正常、成功、提醒、警告和危险
       * 如果需要自定义样式可在scoped中定义，避免污染全局
       */
      // const statusMap = {
      //   normal: '', // 正常
      //   published: 'success', // 发布
      //   draft: 'info', // 草稿
      //   warning: 'warning', // 警告
      //   deleted: 'danger' // 删除
      // }
      const statusMap = ['published','danger']
      return statusMap[status]
    },
    statusMsgFilter(msg) {
      // const msgMap = {
      //   normal: '',
      //   published: '已发布',
      //   draft: '草稿',
      //   warning: '代办',
      //   deleted: '已废弃'
      // }
      const msgMap = ['成功','失败']
      return msgMap[msg]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    },
    dateTimeFilter(datetime){
      return parseTime(datetime,'{y}-{m}-{d} {h}:{i}')
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      // 查询条件
      listQuery: {
        pageNum: 1,
        pageSize: 10, // 为适应低分辨浏览器，默认每页显示10条
        // 任务状态
        missionStus:null
      },
      // 重要性码表，展现形式为图形，有文字提示
      importanceOptions: [
        {
          value: 1,
          label: '低'
        }, {
          value: 2,
          label: '中'
        }, {
          value: 3,
          label: '高'
        }
      ],
      sortOptions: [
        {
          label: 'ID 升序',
          // key: "+id",
          value: '+id'
        }, {
          label: 'ID 降序',
          // key: "-id",
          value: '-id'

        }
      ],
      statusOptions: [
        'published', 'draft', 'deleted'
      ],
      // 任务状态
      missionStusMapper:[
        {
          value: '0',
          label: '成功'
        }, {
          value: '1',
          label: '失败'
        }
      ],
      showReviewer: false,
      // 新建、编辑页面数据绑定
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        // 类型进行非空校验
        type: [
          {
            // 必填
            required: true,
            // 提示信息
            message: '类型为必填',
            // 更改时候触发
            trigger: 'change'
          }
        ],
        timestamp: [
          {
            type: 'date',
            required: true,
            message: '时间为必填',
            trigger: 'change'
          }
        ],
        title: [
          {
            required: true,
            message: '标题为必填',
            // 失去焦点时候触发
            trigger: 'blur'
          },{
            min:5,
            message:"您输入的标题太短啦",
            trigger:'blur'
          }
        ],
        // 可以添加自定义验证
        remark: [
          {
            validator: remarkValidator, // 自定义验证
            trigger: 'blur'
          }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.getDy()
  },
  methods: {
    getList() {
      this.listLoading = true

      getList(this.listQuery).then(response => {
        // debugger
        console.log(response.rows);
        
        this.list = response.rows
        this.total = response.total

        // 模拟请求延时效果 setTimeout(() => {     this.listLoading = false; }, 2.6 * 1000);
        this.listLoading = false
      })
    },
    handleFilter() {
      // 跳转到第一页
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({ message: '操作成功', type: 'success' })
      row.status = status
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      // 重置表单
      this.resetTemp()
      // 弹窗状态
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.
          $refs['dataForm'].
        // 初始页面不需要进行校验
          clearValidate()
      })
    },
    // 创建
    createData() {
      this.
        $refs['dataForm'].
        validate(valid => {
          if (valid) {
            this.temp.id = parseInt(Math.random() * 100) + Math.pow(100, 2) // 随机生成id
            this.temp.author = '徐健'
            // 模拟请求，不需要返回结果
            createArticle(this.temp).then(() => {
              this.
                list.
                unshift(this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
    },
    // 确认按钮的逻辑
    handleUpdate(row) {
      this.temp = Object.assign({}, row) 
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.
          $refs['dataForm'].
          clearValidate()
      })
    },
    // 修改
    updateData() {
      this.
        $refs['dataForm'].
        validate(valid => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            // 转换为时间戳
            tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
            // 样例数据，同样不需要返回
            updateArticle(tempData).then(() => {
              for (const v of this.list) {
                if (v.id === this.temp.id) {
                  const index = this.
                    list.
                    indexOf(v)
                  this.
                    list.
                    splice(index, 1, this.temp)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({ title: '成功', message: '更新成功', type: 'success', duration: 2000 })
            })
          }
        })
    },
    handleDelete(row) {
      this.$notify({ title: '成功', message: '删除成功', type: 'success', duration: 2000 })
      const index = this.
        list.
        indexOf(row)
      this.
        list.
        splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      // // 应用file-saver实现导出（导入实现方式相同）
      // this.downloadLoading = true
      //           import('@/vendor/Export2Excel').then(excel => {
      //             const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
      //             const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
      //             const data = this.formatJson(filterVal, this.list)
      //             excel.export_json_to_excel({ header: tHeader, data, filename: 'table-list' })
      //             this.downloadLoading = false
      //           })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getDy() {
      const dyHeight = document.body.clientHeight
      // 浏览器视窗高度-上方的组件，这里的930是估计值
      if (dyHeight > 930) {
        this.listQuery.limit = 20
      }
    },

  }
}
</script>

<style scoped>
    /* 随便写的测试样式，可以删除 */
    .meta-item__icon {
        fill: red;
    }
    .blue {
        fill: royalblue;
    }
    .filter-item {
        margin-bottom: 0
    }
    .filter-container {
      padding-top: 8px;
      padding-bottom: 8px;
    }
</style>
