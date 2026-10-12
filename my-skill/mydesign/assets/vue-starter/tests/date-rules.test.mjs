import test from 'node:test'
import assert from 'node:assert/strict'
import { shanghaiDay, defaultRange, previousRange, isDisabledDay, addDays } from '../src/utils/date-rules.mjs'

test('东八区跨日，与宿主时区无关', () => {
  assert.equal(shanghaiDay(new Date('2026-10-09T15:59:59Z')), '2026-10-09')
  assert.equal(shanghaiDay(new Date('2026-10-09T16:00:00Z')), '2026-10-10')
})
test('抓取统计恰好 14 天，不含今天；实时记录含当天', () => {
  const now = new Date('2026-10-10T10:00:00+08:00')
  assert.deepEqual(defaultRange('crawl', now), ['2026-09-26', '2026-10-09'])
  assert.deepEqual(defaultRange('records', now), ['2026-09-27', '2026-10-10'])
  assert.equal(isDisabledDay(new Date(2026, 9, 10), 'crawl', now), true)
  assert.equal(isDisabledDay(new Date(2026, 9, 10), 'records', now), false)
  assert.equal(isDisabledDay(new Date(2026, 9, 11), 'records', now), true)
})
test('前期等长且不重叠', () => {
  assert.deepEqual(previousRange(['2026-09-26', '2026-10-09']), ['2026-09-12', '2026-09-25'])
  assert.deepEqual(previousRange(['2026-01-01', '2026-01-01']), ['2025-12-31', '2025-12-31'])
})
test('跨年、闰日和无效长度', () => {
  assert.equal(addDays('2024-03-01', -1), '2024-02-29')
  assert.equal(addDays('2026-01-01', -1), '2025-12-31')
  assert.throws(() => defaultRange('crawl', new Date(), 0))
  assert.throws(() => previousRange(['2026-10-10', '2026-10-09']))
})
