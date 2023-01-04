import config from 'config'
import { Link } from '../database/models/index.js'

export async function getJobs() {
  try {
    const jobs = (await Link.find({}).distinct('job').lean().exec()).sort()
    return {
      default: config.get('job.currentJob'),
      jobs,
    }
  } catch (error) {
    throw error
  }
}
