import { MathJaxEditor } from './editor.js'
import { appendElement } from './utils.js'
import { createElement } from './utils.js'


import { appendElementAfter } from './utils.js'
import { addClass } from './utils.js'  
import { hideElement } from './utils.js'  
import { listenElement } from './utils.js' 
import { px } from './utils.js' 
import { removeClass } from './utils.js' 
import { removeElement } from './utils.js'
import { showElement } from './utils.js' 
import { unlistenElement } from './utils.js'


import layout from './layout'
import renderKeyboard from './render-keyboard'
import renderControls from './render-controls'

export default class MathJaxEditorKeyboard extends MathJaxEditor {
  constructor(selector, options) {
    super(selector, options)

    this.mathjaxEditorVersion = this.version
    this.version = '2.0.0-beta2'

    const $editorContainer = this.core.$container
    const $container = createElement('div', 'mathboard')
    const $keyboard = createElement('div', 'mathboard-keyboard')
    const $wrapper = createElement('div', 'mathboard-wrapper')
    
    let currentLayer = 0
    let isMobile = false
    let cursorAtDisplay = false

    appendElementAfter($editorContainer, $container)
    appendElement($container, $wrapper)
    appendElement($wrapper, $editorContainer, $keyboard)
    hideElement($keyboard)
    
    const clearKeyboard = () => {
      while ($keyboard.firstChild) {
        $keyboard.removeChild($keyboard.firstChild)
      }
    }
    
    const renderLayer = () => {
      clearKeyboard()
      renderKeyboard($keyboard, layout[currentLayer], this)
      renderControls($keyboard, this, {
        nextLayer() {
          if (++currentLayer === layout.length) {
            currentLayer = 0
          }
          renderLayer()
        },

        previousLayer() {
          if (--currentLayer < 0) {
            currentLayer = layout.length - 1
          }
          renderLayer()
        }
      })
      MathJax.Hub.Typeset($keyboard)
    }

    const handleFocus = () => {
      handleResize()
      showElement($keyboard)
      renderLayer()
      handleResize()
      this.core.update()
    }

    const handleBlur = () => {
      removeClass($container, 'is-desktop')
      removeClass($container, 'is-mobile')
      hideElement($keyboard)
      hideElement(this.core.$caret)
      this.core.$input.removeAttribute('readonly')
      this.core.handleBlur()
      appendElementAfter(this.core.$el, $container)
    }

    const handleDocClick = e => {
      if (!cursorAtDisplay) {
        handleBlur()
      }
    }

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      if (width > 512) {
        addClass($container, 'is-desktop')
        removeClass($container, 'is-mobile')
        $keyboard.style.marginLeft = px(-($keyboard.clientWidth / 2))
        this.core.$input.removeAttribute('readonly')
        isMobile = false
      }
      else {
        $keyboard.style.marginLeft = null
        appendElement(document.body, $container)
        addClass($container, 'is-mobile')
        removeClass($container, 'is-desktop')
        this.core.$input.setAttribute('readonly', 'true')
        isMobile = true
      }
    }

    listenElement($container, 'click', e => {
      if (e.target === $container) {
        handleBlur()
      }
    })

    listenElement($container, 'mouseenter', () => {
      cursorAtDisplay = true
    })

    listenElement($container, 'mouseleave', () => {
      cursorAtDisplay = false
    })
    
    listenElement(document, 'click', handleDocClick)
    this.on('focus', handleFocus)

    this.destroy = () => {
      super.destroy()
      removeElement($container)
      unlistenElement(document, 'click', handleDocClick)
    }
  }
}
