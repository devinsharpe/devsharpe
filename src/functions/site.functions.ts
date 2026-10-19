import { createServerFn } from '@tanstack/react-start'
import { getServerEnv } from '~/server/env.server'

export const getSiteTitle = createServerFn({ method: 'GET' }).handler(
  () => ({ title: getServerEnv().siteTitle, subtitle: getServerEnv().siteSubtitle }),
)
