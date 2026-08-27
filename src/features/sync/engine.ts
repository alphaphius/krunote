import type { DomainMutation } from '../../domain/types'
import { ApiClient } from '../../api/client'
import {
  clearConfirmed,
  getPendingMutations,
  outboxSummary,
  updateOutboxRecord,
  type OutboxState,
} from '../../db/database'

export type SyncSummary = Record<OutboxState, number>

function nextAttempt(attempts: number): string {
  const base = Math.min(60_000, 1_000 * 2 ** Math.min(attempts, 6))
  const jitter = Math.floor(Math.random() * 700)
  return new Date(Date.now() + base + jitter).toISOString()
}

export async function syncOutbox(
  api: ApiClient,
  session: string,
  key: CryptoKey,
  onSummary?: (summary: SyncSummary) => void,
): Promise<SyncSummary> {
  const pending = await getPendingMutations(key, 20)
  if (!pending.length) return outboxSummary()

  await Promise.all(pending.map(({ stored }) => updateOutboxRecord(stored.id, { state: 'SENDING' })))
  onSummary?.(await outboxSummary())

  try {
    const result = await api.syncPush(session, pending.map(({ mutation }) => mutation))
    await Promise.all(result.confirmed.map((id) => updateOutboxRecord(id, { state: 'CONFIRMED', lastError: undefined })))
    await Promise.all(result.conflicts.map((conflict) => updateOutboxRecord(conflict.id, { state: 'CONFLICT', lastError: JSON.stringify(conflict.current) })))
    await Promise.all(result.failed.map((failure) => updateOutboxRecord(failure.id, { state: 'FAILED', lastError: `${failure.code}:${failure.message}` })))
    await clearConfirmed()
  } catch (error) {
    await Promise.all(pending.map(({ stored }) => {
      const attempts = stored.attempts + 1
      return updateOutboxRecord(stored.id, {
        attempts,
        state: attempts >= 6 ? 'FAILED' : 'RETRY_WAIT',
        nextAttemptAt: nextAttempt(attempts),
        lastError: error instanceof Error ? error.message : 'SYNC_FAILED',
      })
    }))
  }
  const summary = await outboxSummary()
  onSummary?.(summary)
  return summary
}

export function makeMutation<T>(entity: string, action: DomainMutation['action'], payload: T, baseVersion = 0): DomainMutation<T> {
  return { id: crypto.randomUUID(), entity, action, payload, baseVersion, createdAt: new Date().toISOString() }
}
