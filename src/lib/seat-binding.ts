/** Env may fill a blank binding. It must not overwrite a live operator/SQL id. */
export function envMayWriteBinding(
  existingId: string | null | undefined,
  envId: string,
): boolean {
  return Boolean(envId.trim()) && !existingId?.trim();
}
