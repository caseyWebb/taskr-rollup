const path = require('path')
const { rollup } = require('rollup')

module.exports = function (task) {
  task.plugin('rollup', { every: false }, function * (files, rollupConfig) {
    const options = parseOptions(rollupConfig)

    const out = []

    for (const file of files) {
      options.input.input = path.format(file)

      const bundle = yield rollup(options.input)
      const res = yield bundle.generate(options.output)

      file.data = res.code

      if (options.output.sourcemap && res.map) {
        if (options.output.sourcemap === 'inline') {
          // inline sourcemaps
          file.data += '\n//# sourceMappingURL=data:application/json;base64,'
          file.data += Buffer.from(JSON.stringify(res.map)).toString('base64')
        } else {
          // external sourcemaps
          const map = file.base + '.map'
          file.data += `\n//# sourceMappingURL=${map}`
          out.push({
            base: map,
            dir: file.dir,
            data: Buffer.from(JSON.stringify(res.map))
          })
        }
      }

      // send to output array
      out.push(file)
    }

    // save changes
    this._.files = out
  })
}

function parseOptions(config) {
  const { output } = config
  const input = Object.assign({}, config) // clone
  delete input.output
  return {
    input: config,
    output
  }
}