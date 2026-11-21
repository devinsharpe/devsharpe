import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'


// CSRF middleware
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

// Request middleware wraps everything the server handles: SSR documents,
// server functions and server routes. It only ever runs on the server.
const requestLogger = createMiddleware().server(async ({ next, request }) => {
  const id = crypto.randomUUID().slice(0, 8)
  const started = performance.now()
  try {
    return await next()
  } finally {
    const ms = (performance.now() - started).toFixed(0)
    setResponseHeader('x-request-id', id)
    console.log(`[${id}] ${request.method} ${new URL(request.url).pathname} ${ms}ms`)
  }
})

export const startInstance = createStart(() => ({
  requestMiddleware: [requestLogger, csrfMiddleware],
}))
