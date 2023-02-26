import config from 'config'
import { getPagesForSection } from '../../api/models/sections.model.js'

export async function sectionRoute(req, res, next) {
  const section = req.section
  const { hideFixed } = req.userConfig
  const currentJob = req.job
  const deadline = currentJob === req.userConfig.defaultJob ? config.get('job.deadlineFormated') : null

  const preloads = [
    {
      href: `${req.app.locals.baseUrl}api/jobs`,
      as: 'fetch',
      type: 'application/json',
    },
  ]

  try {
    const { pages } = await getPagesForSection({ sectionKey: section.key, job: currentJob })

    res.render('section', {
      route: 'section',
      ...section,
      errorsFound: pages.map(page => page.links).flat().length,
      errorsToFix: pages
        .map(page => page.links)
        .flat()
        .filter(link => link.action === 'to-be-fixed').length,
      pages,
      hideFixed,
      currentJob,
      deadline,
      preloads,
    })
  } catch (error) {
    next(error)
  }
}
