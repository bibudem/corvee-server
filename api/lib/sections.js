import config from 'config'

export const sections = new Set()

config
  .get('job.sections')
  .flatMap(section => section.sections)
  .forEach(section => {
    sections.add(section.key)
  })
