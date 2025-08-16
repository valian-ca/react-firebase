import { type QueryDocumentSnapshot } from '@firebase/firestore'
import { GeoPoint, Timestamp } from 'firebase/firestore'
import { describe, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { firestoreDataConverter } from '../firestoreDataConverter'

describe('firestoreDataConverter', () => {
  it('preserves Date, GeoPoint, converts Timestamp, and recurses nested structures', () => {
    const now = new Date()
    const point = new GeoPoint(1, 2)
    const ts = Timestamp.fromDate(now)
    const input = {
      date: now,
      point,
      ts,
      str: 's',
      num: 42,
      bool: true,
      nil: null,
      arr: [now, point, ts, 's', 7, false, null],
      nested: { a: now, b: point, c: ts, d: 's', e: 1, f: true, g: null },
    }

    const snapshot = mock<QueryDocumentSnapshot>()
    snapshot.data.mockReturnValue(input)
    const out = firestoreDataConverter(snapshot)

    expect(out.date).toBe(now)
    expect(out.point).toBe(point)
    expect(out.ts).toEqual(now)
    expect(out.arr[0]).toBe(now)
    expect(out.arr[1]).toBe(point)
    expect(out.arr[2]).toEqual(now)
    expect(out.arr[3]).toBe('s')
    expect(out.arr[4]).toBe(7)
    expect(out.arr[5]).toBe(false)
    expect(out.arr[6]).toBeNull()
    expect(out.nested.a).toBe(now)
    expect(out.nested.b).toBe(point)
    expect(out.nested.c).toEqual(now)
    expect(out.nested.d).toBe('s')
    expect(out.nested.e).toBe(1)
    expect(out.nested.f).toBe(true)
    expect(out.nested.g).toBeNull()
    expect(out.num).toBe(42)
    expect(out.bool).toBe(true)
    expect(out.nil).toBeNull()
  })
})
