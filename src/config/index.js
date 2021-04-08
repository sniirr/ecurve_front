const FORCE_PROD = true

let config
if (process.env.NODE_ENV === 'production' || FORCE_PROD) {
    config = require('./config.prod')
}
else {
    config = require('./config.dev')
}

export default config