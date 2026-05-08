/**
 * User IDs with access to debug-only features.
 * Add or remove IDs here to grant/revoke debug access.
 */
export const DEBUG_USER_IDS = new Set([
  '417202c2-5144-4e36-8c72-d8a48324e781',
]);

export const isDebugUser = (userId: string | undefined): boolean =>
  userId !== undefined && DEBUG_USER_IDS.has(userId);
