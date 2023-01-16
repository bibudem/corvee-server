import config from 'config'

export async function homeRoute(req, res) {
  const sections = JSON.parse(JSON.stringify(config.get('job.sections')))
  const currentJob = req.job
  const deadline = currentJob === req.userConfig.currentJob ? req.userConfig.deadline : null

  res.render('home', {
    title: config.get('app.home.title'),
    sections,
    jobs: req.jobs,
    currentJob,
    deadline,
  })
}
