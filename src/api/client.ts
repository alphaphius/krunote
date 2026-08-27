import type { ApiEnvelope, BootstrapData, DomainMutation, SessionInfo } from '../domain/types'

export const API_VERSION = '1.0.0'

export class ApiError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message)
  }
}

export function normalizeEndpoint(value: string): string {
  const url = new URL(value.trim())
  if (url.protocol !== 'https:') throw new ApiError('INVALID_ENDPOINT', 'Web App URL ต้องใช้ HTTPS')
  if (!url.hostname.endsWith('script.google.com')) throw new ApiError('INVALID_ENDPOINT', 'กรุณาใช้ Web App URL จาก Google Apps Script')
  const match = url.pathname.match(/\/macros\/s\/([^/]+)\/(exec|dev)/)
  if (!match) throw new ApiError('INVALID_ENDPOINT', 'Web App URL ต้องลงท้ายด้วย /exec')
  return `${url.origin}/macros/s/${match[1]}/exec`
}

export class ApiClient {
  constructor(public endpoint: string) {}

  private async parse<T>(response: Response): Promise<T> {
    let envelope: ApiEnvelope<T>
    try {
      envelope = await response.json() as ApiEnvelope<T>
    } catch {
      throw new ApiError('UNREADABLE_RESPONSE', 'อ่านคำตอบจาก Apps Script ไม่ได้')
    }
    if (!envelope.ok || !envelope.data) {
      throw new ApiError(envelope.error?.code ?? 'API_ERROR', envelope.error?.message ?? 'Apps Script ตอบกลับด้วยข้อผิดพลาด', envelope.error?.details)
    }
    if (envelope.apiVersion.split('.')[0] !== API_VERSION.split('.')[0]) {
      throw new ApiError('INCOMPATIBLE_API', `API รุ่น ${envelope.apiVersion} ไม่รองรับแอปรุ่น ${API_VERSION}`)
    }
    return envelope.data
  }

  async health(): Promise<{ apiVersion: string; schemaVersion: number; installed: boolean; serverTime: string }> {
    const url = new URL(this.endpoint)
    url.searchParams.set('action', 'health')
    url.searchParams.set('_', String(Date.now()))
    const response = await fetch(url, { method: 'GET', redirect: 'follow', cache: 'no-store' })
    return this.parse(response)
  }

  async request<T>(action: string, payload: unknown = {}, session?: string): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      redirect: 'follow',
      cache: 'no-store',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload, session, clientVersion: API_VERSION, requestId: crypto.randomUUID() }),
    })
    return this.parse<T>(response)
  }

  setup(includeMock: boolean): Promise<{ installed: boolean; mustChangePin: boolean }> {
    return this.request('setup', { initialPin: '1234', includeMock })
  }

  verifyPin(pin: string): Promise<SessionInfo> {
    return this.request('verifyPin', { pin })
  }

  changePin(session: string, currentPin: string, newPin: string): Promise<SessionInfo> {
    return this.request('changePin', { currentPin, newPin }, session)
  }

  bootstrap(session: string): Promise<BootstrapData> {
    return this.request('bootstrap', {}, session)
  }

  syncPush(session: string, mutations: DomainMutation[]): Promise<{ confirmed: string[]; conflicts: Array<{ id: string; current: unknown }>; failed: Array<{ id: string; code: string; message: string }> }> {
    return this.request('syncPush', { mutations }, session)
  }

  syncPull(session: string, cursor: string): Promise<{ cursor: string; changes: Partial<BootstrapData> }> {
    return this.request('syncPull', { cursor }, session)
  }

  requestExport(session: string, payload: unknown): Promise<{ jobId: string; exportRequestId: string }> {
    return this.request('requestExport', payload, session)
  }

  jobStatus(session: string, jobId: string): Promise<{ id: string; status: string; fileUrl?: string; error?: string }> {
    return this.request('jobStatus', { jobId }, session)
  }

  async connectionTest(session?: string): Promise<{ health: boolean; post: boolean; roundTrip: boolean }> {
    await this.health()
    return this.request('connectionTest', {}, session)
  }
}
