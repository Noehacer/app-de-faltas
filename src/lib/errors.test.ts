import { reportError } from './errors';

describe('reportError', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns the message of an Error instance', () => {
    const message = reportError('test-context', new Error('algo salió mal'));
    expect(message).toBe('algo salió mal');
  });

  it('returns a generic message for a non-Error value', () => {
    const message = reportError('test-context', 'texto plano');
    expect(message).toBe('Ocurrió un error inesperado.');
  });

  it('logs the context and the original error to the console', () => {
    const error = new Error('boom');
    reportError('my-context', error);
    expect(consoleErrorSpy).toHaveBeenCalledWith('[my-context]', error);
  });
});
