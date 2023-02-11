import { Link } from '../database/models/index.js'
import config from 'config'

export async function getByErrorCodeSummary({ job }) {
  try {
    const result = await Link.aggregate([
      {
        $match: {
          job,
        },
      },
      {
        $unwind: {
          path: '$errorCodes',
        },
      },
      {
        $group: {
          _id: '$errorCodes',
          total: {
            $sum: 1,
          },
          toBeFixed: {
            $sum: {
              $cond: [
                {
                  $eq: ['$action', 'to-be-fixed'],
                },
                1,
                0,
              ],
            },
          },
          fixed: {
            $sum: {
              $cond: [
                {
                  $eq: ['$action', 'fixed'],
                },
                1,
                0,
              ],
            },
          },
          noError: {
            $sum: {
              $cond: [
                {
                  $eq: ['$action', 'no-error'],
                },
                1,
                0,
              ],
            },
          },
          ignore: {
            $sum: {
              $cond: [
                {
                  $eq: ['$action', 'ignore'],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          errorCode: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ])

    return result
  } catch (error) {
    console.error(`Error finding link by parent: ${parent}\n${error}`)
    return error
  }
}

export async function getByErrorCodeDetails({ errorCode, job }) {
  try {
    const results = await Link.aggregate(
      //   [
      //   {
      //     $match: {
      //       job,
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: '$errorCodes',
      //     },
      //   },
      //   {
      //     $match: {
      //       errorCodes: errorCode,
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: '$action',
      //       total: {
      //         $sum: 1,
      //       },
      //       records: {
      //         $addToSet: '$$CURRENT',
      //       },
      //     },
      //   },
      //   {
      //     $addFields: {
      //       action: '$_id',
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       'records.job': 0,
      //       'records.action': 0,
      //       'records.messages': 0,
      //       'records.status': 0,
      //       'records.errorCodes': 0,
      //       'records.linkId': 0,
      //     },
      //   },
      //   {
      //     $sort: {
      //       total: -1,
      //     },
      //   },
      // ]
      [
        {
          $match: {
            job,
          },
        },
        {
          $unwind: {
            path: '$errorCodes',
          },
        },
        {
          $match: {
            errorCodes: errorCode,
          },
        },
        {
          $group: {
            _id: '$action',
            records: {
              $push: {
                url: '$url',
                finalUrl: '$finalUrl',
                context: {
                  $cond: {
                    if: {
                      $isArray: '$browsingContextStack',
                    },
                    then: {
                      $first: {
                        $first: '$browsingContextStack',
                      },
                    },
                    else: '$parent',
                  },
                },
              },
            },
          },
        },
        /**
         * sort records begin
         */
        {
          $unwind: {
            path: '$records',
          },
        },
        {
          $sort: {
            'records.parent': 1,
          },
        },
        {
          $group: {
            _id: '$_id',
            records: {
              $push: '$records',
            },
          },
        },
        /**
         * sort records end
         */
        {
          $unwind: {
            path: '$records',
            includeArrayIndex: 'no',
          },
        },
        {
          $group: {
            _id: '$_id',
            total: {
              $count: {},
            },
            records: {
              $push: {
                no: {
                  $add: ['$no', 1],
                },
                url: '$records.url',
                finalUrl: '$records.finalUrl',
                context: '$records.context',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            action: '$_id',
            total: '$total',
            records: '$records',
          },
        },
      ]
    )

    for (const action of config.get('app.actions')) {
      if (!results.find(result => result.action === action.key)) {
        results.push({ total: 0, action: action.key, records: [] })
      }
    }

    return results
  } catch (error) {
    console.error(error)
    return error
  }
}
