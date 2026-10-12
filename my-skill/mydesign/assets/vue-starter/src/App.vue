<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BusinessDateRange from './components/business/BusinessDateRange.vue'
import ReasonConfirmDialog from './components/business/ReasonConfirmDialog.vue'
import { defaultRange } from './utils/date-rules.mjs'
import { createMaterials } from './mock/materials'

const dateMode = ref('records') // 素材操作记录需要当天；抓取统计请传 crawl。
const range = ref(defaultRange(dateMode.value))
const owner = ref('')
const keyword = ref('')
const page = ref(1)
const state = ref('normal')
const rows = ref(createMaterials())
const selected = ref(null)
const detailOpen = ref(false)
const confirmOpen = ref(false)
const busy = ref(false)
const submitError = ref('')
const failNext = ref(false)
const owners = computed(() => [...new Set(rows.value.filter((row) => !row.blocked).map((row) => row.owner))])
const filtered = computed(() => {
  if (state.value === 'empty' || state.value === 'error') return []
  return rows.value.filter((row) => !row.blocked && row.day >= range.value[0] && row.day <= range.value[1]
    && (!owner.value || row.owner === owner.value) && row.name.includes(keyword.value.trim()))
})
const visible = computed(() => filtered.value.slice((page.value - 1) * 8, page.value * 8))
const complete = computed(() => filtered.value.filter((row) => row.status === '已完成').length)
watch([range, owner, keyword, state], () => { page.value = 1 })
watch(dateMode, () => { range.value = defaultRange(dateMode.value) })
function reset() { owner.value = ''; keyword.value = ''; range.value = defaultRange(dateMode.value); state.value = 'normal' }
function showDetail(row) { selected.value = row; detailOpen.value = true }
function discard(row) { selected.value = row; submitError.value = ''; confirmOpen.value = true }
function demo(command) {
  if (command === 'reset') { rows.value = createMaterials(); failNext.value = false; reset(); return }
  if (command === 'submit-error') { failNext.value = true; ElMessage.info('下一次废弃操作将演示失败'); return }
  state.value = command
}
async function submit(reason) {
  busy.value = true
  submitError.value = ''
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (failNext.value) {
    failNext.value = false
    submitError.value = '暂时无法完成操作，请保留理由后重试。'
  } else {
    selected.value.status = '已废弃'
    selected.value.reason = reason
    confirmOpen.value = false
    ElMessage.success('已废弃该素材')
  }
  busy.value = false
}
const tagType = (status) => ({ 已完成: 'success', 处理中: 'warning', 失败: 'danger', 已废弃: 'info' }[status])
</script>

