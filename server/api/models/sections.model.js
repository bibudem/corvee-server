import Boom from '@hapi/boom'
import { assert } from '@sindresorhus/is'
import 'core-js/actual/array/group.js'
import { Link } from '../database/models/index.js'
import { sections } from '../lib/sections.js'

function groupLinksByPage(links) {
  const pages = links.group(link => {
    if (Array.isArray(link.browsingContextStack) && link.browsingContextStack.length > 0) {
      return link.browsingContextStack[0][link.browsingContextStack[0].length - 1]
    }
    return link.parent
  })

  return Object.keys(pages)
    .sort()
    .reduce((arr, key) => {
      arr.push({ url: key, links: pages[key] })
      return arr
    }, [])
}

async function countLinksFromSectionKey({ sectionKey, job, filters = {} }) {
  const query = [
    {
      $match: {
        job,
        sections: sectionKey,
        ...filters,
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: 1,
        },
      },
    },
  ]

  const result = await Link.aggregate(query).exec()

  return result.length ? result[0].total : 0
}

async function getLinksFromSectionKey({ sectionKey, job, filters = {} }) {
  const query = {
    job,
    sections: sectionKey,
    ...filters,
  }

  return await Link.find(query).lean().exec()
}

export async function getPagesForSection({ sectionKey, job, filters = {} }) {
  assert.string(job)

  const links = await getLinksFromSectionKey({ sectionKey, job, filters })
  const pages = groupLinksByPage(links)

  return { total: pages.length, pages }
}

export async function countLinksForSection({ sectionKey, job, filters = {} }) {
  console.log('sectionKey: ', sectionKey, ', job: ', job)
  assert.string(job)

  if (sectionKey) {
    if (!sections.has(sectionKey)) {
      return Boom.badData(`Unknown section param: ${sectionKey}`)
    }

    try {
      const count = await countLinksFromSectionKey({ sectionKey, job, filters })
      return { [sectionKey]: count }
    } catch (error) {
      return error
    }
  }

  const count = {}
  for (const sectionKey of sections.keys()) {
    count[sectionKey] = await countLinksFromSectionKey({ sectionKey, job, filters })
  }

  return count
}
