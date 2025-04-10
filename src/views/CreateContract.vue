<template>
  <div class="create-contract-container">
    <!-- Left section -->
    <div class="form-section">
      <h2>新建合同</h2>
      <el-form 
        :model="formData" 
        :rules="rules"
        label-width="120px"
        ref="formRef"
      >
        <el-form-item label="部门">
          <el-select v-model="formData.department" placeholder="请选择部门">
            <el-option
              v-for="dept in departments"
              :key="dept"
              :label="dept"
              :value="dept"
            />
          </el-select>
        </el-form-item>
        <el-form-item 
          label="合同编号" 
          prop="contractNo"
          :rules="rules.contractNo"
        >
          <el-input 
            v-model="formData.contractNo" 
            placeholder="系统自动生成"
          />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="formData.title" />
        </el-form-item>
        <el-form-item label="经办人">
          <el-input v-model="formData.handler" />
        </el-form-item>
        <el-form-item label="签订对象">
          <el-input v-model="formData.counterparty" />
        </el-form-item>
        <el-form-item label="签订日期">
          <el-date-picker
            v-model="formData.signDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="有效期">
          <el-input v-model="formData.validPeriod" placeholder="例如：一年/2023-12-31" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number 
            v-model="formData.amount"
            :precision="2"
            :step="0.01"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="不含税金额">
          <el-input-number 
            v-model="formData.amountBeforeTax"
            :precision="2"
            :step="0.01"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="是否归档">
          <el-switch v-model="formData.isArchived" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Right section -->
    <div class="list-section">
      <h2>合同列表</h2>
      <el-table :data="contractList" style="width: 100%">
        <el-table-column prop="contractNo" label="合同编号" min-width="190" show-overflow-tooltip />
        <el-table-column prop="title" label="标题" min-width="120" show-overflow-tooltip />
        <el-table-column prop="handler" label="经办人" width="100" />
        <el-table-column prop="counterparty" label="签订对象" min-width="120" show-overflow-tooltip />
        <el-table-column prop="signDate" label="签订日期" width="100" />
        <!---
        <el-table-column prop="validPeriod" label="有效期" width="120" />
        <el-table-column prop="amount" label="金额" width="100" />
        <el-table-column prop="amountBeforeTax" label="不含税金额" width="120">
          <template #default="scope">
            {{ scope.row.amountBeforeTax?.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }}
          </template>
        </el-table-column>
        <el-table-column prop="isArchived" label="是否归档" width="80">
          <template #default="scope">
            {{ scope.row.isArchived ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="120" show-overflow-tooltip />
        -->
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const departments = [
  '运营管理部',
  '财务部',
  '综合管理部',
  '资源市场部'
]

// 部门代码映射
const departmentCodes = {
  '综合管理部': 'ZH',
  '财务部': 'CW',
  '运营管理部': 'YY',
  '资源市场部': 'ZY'
}

// 合同编号正则表达式
const contractNoPattern = /^GXGAS-\d{4}-(ZH|CW|YY|ZY)-\d{3}$/

const formData = ref({
  department: '',
  contractNo: '',
  title: '',
  handler: '',
  counterparty: '',
  signDate: '',
  validPeriod: '',
  amount: '',
  amountBeforeTax: '',
  isArchived: false,
  remarks: ''
})

// 验证规则
const rules = {
  contractNo: [
    { required: true, message: '请输入合同编号' },
    { pattern: contractNoPattern, message: '合同编号格式不正确，应为 GXGAS-YYYY-XX-NNN 格式' }
  ]
}

const contractList = ref([])

// 生成新的合同编号
const generateContractNo = async (department) => {
  if (!department) return ''
  
  const currentYear = new Date().getFullYear()
  const deptCode = departmentCodes[department]
  
  try {
    // 获取当前部门的所有合同
    const res = await axios.get(`/api/contracts?department=${department}`)
    const contracts = res.data.data
    
    // 找出当前年份该部门的最大序号
    const pattern = new RegExp(`GXGAS-${currentYear}-${deptCode}-(\\d{3})`)
    let maxSeq = 0
    
    contracts.forEach(contract => {
      const match = contract.contractNo.match(pattern)
      if (match) {
        const seq = parseInt(match[1])
        maxSeq = Math.max(maxSeq, seq)
      }
    })
    
    // 生成新序号
    const newSeq = (maxSeq + 1).toString().padStart(3, '0')
    return `GXGAS-${currentYear}-${deptCode}-${newSeq}`
  } catch (error) {
    console.error('生成合同编号失败:', error)
    return ''
  }
}

// 监听部门变化，自动生成合同编号
watch(() => formData.value.department, async (newDepartment) => {
  if (newDepartment) {
    formData.value.contractNo = await generateContractNo(newDepartment)
    
    try {
      const res = await axios.get(`/api/contracts?department=${newDepartment}`)
      const allContracts = res.data.data
      
      contractList.value = allContracts
        .filter(contract => contract.department === newDepartment)
        .sort((a, b) => b.contractNo.localeCompare(a.contractNo))
    } catch (error) {
      console.error('获取合同列表失败:', error)
    }
  }
})

const submitForm = async () => {
  try {
    await axios.post('/api/contracts', formData.value)
    router.push('/')
  } catch (error) {
    console.error('创建合同失败:', error)
  }
}

const cancel = () => {
  router.push('/')
}
</script>

<style scoped>
.create-contract-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.form-section {
  flex: 1;
  min-width: 400px;
  max-width: 800px;
}

.list-section {
  flex: 1;
  padding: 20px;
  border-left: 1px solid #eee;
}
</style>