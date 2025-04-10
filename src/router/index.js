import { createRouter, createWebHistory } from 'vue-router'
import ContractList from '../views/ContractList.vue'
import CreateContract from '../views/CreateContract.vue'

const routes = [
  {
    path: '/',
    name: 'ContractList',
    component: ContractList
  },
  {
    path: '/create',
    name: 'CreateContract',
    component: CreateContract
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 