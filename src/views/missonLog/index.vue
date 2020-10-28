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
      <!-- 任务id，先不展示了 -->
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
      <!-- 操作栏，根据当前行的不同状态显示按钮 -->
      <el-table-column
        :label="'操作栏'"
        align="center"
        width="230"
        class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- 错误日志，如果状态为成功则不显示 -->
          <el-button v-if="scope.row.missionStus != 0" type="primary" size="mini" @click="handleShowError(scope.row.errorLog)">错误日志</el-button>
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
    <el-dialog :visible.sync="dialogPvVisible" title="错误日志">
      <div>
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="errorMsg">
          </el-input>
      </div>
    
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <!-- 错误日志弹窗结束 -->
  </div>
</template>

<script>
// 接口api
import { getList } from '@/api/missonLog'
import { parseTime } from '@/utils'
// 分页组件，封装了element组件
import Pagination from '@/components/Pagination'

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
      // 错误日志弹窗
      dialogPvVisible: false,
      // 错误日志信息
      errorMsg:''
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
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    // 展示错误信息
    handleShowError(msg) {
      this.errorMsg = msg.toString();
      this.dialogPvVisible = !this.dialogPvVisible
    },
    getDy() {
      const dyHeight = document.body.clientHeight
      // 浏览器视窗高度-上方的组件，这里的930是估计值
      if (dyHeight > 930) {
        this.listQuery.pageSize = 20
      }
    }

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
