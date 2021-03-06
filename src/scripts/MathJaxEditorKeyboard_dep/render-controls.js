import { appendElement } from './utils.js'
import { createElement } from './utils.js'


import controlsLayout from './controls-layout'

export default function renderControls($keyboard, editor, mb) {
  const $line = createElement('div', 'mathboard-line mathboard-controls')
  controlsLayout.forEach(key => {
    const $key = createElement('button', 'mathboard-key', {
      _html: `<i class="mathboard-icon mathboard-icon-${key[0]}"></i>`
    })
    $key.addEventListener('click', key[1].bind(null, editor, mb))
    appendElement($line, $key)
  })
  appendElement($keyboard, $line)
}
