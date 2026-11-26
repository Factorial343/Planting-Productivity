import { initialSessionState, sessionReducer } from './sessionReducer';

describe('session reducer', () => {
  test('starts from idle and ignores repeated starts', () => {
    const started = sessionReducer(initialSessionState, {
      type: 'START',
      at: 1000,
      mode: 'single',
      plannedMs: 60000,
      campusId: 7,
    });

    expect(started.status).toBe('focusing');
    expect(started.startedAt).toBe(1000);
    expect(started.campusId).toBe(7);
    expect(sessionReducer(started, {
      type: 'START',
      at: 2000,
      mode: 'goal',
      plannedMs: 120000,
      campusId: null,
    })).toBe(started);
  });

  test('banks focused time and completes at the planned duration', () => {
    const started = sessionReducer(initialSessionState, {
      type: 'START',
      at: 1000,
      mode: 'single',
      plannedMs: 3000,
      campusId: null,
    });
    const ticked = sessionReducer(started, { type: 'TICK', at: 2000 });
    expect(ticked.focusedMs).toBe(1000);

    const complete = sessionReducer(ticked, { type: 'TICK', at: 4000 });
    expect(complete.status).toBe('ended');
    expect(complete.focusedMs).toBe(3000);
  });

  test('pickup pauses, increments pickup count, and can resume', () => {
    const started = sessionReducer(initialSessionState, {
      type: 'START',
      at: 1000,
      mode: 'single',
      plannedMs: 60000,
      campusId: null,
    });
    const pause = sessionReducer(started, { type: 'PICKUP', at: 5000 });

    expect(pause.status).toBe('paused');
    expect(pause.pauseReason).toBe('pickup');
    expect(pause.pickupCount).toBe(1);
    expect(pause.focusedMs).toBe(4000);

    const resumed = sessionReducer(pause, {
      type: 'PROMPT_ANSWERED',
      at: 6000,
      answer: 'keep_going',
    });
    expect(resumed.status).toBe('focusing');
    expect(resumed.lastTickAt).toBe(6000);
  });

  test('done answer ends a pickup-paused session', () => {
    const paused = sessionReducer({
      ...initialSessionState,
      status: 'paused',
      pauseReason: 'pickup',
      plannedMs: 60000,
      pickupCount: 1,
      lastTickAt: null,
    }, {
      type: 'PROMPT_ANSWERED',
      at: 7000,
      answer: 'done',
    });

    expect(paused.status).toBe('ended');
  });

  test('manual pause and resume do not increment pickup count', () => {
    const started = sessionReducer(initialSessionState, {
      type: 'START',
      at: 1000,
      mode: 'single',
      plannedMs: 60000,
      campusId: null,
    });
    const paused = sessionReducer(started, { type: 'PAUSE', at: 3000 });
    expect(paused.status).toBe('paused');
    expect(paused.pauseReason).toBe('manual');
    expect(paused.pickupCount).toBe(0);

    const resumed = sessionReducer(paused, { type: 'RESUME', at: 4000 });
    expect(resumed.status).toBe('focusing');
  });

  test('ignores ticks and pickups after the session ends', () => {
    const ended = sessionReducer({
      ...initialSessionState,
      status: 'ended',
      focusedMs: 10000,
      plannedMs: 60000,
    }, { type: 'TICK', at: 20000 });
    expect(ended.focusedMs).toBe(10000);

    expect(sessionReducer(ended, { type: 'PICKUP', at: 21000 })).toBe(ended);
  });
});
