export function hasDatabase(): boolean {
  return false;
}

export async function query<T = unknown>(queryString: string, params?: unknown[]): Promise<T[]> {
  return [];
}

export async function execute(queryString: string, params?: unknown[]): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Use Prisma for DB operations' };
}