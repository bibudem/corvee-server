import config from 'config'

export async function homeRoutes(req, res, next) {
  const job = JSON.parse(JSON.stringify(config.get('job')))
  res.render('home', {
    title: config.get('app.home.title'),
    currentJob: req.userConfig.getCurrentJob(),
    job,
    jobs: req.jobs,
  })
}
