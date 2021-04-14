module.exports = {
    configureWebpack: {
      devtool: 'source-map',
      devServer: {
        watchOptions: {
          poll: true
        }
      }
    }
  }