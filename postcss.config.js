import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    autoprefixer(),
    process.env.NODE_ENV === 'production' &&
    cssnano({
      preset: 'advanced',
    }),
  ],
}
