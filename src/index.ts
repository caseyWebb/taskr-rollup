const path = require('path')
const { rollup } = require('rollup')

module.exports = function (task) {
  task.plugin('rollup', { every: false }, function* (files, config) {
    if (config.input) {
      throw new Error(`[taskr-rollup] 'input' is not supported. Use taskr.source(<input>)`)
    }
    if (!config.output.file) {
      throw new Error(`[taskr-rollup] 'output.file' is required`)
    }
    if (!config.output.format) {
      throw new Error(`[taskr-rollup] 'output.format' is required`)
    }
    
    const { output: outputConfig, ...inputConfig } = config

    for (const file of files) {
      inputConfig.input = path.format(file)

      const bundle = yield rollup(inputConfig)
      const { code, map } = yield bundle.generate(outputConfig)

      file.data = code
      file.base = outputConfig.file

      this._.files = []

      if (outputConfig.sourcemap && map) {
        if (outputConfig.sourcemap === 'inline') {
          // inline sourcemaps
          file.data += '\n//# sourceMappingURL=data:application/json;base64,'
          file.data += Buffer.from(JSON.stringify(map)).toString('base64')
        } else {
          // external sourcemaps
          file.data += `\n//# sourceMappingURL=${file.base}.map`
          this._.files.push({
            base: `${file.base}.map`,
            dir: file.dir,
            data: Buffer.from(JSON.stringify(map))
          })
        }
      }

      this._.files.push(file)
    }
  })
}