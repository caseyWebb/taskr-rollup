import * as path from 'path'
import { rollup } from 'rollup'

export = function(task): void {
  task.plugin('rollup', { every: false }, function*(entryFiles, config): IterableIterator<Promise<unknown>> {
    if (config.input) {
      throw new Error(
        `[taskr-rollup] 'input' is not supported. Use taskr.source(<input>)`
      )
    }
    if (!config.output.file) {
      throw new Error(`[taskr-rollup] 'output.file' is required`)
    }
    if (!config.output.format) {
      throw new Error(`[taskr-rollup] 'output.format' is required`)
    }

    const { output: outputConfig, ...inputConfig } = config

    this._.files = []

    for (const entryFile of entryFiles) {
      inputConfig.input = path.format(entryFile)

      const bundle = yield rollup(inputConfig)
      const { output } = yield bundle.generate(outputConfig)

      output.forEach((chunkOrAsset) => {
        const f: {
          base: string
          data: string
          dir: string
        } = {
          ...entryFile
        }

        if (chunkOrAsset.isAsset) {
          // @TODO
        } else {
          f.data = chunkOrAsset.code
          f.base = chunkOrAsset.fileName

          if (outputConfig.sourcemap && chunkOrAsset.map) {
            if (outputConfig.sourcemap === 'inline') {
              // inline sourcemaps
              f.data += '\n//# sourceMappingURL=data:application/json;base64,'
              f.data += Buffer.from(JSON.stringify(chunkOrAsset.map)).toString(
                'base64'
              )
            } else {
              // external sourcemaps
              f.data += `\n//# sourceMappingURL=${f.base}.map`
              this._.files.push({
                base: `${f.base}.map`,
                dir: f.dir,
                data: Buffer.from(JSON.stringify(chunkOrAsset.map))
              })
            }
          }

          this._.files.push(f)
        }
      })
    }
  })
}