<template>
  <header class="topbar">
    <div class="brand"><span class="brand-mark"><i class="ri-layout-grid-line" aria-hidden="true" /></span>智创<span class="brand-sub">素材工作台</span></div>
    <span class="topbar-spacer" />
    <el-tag type="info" effect="plain">演示数据</el-tag>
    <el-dropdown @command="demo">
      <el-button text>演示状态<i class="ri-arrow-down-s-line" aria-hidden="true" /></el-button>
      <template #dropdown><el-dropdown-menu>
        <el-dropdown-item command="normal">正常数据</el-dropdown-item>
        <el-dropdown-item command="loading">加载中</el-dropdown-item>
        <el-dropdown-item command="empty">空数据</el-dropdown-item>
        <el-dropdown-item command="error">请求失败</el-dropdown-item>
        <el-dropdown-item command="submit-error">下次提交失败</el-dropdown-item>
        <el-dropdown-item command="reset" divided>重置演示</el-dropdown-item>
      </el-dropdown-menu></template>
    </el-dropdown>
  </header>
  <main class="page">
    <div class="page-heading"><div><p class="eyebrow">素材中心</p><h1>素材管理</h1><p class="muted">查看素材处理状态，筛选并管理团队素材。</p></div></div>
    <section class="data-panel" aria-label="素材列表">
      <div class="toolbar">
        <div class="filter-field"><label>时间口径</label><el-select v-model="dateMode" aria-label="时间口径" style="width: 140px"><el-option label="操作记录（含今天）" value="records" /><el-option label="抓取统计（至昨天）" value="crawl" /></el-select></div>
        <div class="filter-field"><label>日期范围</label><BusinessDateRange v-model="range" :mode="dateMode" /></div>
        <div class="filter-field"><label>负责人</label><el-select v-model="owner" filterable clearable placeholder="全部负责人" aria-label="负责人" style="width: 140px"><el-option v-for="name in owners" :key="name" :label="name" :value="name" /></el-select></div>
        <div class="filter-field search-field"><label>文件名</label><el-input v-model="keyword" clearable placeholder="搜索文件名" aria-label="文件名"><template #prefix><i class="ri-search-line" aria-hidden="true" /></template></el-input></div>
        <el-button @click="reset">重置</el-button>
      </div>
      <div class="list-summary"><span>共 <b>{{ filtered.length }}</b> 个素材<span class="divider">/</span>已完成 {{ complete }} 个</span><span>东八区 · {{ dateMode === 'crawl' ? '数据截至昨天' : '包含当天记录' }}</span></div>
      <div v-if="state === 'loading'" class="state-panel"><el-skeleton :rows="6" animated /></div>
      <el-result v-else-if="state === 'error'" icon="error" title="素材加载失败" sub-title="请重试，已有筛选条件会保留。"><template #extra><el-button type="primary" @click="state = 'normal'">重新加载</el-button></template></el-result>
      <el-table v-else :data="visible" row-key="id" style="width: 100%" max-height="calc(100vh - 370px)">
        <el-table-column prop="name" label="文件名" min-width="235"><template #default="{ row }"><div class="file-cell"><span class="file-icon"><i class="ri-video-line" aria-hidden="true" /></span><div><span class="file-title">{{ row.name }}</span><div class="meta">{{ row.size }} MB · 视频素材</div></div></div></template></el-table-column>
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column prop="day" label="操作日期" width="130" />
        <el-table-column prop="status" label="状态" width="130"><template #default="{ row }"><el-tag :type="tagType(row.status)" effect="light">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="145" align="right"><template #default="{ row }"><el-button text size="small" @click="showDetail(row)">详情</el-button><el-dropdown @command="discard(row)"><el-button text class="icon-button" aria-label="更多操作"><i class="ri-more-line" aria-hidden="true" /></el-button><template #dropdown><el-dropdown-menu><el-dropdown-item command="discard" :disabled="row.status === '已废弃'"><span class="danger-text">废弃素材</span></el-dropdown-item></el-dropdown-menu></template></el-dropdown></template></el-table-column>
        <template #empty><el-empty description="没有符合条件的素材" :image-size="72"><el-button @click="reset">重置筛选</el-button></el-empty></template>
      </el-table>
      <footer class="table-footer"><span class="meta">每页 8 条</span><el-pagination v-model:current-page="page" :page-size="8" :total="filtered.length" layout="prev, pager, next" :disabled="state === 'loading'" /></footer>
    </section>
  </main>
  <el-drawer v-model="detailOpen" title="素材详情" size="420px">
    <el-descriptions v-if="selected" :column="1" border><el-descriptions-item label="文件名">{{ selected.name }}</el-descriptions-item><el-descriptions-item label="负责人">{{ selected.owner }}</el-descriptions-item><el-descriptions-item label="状态">{{ selected.status }}</el-descriptions-item><el-descriptions-item label="操作日期">{{ selected.day }}</el-descriptions-item><el-descriptions-item v-if="selected.reason" label="废弃理由">{{ selected.reason }}</el-descriptions-item></el-descriptions>
  </el-drawer>
  <ReasonConfirmDialog v-model="confirmOpen" title="确认废弃素材" :object-name="selected?.name || ''" :busy="busy" :error="submitError" @confirm="submit" />
</template>
