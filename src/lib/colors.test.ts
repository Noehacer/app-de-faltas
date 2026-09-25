import { colorsFor, hueOf } from './colors';

describe('hueOf', () => {
  it('is deterministic for the same id', () => {
    expect(hueOf('abc-123')).toBe(hueOf('abc-123'));
  });

  it('returns a value within [0, 360)', () => {
    for (const id of ['a', 'subject-1', 'un-id-mas-largo']) {
      const h = hueOf(id);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });

  it('differs for different ids (no trivial collisions on common inputs)', () => {
    expect(hueOf('materia-a')).not.toBe(hueOf('materia-b'));
  });
});

describe('colorsFor', () => {
  it('returns different palettes for light and dark mode with the same id', () => {
    const light = colorsFor('subject-1', false);
    const dark = colorsFor('subject-1', true);
    expect(light).not.toEqual(dark);
  });

  it('is deterministic for the same id and mode', () => {
    expect(colorsFor('subject-1', false)).toEqual(colorsFor('subject-1', false));
  });
});
