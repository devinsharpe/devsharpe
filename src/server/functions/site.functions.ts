import { createServerFn } from '@tanstack/react-start'
import { siteSubtitleSchema } from '~/lib/site'
import { getServerEnv } from '~/server/env.server'
import { ensure_auth_middleware } from '~/server/middleware/auth.middleware'
import { site_middleware } from '~/server/middleware/site.middleware'
import type { SiteRepository } from '~/server/repositories/site.repository.server'

/** The saved subtitle, or null if it was never saved or can't be read. */
async function readSavedSubtitle(site: SiteRepository) {
  try {
    return (await site.getSettings())?.subtitle ?? null
  } catch (error) {
    // Every page renders the header, so never fail the page over it (e.g.
    // before `npm run migrate` has created the table).
    console.error('Could not read site settings; using SITE_SUBTITLE.', error)
    return null
  }
}

// The site name comes from server env; the subtitle is edited in the admin
// portal and falls back to SITE_SUBTITLE until it's been saved once.
export const getSiteTitle = createServerFn({ method: 'GET' })
  .middleware([site_middleware])
  .handler(async ({ context }) => {
    const env = getServerEnv()
    return {
      title: env.siteTitle,
      subtitle: (await readSavedSubtitle(context.site)) ?? env.siteSubtitle,
    }
  })

/**
 * Admin: what the header shows (the site name and subtitle), and whether the
 * subtitle is still the SITE_SUBTITLE default.
 */
export const getSubtitleSetting = createServerFn({ method: 'GET' })
  .middleware([ensure_auth_middleware, site_middleware])
  .handler(async ({ context }) => {
    const env = getServerEnv()
    const saved = (await context.site.getSettings())?.subtitle ?? null
    return {
      title: env.siteTitle,
      subtitle: saved ?? env.siteSubtitle,
      is_default: saved === null,
    }
  })

export const updateSiteSubtitle = createServerFn({ method: 'POST' })
  .middleware([ensure_auth_middleware, site_middleware])
  .validator(siteSubtitleSchema)
  .handler(async ({ context, data }) => {
    const settings = await context.site.updateSubtitle(data.subtitle)
    return { subtitle: settings.subtitle ?? '' }
  })
