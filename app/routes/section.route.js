import { getPagesForSection } from '../../api/models/sections.model.js'

export async function sectionRoute(req, res, next) {
  const sectionConfig = req.section
  const currentJob = req.userConfig.getCurrentJob()
  const hideFixed = req.userConfig.hideFixed
  try {
    const { pages } = await getPagesForSection({ sectionKey: sectionConfig.key, job: currentJob.job })

    res.render('section', {
      route: 'section',
      ...sectionConfig,
      currentJob,
      errorsFound: pages.map(page => page.links).flat().length,
      errorsToFix: pages
        .map(page => page.links)
        .flat()
        .filter(link => link.action === 'to-be-fixed').length,
      pages,
      jobs: req.jobs,
      hideFixed,
    })
  } catch (error) {
    next(error)
  }
}
