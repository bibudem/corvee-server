import { Link } from '../database/models/index.js'

export async function getJobs() {
  try {
    const jobs = (await Link.find({}).distinct('job').lean().exec()).sort()
    return { jobs }
  } catch (error) {
    throw error
  }
}
