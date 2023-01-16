import mongoose from 'mongoose'

const definition = {
  _from: {
    type: String,
  },
  browsingContextStack: {
    type: [[String]],
  },
  contentLength: {
    type: Number,
  },
  created: {
    type: Date,
  },
  contentType: {
    type: String,
  },
  extern: {
    type: Boolean,
  },
  finalUrl: {
    type: String,
  },
  httpStatusCode: {
    type: Number,
  },
  httpStatusText: {
    type: String,
  },
  id: {
    type: Number,
  },
  isNavigationRequest: {
    type: Boolean,
  },
  job: {
    type: String,
  },
  parent: {
    type: String,
  },
  redirectChain: {
    type: [{ url: String, status: Number, statusText: String }],
  },
  reports: {
    type: [
      {
        code: String,
        level: String,
        message: String,
        name: String,
        stack: String,
      },
    ],
  },
  resourceType: {
    type: String,
  },
  size: {
    type: Number,
  },
  text: {
    type: String,
  },
  timing: {
    type: Number,
  },
  trials: {
    type: Number,
  },
  url: {
    type: String,
  },
  level: {
    type: Number,
  },
  urlData: {
    type: String,
  },
}

const options = {
  timestamp: true,
}

const reportSchema = new mongoose.Schema(definition, options)

export const Report = mongoose.model('Report', reportSchema)
