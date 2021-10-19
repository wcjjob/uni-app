// import { inspect } from './testUtils'

import { compile } from '../src'
import { CompilerOptions } from '../src/options'

function assert(
  template: string,
  templateCode: string,
  renderCode: string,
  options: CompilerOptions = {}
) {
  const res = compile(template, {
    filename: 'foo.vue',
    prefixIdentifiers: true,
    inline: true,
    miniProgram: {
      directive: 'wx:',
      emitFile({ source }) {
        console.log(source)
        // expect(source).toBe(templateCode)
        return ''
      },
    },
    ...options,
  })
  // expect(res.template).toBe(templateCode)
  // expect(res.code).toBe(renderCode)
  // console.log(require('util').inspect(res.code, { colors: true, depth: null }))
  // console.log(require('util').inspect(res, { colors: true, depth: null }))
  console.log(res.code)
  expect(res.code).toBe(renderCode)
}

describe('compiler', () => {
  test('scope', () => {
    assert(
      `<view :style="{ color: \`\${green}px\` }"/>`,
      `<view style="{{'color:' + a}}"/>`,
      `(_ctx, _cache) => {
  return { a: \`\${_ctx.green}px\` }
}`
    )
  })
})