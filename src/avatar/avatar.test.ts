import { getAvatarStage, getGoalStage, minutesToNextGoalStage, minutesToNextStage } from './avatar';

test('stage boundaries', () => {
  expect(getAvatarStage(0)).toBe(1);
  expect(getAvatarStage(59)).toBe(1);
  expect(getAvatarStage(60)).toBe(2);
  expect(getAvatarStage(599)).toBe(4);
  expect(getAvatarStage(5000)).toBe(5);
});

test('minutes to next stage', () => {
  expect(minutesToNextStage(45)).toBe(15);
  expect(minutesToNextStage(600)).toBeNull();
});

test('goal stage follows progress toward the goal', () => {
  expect(getGoalStage(0, 120)).toBe(1);
  expect(getGoalStage(29, 120)).toBe(1);
  expect(getGoalStage(30, 120)).toBe(2);
  expect(getGoalStage(60, 120)).toBe(3);
  expect(getGoalStage(90, 120)).toBe(4);
  expect(getGoalStage(106, 120)).toBe(4);
  expect(getGoalStage(119, 120)).toBe(4);
  expect(getGoalStage(120, 120)).toBe(5);
  expect(getGoalStage(500, 120)).toBe(5);
  expect(getGoalStage(10, 0)).toBe(1);
});

test('minutes to next goal stage', () => {
  expect(minutesToNextGoalStage(0, 120)).toBe(30);
  expect(minutesToNextGoalStage(106, 120)).toBe(14);
  expect(minutesToNextGoalStage(120, 120)).toBeNull();
  expect(minutesToNextGoalStage(10, 0)).toBeNull();
});