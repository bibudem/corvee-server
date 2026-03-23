import mongoose from 'mongoose'
import config from 'config'

mongoose.connection.on('error', error => {
  console.error('Mongo connection error', error)
})

mongoose.set('strictQuery', false)

export default async function establishDbConnection() {
  console.log('Connecting to MongoDB...')
  try {
    return mongoose
      .connect(config.get('mongodb.url'), {
        dbName: config.get('mongodb.dbName'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('MongoDB connected'))
  } catch (error) {
    console.error('Mongo Connection error: %o', error)
  }
}
