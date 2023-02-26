import config from 'config'

export async function homeRoute(req, res) {
  const sections = JSON.parse(JSON.stringify(config.get('job.sections')))
  const jobParam = req.query.job
  const currentJob = req.job
  const deadline = currentJob === req.userConfig.defaultJob ? config.get('job.deadlineFormated') : null

  const preloads = [
    {
      href: `${req.app.locals.baseUrl}api/sections/count?action=to-be-fixed${jobParam ? `&job=${jobParam}` : ``}`,
      as: 'fetch',
      type: 'application/json',
    },
    {
      href: `${req.app.locals.baseUrl}api/jobs`,
      as: 'fetch',
      type: 'application/json',
    },
  ]

  res.render('home', {
    title: config.get('app.home.title'),
    sections,
    jobs: req.jobs,
    deadline,
    preloads,
  })
}
