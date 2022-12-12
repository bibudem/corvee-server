import { omit } from 'underscore'
import config from 'config'

const job = JSON.parse(JSON.stringify(config.get('job')))
job.sections = job.sections.map(section => {
  section.sections = section.sections.map(section => omit(section, 'urls'))
  return section
})

export const settingsController = {
  index: async (req, res, next) => {
    res.json(job)
  },
}
