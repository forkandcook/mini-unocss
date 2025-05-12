import { createGenerator, presetUno } from 'unocss'

describe('shortcuts', () => {
  const uno = createGenerator({
    shortcuts: [
      {
        sh1: 'px-2 py-3',
        sh2: 'hover:text-lg text-sm text-lg',
        sh3: 'sm:m-2 m-3',
      },
      [/^button-(\d)$/, ([, d]) => [`px${(+d) * 3}`, `py${(+d) * 2}`]],
    ],
    presets: [
      presetUno(),
    ],
  })

  test('static', async() => {
    const { css } = await uno.generate('sh1 sh2 focus:sh2 sh3')
    expect(css).toMatchSnapshot()
  })

  test('dynamic', async() => {
    const { css } = await uno.generate('button-1 button-2')
    expect(css).toMatchSnapshot()
  })
})
