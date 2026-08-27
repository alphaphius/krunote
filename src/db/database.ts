import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { BootstrapData, DomainMutation } from '../domain/types'
import { decryptJson, deriveDeviceKey, encryptJson, randomSalt, type EncryptedValue } from './crypto'

export type OutboxState = 'QUEUED' | 'SENDING' | 'RETRY_WAIT' | 'CONFLICT' | 'FAILED' | 'CONFIRMED'

export interface StoredOutboxRecord {
  id: string
  entity: string
  action: string
  encryptedPayload: EncryptedValue
  baseVersion: number
  createdAt: string
  attempts: number
  nextAttemptAt: string
  state: OutboxState
  lastError?: string
}

interface SecureRecord { key: string; value: EncryptedValue }
interface SettingRecord { key: string; value: string }

interface KruNoteDb extends DBSchema {
  secure: { key: string; value: SecureRecord }
  outbox: {
    key: string
    value: StoredOutboxRecord
    indexes: { 'by-state': OutboxState; 'by-next-attempt': string }
  }
  settings: { key: string; value: SettingRecord }
}

let databasePromise: Promise<IDBPDatabase<KruNoteDb>> | null = null

function database() {
  if (!databasePromise) {
    databasePromise = openDB<KruNoteDb>('krunote', 1, {
      upgrade(db) {
        db.createObjectStore('secure', { keyPath: 'key' })
        const outbox = db.createObjectStore('outbox', { keyPath: 'id' })
        outbox.createIndex('by-state', 'state')
        outbox.createIndex('by-next-attempt', 'nextAttemptAt')
        db.createObjectStore('settings', { keyPath: 'key' })
      },
    })
  }
  return databasePromise
}

export async function createCryptoSession(pin: string): Promise<CryptoKey> {
  const db = await database()
  let salt = (await db.get('settings', 'offline-salt'))?.value
  if (!salt) {
    salt = randomSalt()
    await db.put('settings', { key: 'offline-salt', value: salt })
  }
  return deriveDeviceKey(pin, salt)
}

export async function saveBootstrap(key: CryptoKey, data: BootstrapData): Promise<void> {
  const db = await database()
  await db.put('secure', { key: 'bootstrap', value: await encryptJson(key, data) })
}

export async function loadBootstrap(key: CryptoKey): Promise<BootstrapData | null> {
  const db = await database()
  const stored = await db.get('secure', 'bootstrap')
  return stored ? decryptJson<BootstrapData>(key, stored.value) : null
}

export async function hasCachedBootstrap(): Promise<boolean> {
  return Boolean(await (await database()).get('secure', 'bootstrap'))
}

export async function queueMutation(key: CryptoKey, mutation: DomainMutation): Promise<StoredOutboxRecord> {
  const db = await database()
  const record: StoredOutboxRecord = {
    id: mutation.id,
    entity: mutation.entity,
    action: mutation.action,
    encryptedPayload: await encryptJson(key, mutation.payload),
    baseVersion: mutation.baseVersion,
    createdAt: mutation.createdAt,
    attempts: 0,
    nextAttemptAt: mutation.createdAt,
    state: 'QUEUED',
  }
  await db.put('outbox', record)
  return record
}

export async function getPendingMutations(key: CryptoKey, limit = 20): Promise<Array<{ stored: StoredOutboxRecord; mutation: DomainMutation }>> {
  const db = await database()
  const records = await db.getAll('outbox')
  const now = new Date().toISOString()
  const pending = records
    .filter((record) => ['QUEUED', 'RETRY_WAIT', 'SENDING'].includes(record.state) && record.nextAttemptAt <= now)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, limit)
  return Promise.all(pending.map(async (stored) => ({
    stored,
    mutation: {
      id: stored.id,
      entity: stored.entity,
      action: stored.action as DomainMutation['action'],
      payload: await decryptJson(key, stored.encryptedPayload),
      baseVersion: stored.baseVersion,
      createdAt: stored.createdAt,
    },
  })))
}

export async function updateOutboxRecord(id: string, patch: Partial<StoredOutboxRecord>): Promise<void> {
  const db = await database()
  const current = await db.get('outbox', id)
  if (current) await db.put('outbox', { ...current, ...patch })
}

export async function recoverSendingMutations(): Promise<void> {
  const db = await database()
  const sending = await db.getAllFromIndex('outbox', 'by-state', 'SENDING')
  const tx = db.transaction('outbox', 'readwrite')
  await Promise.all(sending.map((record) => tx.store.put({ ...record, state: 'RETRY_WAIT', nextAttemptAt: new Date().toISOString(), lastError: 'RECOVERED_AFTER_RESTART' })))
  await tx.done
}

export async function outboxSummary(): Promise<Record<OutboxState, number>> {
  const db = await database()
  const records = await db.getAll('outbox')
  const summary: Record<OutboxState, number> = { QUEUED: 0, SENDING: 0, RETRY_WAIT: 0, CONFLICT: 0, FAILED: 0, CONFIRMED: 0 }
  records.forEach((record) => { summary[record.state] += 1 })
  return summary
}

export async function clearConfirmed(): Promise<void> {
  const db = await database()
  const records = await db.getAllFromIndex('outbox', 'by-state', 'CONFIRMED')
  const tx = db.transaction('outbox', 'readwrite')
  await Promise.all(records.map((record) => tx.store.delete(record.id)))
  await tx.done
}

export async function clearProtectedLocalData(): Promise<void> {
  const db = await database()
  await Promise.all([db.clear('secure'), db.clear('outbox')])
}
