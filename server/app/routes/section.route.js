import { getPagesForSection } from '../../api/models/sections.model.js'

export async function sectionRoute(req, res, next) {
  const section = req.section
  const { hideFixed } = req.userConfig
  const currentJob = req.job
  const deadline = currentJob === req.userConfig.currentJob ? req.userConfig.deadline : null

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
      jobs: req.jobs,
      hideFixed,
      currentJob,
      deadline,
    })
  } catch (error) {
    next(error)
  }
}
