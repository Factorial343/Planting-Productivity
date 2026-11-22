import { formatDuration, goalProgress, monthRange, msToMinutes, weekRange } from './goalMath';

test('week starts Sunday (Fri Nov 20, 2026 -> Sun Nov 15)', () => {
  const r = weekRange(new Date(2026, 10, 20, 15, 30).getTime());
  expect(r.from).toBe(new Date(2026, 10, 15).getTime());
  expect(r.to).toBe(new Date(2026, 10, 22).getTime());
});

test('Sunday starts a new week (Sun Nov 22, 2026)', () => {
  const r = weekRange(new Date(2026, 10, 22, 9, 0).getTime());
  expect(r.from).toBe(new Date(2026, 10, 22).getTime());
  expect(r.to).toBe(new Date(2026, 10, 29).getTime());
});

test('Saturday belongs to the week that started the previous Sunday', () => {
  const r = weekRange(new Date(2026, 10, 21, 23, 0).getTime());
  expect(r.from).toBe(new Date(2026, 10, 15).getTime());
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

test('formatDuration', () => {
  expect(formatDuration(0)).toBe('0 min');
  expect(formatDuration(45)).toBe('45 min');
  expect(formatDuration(60)).toBe('1 h');
  expect(formatDuration(135)).toBe('2 h 15 min');
});