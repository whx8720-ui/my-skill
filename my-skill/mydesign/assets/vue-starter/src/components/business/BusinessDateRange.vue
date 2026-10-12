<script setup>
import { computed } from 'vue'
import { defaultRange, isDisabledDay } from '../../utils/date-rules.mjs'

const props = defineProps({
  modelValue: { type: Array, required: true },
  mode: { type: String, default: 'crawl', validator: (value) => ['crawl', 'records'].includes(value) },
})
const emit = defineEmits(['update:modelValue'])
const range = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || defaultRange(props.mode)),
})
const disabledDate = (date) => isDisabledDay(date, props.mode)
</script>

<template>
  <el-date-picker
    v-model="range"
    type="daterange"
    format="YYYY-MM-DD"
    value-format="YYYY-MM-DD"
    range-separator="至"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    :clearable="false"
    :disabled-date="disabledDate"
    class="business-date-range"
    popper-class="mydesign-date-popper"
  />
</template>
