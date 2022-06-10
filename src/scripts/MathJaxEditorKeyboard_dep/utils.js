
const appendElement = ($parent) => {
  for (var _len = arguments.length, children = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    children[_key - 1] = arguments[_key];
  }

  return children.forEach(function ($child) {
    return $parent.appendChild($child);
  });
}

const createElement = (tagName) => {
  var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if ((typeof className === 'undefined' ? 'undefined' : _typeof(className)) === 'object') {
    attributes = className;
    className = '';
  }

  var $el = document.createElement(tagName);
  $el.className = className;

  Object.keys(attributes).forEach(function (key) {
    var value = attributes[key];
    switch (key) {
      case '_html':
        $el.innerHTML = value;
        break;
      default:
        $el.setAttribute(key, value);
    }
  });
  return $el;
}

const appendElementAfter = ($ref, $new) => {
        return $ref.parentNode.insertBefore($new, $ref.nextSibling);
}

const addClass = ($el, name) => {
  var classes = $el.className.split(' ');
  if (!~classes.indexOf(name)) {
    $el.className += ' ' + name;
  }
}

const hideElement = ($el) => {
  $el.style.display = 'none';
}

const listenElement = ($el, type, listener) => {
        return $el.addEventListener(type, listener);
}

const px = (value) => {
    return value + "px";
}

const removeClass = ($el, name) => {
  var classes = $el.className.split(' ');
  $el.className = classes.filter(function (n) {
    return n !== name;
  }).join(' ');
}
      
const removeElement = ($el) => {
  return $el.parentNode.removeChild($el);
}

const showElement = ($el) => {
  $el.style.display = 'block';
}

const unlistenElement = ($el, type, listener) => {
  return $el.removeEventListener(type, listener);
}

export { appendElement, createElement, unlistenElement, showElement, removeElement, removeClass, px, listenElement, hideElement, addClass, appendElementAfter}
