import mongoose from 'mongoose'

const definition = {
  action: {
    type: String,
  },
  browsingContextStack: {
    type: [[String]],
  },
  contentType: {
    type: String,
  },
  extern: {
    type: Boolean,
  },
  errorCodes: {
    type: [String],
  },
  finalUrl: {
    type: String,
  },
  id: {
    type: Number,
  },
  job: {
    type: String,
  },
  messages: {
    type: String,
  },
  parent: {
    type: String,
  },
  sections: {
    type: [String],
  },
  status: {
    type: String,
  },
  text: {
    type: String,
  },
  url: {
    type: String,
  },
  urlData: {
    type: String,
  },
}

const options = {
  timestamp: true,
}

const linksSchema = new mongoose.Schema(definition, options)

export const Link = mongoose.model('Links', linksSchema)
