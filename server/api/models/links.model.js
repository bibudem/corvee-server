import { inspect } from 'node:util'
import { Link } from '../database/models/index.js'

export async function getByParent({ parent, job }) {
  try {
    console.log('getByParent - parent: %s, job: %s', parent, job)
    const reports = await Link.find({ parent, job }).lean().exec()
    return { total: reports.length, reports }
  } catch (error) {
    console.error(`Error finding link by parent: ${parent}\n${error}`)
    return error
  }
}

export async function update({ _id, data }) {
  try {
    const result = await Link.findOneAndUpdate({ _id }, data, { new: true })
    return result
  } catch (error) {
    console.error(`Error updating link ${_id}: ${error}`)
    return error
  }
}
