<template>
  <div
    :class="{'hidden':hidden}"
    class="pagination-container"
  >
    <el-pagination
      :background="background"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      :layout="layout"
      :total="total"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { scrollTo } from '@/utils/scrollTo'

export default {
  name: 'Pagination',
  props: {
    // 条目总数
    total: {
      required: true,
      type: Number
    },
    // 用于计算当前页数，双向绑定
    page: {
      type: Number,
      default: 1
    },
    // 用于计算每页显示个数选择器，默认20，双向绑定
    limit: {
      type: Number,
      default: 20
    },
    // 默认每页显示条数
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50]
      }
    },
    // 默认展示
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    // 页码默认添加背景色
    background: {
      type: Boolean,
      default: true
    },
    // 每次操作都会自动滚动到顶部
    autoScroll: {
      type: Boolean,
      default: true
    },
    // 可能会有隐藏分页的交互需求，这里预留接口
    hidden: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        // 改变父组件页码
        this.$emit('update:page', val)
      }
    },
    pageSize: {
      get() {
        return this.limit
      },
      set(val) {
        // 改变父组件每页显示条数
        this.$emit('update:limit', val)
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      // 向上传递每页显示个数，并使页面自动返回顶部
      this.$emit('pagination', { page: this.currentPage, limit: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      // 向上传递页码，并使页面自动返回顶部
      this.$emit('pagination', { page: val, limit: this.pageSize })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    }
  }
}
</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding: 32px 16px;
}
.pagination-container.hidden {
  display: none;
}
</style>
