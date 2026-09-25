import { supabase } from '@/lib/supabase';

import { attendanceService } from './attendanceService';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

type QueryResult = { data: unknown; error: unknown };

function makeQueryBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {
    select: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    ...result,
  };
  return builder;
}

describe('attendanceService.list', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the records when the query succeeds', async () => {
    const rows = [{ id: '1' }, { id: '2' }];
    const builder = makeQueryBuilder({ data: rows, error: null });
    (supabase.from as jest.Mock).mockReturnValue(builder);

    const result = await attendanceService.list('all');

    expect(supabase.from).toHaveBeenCalledWith('attendance_records');
    expect(result).toEqual(rows);
  });

  it('filters by occurred_on when dateFilter is "today", without a range filter', async () => {
    const builder = makeQueryBuilder({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await attendanceService.list('today');

    expect(builder.eq).toHaveBeenCalledWith('occurred_on', expect.any(String));
    expect(builder.gte).not.toHaveBeenCalled();
  });

  it('filters by a date range when dateFilter is "week"', async () => {
    const builder = makeQueryBuilder({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await attendanceService.list('week');

    expect(builder.gte).toHaveBeenCalledWith('occurred_on', expect.any(String));
    expect(builder.eq).not.toHaveBeenCalled();
  });

  it('throws when the query returns an error', async () => {
    const error = new Error('db down');
    const builder = makeQueryBuilder({ data: null, error });
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await expect(attendanceService.list('all')).rejects.toThrow('db down');
  });
});

describe('attendanceService.create', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const record = {
    occurred_on: '2026-01-05',
    class_period_id: 'p1',
    subject_id: 's1',
    teacher_id: 't1',
    student_id: 'a1',
    reason: null,
  };

  it('inserts the record and resolves when there is no error', async () => {
    const insert = jest.fn(() => Promise.resolve({ error: null }));
    (supabase.from as jest.Mock).mockReturnValue({ insert });

    await attendanceService.create(record);

    expect(insert).toHaveBeenCalledWith(record);
  });

  it('throws when the insert fails', async () => {
    const error = new Error('constraint violation');
    const insert = jest.fn(() => Promise.resolve({ error }));
    (supabase.from as jest.Mock).mockReturnValue({ insert });

    await expect(attendanceService.create(record)).rejects.toThrow('constraint violation');
  });
});
