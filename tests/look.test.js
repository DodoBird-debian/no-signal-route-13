import test from 'node:test';
import assert from 'node:assert/strict';
import { stepLook, dragLook } from '../src/look.js';

test('camera input keeps the first-person look within its intended limits', () => {
  const start = { yaw: .9, pitch: -.9 };
  assert.deepEqual(stepLook(start, .3, -.3), { yaw: 1, pitch: -1 });
  assert.deepEqual(start, { yaw: .9, pitch: -.9 });
  assert.deepEqual(stepLook({ yaw: NaN, pitch: NaN }), { yaw: 0, pitch: 0 });
});

test('dragging right and up turns the view in the same direction at different screen sizes', () => {
  const a = dragLook({ yaw: 0, pitch: 0 }, 100, -50, 1000, 500);
  const b = dragLook({ yaw: 0, pitch: 0 }, 50, -25, 500, 250);
  assert.deepEqual(a, b);
  assert.ok(a.yaw > 0 && a.pitch > 0);
  assert.deepEqual(dragLook({ yaw: 0, pitch: 0 }, 10000, -10000, 0, 0), { yaw: 1, pitch: 1 });
});
