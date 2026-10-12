import { addDays, shanghaiDay } from '../utils/date-rules.mjs'

export function createMaterials(now = new Date()) {
  const today = shanghaiDay(now)
  const owners = ['林悦', '陈晨', '周宁']
  return Array.from({ length: 27 }, (_, index) => ({
    id: index + 1,
    name: `${['夏日冷萃', '产品特写', '户外场景'][index % 3]}_${String(index + 1).padStart(2, '0')}.mp4`,
    owner: owners[index % 3],
    day: addDays(today, -(index % 18)),
    status: ['已完成', '处理中', '失败'][index % 3],
    size: (4 + index * 0.7).toFixed(1),
    blocked: index === 26,
    reason: '',
  }))
}
