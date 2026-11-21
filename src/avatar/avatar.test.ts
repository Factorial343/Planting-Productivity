import { getAvatarStage, minutesToNextStage } from './avatar';

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