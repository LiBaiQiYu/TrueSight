export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamOptions {
  apiKey: string
  provider?: string
  baseUrl: string
  model: string
  effort?: string
  messages: ChatMessage[]
  sessionId: string
  signal?: AbortSignal
  onDelta: (text: string) => void
  onReasoning?: (text: string) => void
}

export async function streamChat(opts: StreamOptions): Promise<string> {
  const payload: Record<string, unknown> = {
    apiKey: opts.apiKey,
    provider: opts.provider,
    baseUrl: opts.baseUrl || undefined,
    model: opts.model,
    sessionId: opts.sessionId,
    messages: opts.messages
  }
  if (opts.effort) payload.reasoning_effort = opts.effort

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: opts.signal
  })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) message = body.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('text/event-stream')) {
    const text = await res.text()
    throw new Error('上游没有返回流式响应: ' + text.slice(0, 240))
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('无法读取响应流')

  const decoder = new TextDecoder()
  let buffer = ''
  let answer = ''
  let finished = false

  while (!finished) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let index = buffer.indexOf('\n')
    while (index >= 0) {
      const line = buffer.slice(0, index).trim()
      buffer = buffer.slice(index + 1)
      index = buffer.indexOf('\n')
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (!data) continue
      if (data === '[DONE]') {
        finished = true
        break
      }
      try {
        const json = JSON.parse(data) as {
          choices?: Array<{
            delta?: {
              content?: string | null
              reasoning_content?: string | null
              reasoning?: string | null
            }
            message?: {
              content?: string | null
              reasoning_content?: string | null
              reasoning?: string | null
            }
          }>
        }
        const choice = json.choices?.[0]
        const reasoning =
          choice?.delta?.reasoning_content ??
          choice?.delta?.reasoning ??
          choice?.message?.reasoning_content ??
          choice?.message?.reasoning
        if (reasoning) opts.onReasoning?.(reasoning)
        const delta = choice?.delta?.content ?? choice?.message?.content
        if (delta) {
          answer += delta
          opts.onDelta(delta)
        }
      } catch {
        /* 跳过非 JSON 行 */
      }
    }
  }

  if (finished) {
    try {
      await reader.cancel()
    } catch {
      /* ignore */
    }
  }

  return answer
}
