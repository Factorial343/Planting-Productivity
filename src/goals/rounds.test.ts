import {
  canStartAnotherGoal,
  computeRounds,
  MAX_ROUNDS_PER_WEEK,
  type GoalRoundRow,
  type RoundSession,
} from './rounds';

const MIN = 60000;
const WEEK_END = 7 * 24 * 60 * MIN;

function round(over: Partial<GoalRoundRow>): GoalRoundRow {
  return { id: 1, weekStart: 0, startMs: 0, targetMinutes: 120, plant: 'tree', completedAt: null, ...over };
}
const session = (startTime: number, minutes: number): RoundSession => ({
  startTime,
  focusedMs: minutes * MIN,
});

test('one round counts every session in the week', () => {
  const result = computeRounds([round({})], [session(10 * MIN, 30), session(500 * MIN, 76)], WEEK_END);
  expect(result[0].minutes).toBe(106);
  expect(result[0].stage).toBe(4);
  expect(result[0].complete).toBe(false);
});

test('a finished round is complete and at stage 5', () => {
  const result = computeRounds([round({})], [session(0, 120)], WEEK_END);
  expect(result[0].stage).toBe(5);
  expect(result[0].complete).toBe(true);
});

test('a later round only counts sessions after it started', () => {
  const rounds = [
    round({ id: 1 }),
    round({ id: 2, startMs: 1000 * MIN, targetMinutes: 60, plant: 'cactus' }),
  ];
  const sessions = [session(10 * MIN, 120), session(1000 * MIN, 15), session(2000 * MIN, 15)];
  const result = computeRounds(rounds, sessions, WEEK_END);
  expect(result[0].minutes).toBe(120);
  expect(result[1].minutes).toBe(30);
  expect(result[1].number).toBe(2);
  expect(result[1].plant).toBe('cactus');
  expect(result[1].stage).toBe(3);
});

test('another goal can start only when the current one is complete', () => {
  const rounds = [round({})];
  expect(canStartAnotherGoal(computeRounds(rounds, [session(0, 60)], WEEK_END))).toBe(false);
  expect(canStartAnotherGoal(computeRounds(rounds, [session(0, 120)], WEEK_END))).toBe(true);
  expect(canStartAnotherGoal([])).toBe(false);
});

test('no more than the maximum number of goals per week', () => {
  const rounds = Array.from({ length: MAX_ROUNDS_PER_WEEK }, (_, i) =>
    round({ id: i + 1, startMs: i * 10 * MIN, targetMinutes: 5 }),
  );
  const sessions = Array.from({ length: MAX_ROUNDS_PER_WEEK }, (_, i) => session(i * 10 * MIN, 5));
  expect(canStartAnotherGoal(computeRounds(rounds, sessions, WEEK_END))).toBe(false);
});