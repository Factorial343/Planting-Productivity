import { goalProgress, monthRange, msToMinutes, weekRange } from './goalMath';

test('week starts Monday (Fri Nov 20, 2026 -> Mon Nov 16)', () => {
  const r = weekRange(new Date(2026, 10, 20, 15, 30).getTime());
  expect(r.from).toBe(new Date(2026, 10, 16).getTime());
  expect(r.to).toBe(new Date(2026, 10, 23).getTime());
});

test('Sunday belongs to the week that started the previous Monday', () => {
  const r = weekRange(new Date(2026, 10, 22, 9, 0).getTime());
  expect(r.from).toBe(new Date(2026, 10, 16).getTime());
});

test('month range', () => {
  const r = monthRange(new Date(2026, 10, 20).getTime());
  expect(r.from).toBe(new Date(2026, 10, 1).getTime());
  expect(r.to).toBe(new Date(2026, 11, 1).getTime());
});

test('progress is clamped and safe', () => {
  expect(goalProgress(30, 60)).toBe(0.5);
  expect(goalProgress(90, 60)).toBe(1);
  expect(goalProgress(10, 0)).toBe(0);
  expect(msToMinutes(125000)).toBe(2);
});