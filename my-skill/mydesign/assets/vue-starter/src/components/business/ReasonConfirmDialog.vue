<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '确认废弃' },
  objectName: { type: String, required: true },
  impact: { type: String, default: '操作完成后，该记录将标记为已废弃。' },
  confirmText: { type: String, default: '确认废弃' },
  busy: Boolean,
  error: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const formRef = ref()
const form = reactive({ reason: '' })
const open = computed({
  get: () => props.modelValue,
  set: (value) => { if (!props.busy) emit('update:modelValue', value) },
})
const rules = { reason: [{
  validator: (_rule, value, callback) => value.trim() ? callback() : callback(new Error('请填写操作理由')),
  trigger: 'blur',
}] }
watch(() => props.modelValue, (value) => {
  if (value) { form.reason = ''; formRef.value?.clearValidate() }
})
async function confirm() {
  if (props.busy) return
  const valid = await formRef.value.validate().catch(() => false)
  if (valid) emit('confirm', form.reason.trim())
}
</script>

<template>
  <el-dialog v-model="open" :title="title" width="480px" align-center
    :close-on-click-modal="false" :close-on-press-escape="!busy" :show-close="!busy" destroy-on-close>
    <p class="confirm-object">{{ objectName }}</p>
    <p class="muted">{{ impact }}</p>
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="操作理由" prop="reason" required>
        <el-input v-model="form.reason" type="textarea" :rows="3" :disabled="busy" placeholder="请说明本次操作的原因" />
      </el-form-item>
    </el-form>
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
    <template #footer>
      <el-button :disabled="busy" @click="open = false">取消</el-button>
      <el-button type="danger" :loading="busy" :disabled="!form.reason.trim() || busy" @click="confirm">{{ confirmText }}</el-button>
    </template>
  </el-dialog>
</template>
