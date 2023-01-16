import mongoose from 'mongoose'
import config from 'config'

mongoose.connection.on('error', error => {
  console.error('Mongo connection error', error)
})

mongoose.set('strictQuery', false)

export default async function establishDbConnection() {
  try {
    return mongoose.connect(config.get('mongodb.url'), {
      dbName: config.get('mongodb.dbName'),
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  } catch (error) {
    console.error('Mongo Connection Error: %o', error)
  }
}
