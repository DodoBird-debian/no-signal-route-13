const clamp = value => Math.max(-1, Math.min(1, Number(value) || 0));

export function stepLook(current, yaw = 0, pitch = 0) {
  return { yaw: clamp(current.yaw + yaw), pitch: clamp(current.pitch + pitch) };
}

export function dragLook(start, dx, dy, width, height) {
  return stepLook(start, dx / Math.max(1, width) * 2.8, -dy / Math.max(1, height) * 2.8);
}
