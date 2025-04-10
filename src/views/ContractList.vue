<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

const contracts = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const router = useRouter()
const selectedContracts = ref([])

// 获取合同列表
const getContracts = async () => {
  try {
    const res = await axios.get(`/api/contracts?page=${currentPage.value}&pageSize=${pageSize.value}`)
    contracts.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    console.error('获取合同列表失败:', error)
  }
}

// 新建合同
const createContract = () => {
  router.push('/create')
}

// 选择变化处理
const handleSelectionChange = (selection) => {
  selectedContracts.value = selection
}

// 删除合同
const deleteContracts = async () => {
  if (selectedContracts.value.length === 0) {
    ElMessage.warning('请选择要删除的合同')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedContracts.value.length} 条合同记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 修改：获取所有选中合同的合同编号
    const contractNos = selectedContracts.value.map(contract => contract.contractNo)
    
    // 修改：发送删除请求，传递合同编号数组
    await axios.delete('/api/contracts', {
      data: { contractNos }
    })

    ElMessage.success('删除成功')
    
    // 重新加载数据
    await getContracts()
    
    // 清空选择
    selectedContracts.value = []
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除合同失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 导入合同
const importContracts = () => {
  // TODO: 实现导入功能
}

// 导出合同
const exportContracts = () => {
  // TODO: 实现导出功能
}

onMounted(() => {
  getContracts()
})
</script>

<template>
  <div class="contract-management">
    <div class="toolbar">
      <el-button type="primary" @click="createContract">新建</el-button>
      <el-button 
        type="danger" 
        @click="deleteContracts"
        :disabled="selectedContracts.length === 0"
      >删除</el-button>
      <el-button @click="importContracts">导入</el-button>
      <el-button @click="exportContracts">导出</el-button>
    </div>
    
    <el-table 
      :data="contracts" 
      border 
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column 
        type="selection" 
        width="55" 
      />
      <el-table-column prop="department" label="部门" width="120" />
      <el-table-column prop="contractNo" label="合同编号" min-width="220" show-overflow-tooltip />
      <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
      <el-table-column prop="handler" label="经办人" width="100" />
      <el-table-column prop="counterparty" label="签订对象" min-width="150" show-overflow-tooltip />
      <el-table-column prop="signDate" label="签订日期" width="120" />
      <el-table-column prop="validPeriod" label="有效期" width="120" />
      <el-table-column prop="amount" label="金额" width="120" />
      <el-table-column prop="amountBeforeTax" label="不含税金额" width="120">
        <template #default="scope">
          {{ scope.row.amountBeforeTax?.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }}
        </template>
      </el-table-column>
      <el-table-column prop="isArchived" label="是否归档" width="100">
        <template #default="scope">
          {{ scope.row.isArchived ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        @current-change="getContracts"
        layout="total, prev, pager, next"
      />
    </div>
  </div>
</template>

<style scoped>
.contract-management {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 