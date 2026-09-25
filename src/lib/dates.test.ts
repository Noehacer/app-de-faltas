import { addDays, daysAgoIso, mondayOf, shortDateParts, toIso, weekdayOf } from './dates';

describe('toIso', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toIso(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toIso(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('mondayOf', () => {
  it('returns the same date when given a Monday', () => {
    expect(toIso(mondayOf(new Date(2026, 0, 5)))).toBe('2026-01-05');
  });

  it('returns the Monday of the week for a midweek date', () => {
    // 2026-01-08 is a Thursday
    expect(toIso(mondayOf(new Date(2026, 0, 8)))).toBe('2026-01-05');
  });

  it('rolls a Sunday back to the previous Monday', () => {
    // 2026-01-11 is a Sunday
    expect(toIso(mondayOf(new Date(2026, 0, 11)))).toBe('2026-01-05');
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    expect(toIso(addDays(new Date(2026, 0, 5), 3))).toBe('2026-01-08');
  });

  it('subtracts across a month/year boundary with negative days', () => {
    expect(toIso(addDays(new Date(2026, 0, 5), -5))).toBe('2025-12-31');
  });
});

describe('weekdayOf', () => {
  it('returns the JS day-of-week index for an ISO date', () => {
    expect(weekdayOf('2026-01-05')).toBe(1); // lunes
    expect(weekdayOf('2026-01-11')).toBe(0); // domingo
  });
});

describe('daysAgoIso', () => {
  it('matches toIso(addDays(today, -n))', () => {
    expect(daysAgoIso(3)).toBe(toIso(addDays(new Date(), -3)));
    expect(daysAgoIso(0)).toBe(toIso(new Date()));
  });
});

describe('shortDateParts', () => {
  it('splits an ISO date into day and Spanish month abbreviation', () => {
    expect(shortDateParts('2026-03-07')).toEqual({ day: '07', month: 'mar' });
    expect(shortDateParts('2026-12-25')).toEqual({ day: '25', month: 'dic' });
  });
});
