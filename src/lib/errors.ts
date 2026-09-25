export function reportError(context: string, error: unknown): string {
  const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
  console.error(`[${context}]`, error);
  return message;
}
