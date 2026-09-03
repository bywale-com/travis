/**
 * Neon session-mode pool_size is 15. Each serverless isolate that opens
 * five idle-forever clients burns a third of the account. One client,
 * and it goes back when idle.
 */
export function postgresPoolOptions(): {
  prepare: false;
  max: number;
  idle_timeout: number;
  connect_timeout: number;
  max_lifetime: number;
} {
  return {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 5,
  };
}
