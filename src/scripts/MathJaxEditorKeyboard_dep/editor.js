const MathJaxEditor = (selectors) => {
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          _classCallCheck(this, MathJaxEditor);

          this.core = new _editor2.default(selectors, options);
          this.version = '2.0.0-beta3';

          this.core.on('@input', this.insert.bind(this));
        }

        /**
         * Insert a number in the editor.
         * 
         * @param {Number} n
         * 
         * @return {Void}
         */

        _createClass(MathJaxEditor, [{
          key: 'insertNumber',
          value: function insertNumber(n) {
            if (n < 0 || n > 9) {
              throw new RangeError('MathjaxEditor: The number must be 0 or up to 9.');
            }

            var $mn = (0, _createElement2.default)('mn', { _html: n });
            this.core.insert($mn);
          }

          /**
           * Insert a identifier in the editor.
           * 
           * @param {String} i
           * 
           * @return {Void}
           */

        }, {
          key: 'insertIdentifier',
          value: function insertIdentifier(i) {
            if (typeof i !== 'string' && !i.match(/^[a-zA-Z\\]+$/)) {
              throw new RangeError('MathjaxEditor: A string with alphabetic characters should be given.');
            }
            if (!_identifierList2.default[i]) {
              if (i[0] !== '\\') {
                return this.insertIdentifier('\\' + i);
              } else {
                i = i.substr(1);
              }
            } else {
              i = _identifierList2.default[i];
            }

            var $mi = (0, _createElement2.default)('mi', { _html: i });

            this.core.insert($mi);
          }

          /**
           * Insert a fraction in the editor.
           * 
           * @return {Void}
           */

        }, {
          key: 'insertFraction',
          value: function insertFraction() {
            var $mfrac = (0, _createElement2.default)('mfrac');
            var $mrowNum = (0, _createElement2.default)('mrow');
            var $mrowDen = (0, _createElement2.default)('mrow');

            (0, _appendElement2.default)($mfrac, $mrowNum, $mrowDen);

            this.core.insert($mfrac, $mrowNum);
          }

          /**
           * Insert a square root on the editor.
           * 
           * @return {Void}
           */

        }, {
          key: 'insertSqrt',
          value: function insertSqrt() {
            var $msqrt = (0, _createElement2.default)('msqrt');
            var $mrow = (0, _createElement2.default)('mrow');

            (0, _appendElement2.default)($msqrt, $mrow);

            this.core.insert($msqrt, $mrow);
          }

          /**
           * Insert a nth root on the editor.
           * 
           * @return {Void}
           */

        }, {
          key: 'insertRoot',
          value: function insertRoot() {
            var $mroot = (0, _createElement2.default)('mroot');
            var $mrowRadicand = (0, _createElement2.default)('mrow');
            var $mrowIndex = (0, _createElement2.default)('mrow');

            (0, _appendElement2.default)($mroot, $mrowRadicand, $mrowIndex);

            this.core.insert($mroot, $mrowRadicand, $mrowIndex);
          }

          /**
           * Insert a operator in the editor.
           * 
           * @param {String} o
           * 
           * @return {Void}
           */

        }, {
          key: 'insertOperator',
          value: function insertOperator(o) {
            if (!_extraOperatorList2.default[o]) {
              if (o[0] !== '\\\\') {
                return this.insertOperator('\\' + o);
              }
              throw new TypeError('MathjaxEditor: Unknown operator "' + o + '"');
            }

            var $mo = (0, _createElement2.default)('mo', {
              _html: _extraOperatorList2.default[o]
            });

            this.core.insert($mo);
          }

          /**
           * Insert a superscript in the editor.
           * 
           * @return {Void}
           */

        }, {
          key: 'insertSuperscript',
          value: function insertSuperscript() {
            var $msup = (0, _createElement2.default)('msup');
            var $mrowBase = (0, _createElement2.default)('mrow');
            var $mrowPower = (0, _createElement2.default)('mrow');

            (0, _appendElement2.default)($msup, $mrowBase, $mrowPower);

            this.core.insert($msup, $mrowBase);
          }

          /**
           * Insert a subscript in the editor.
           * 
           * @return {Void}
           */

        }, {
          key: 'insertSubscript',
          value: function insertSubscript() {
            var $msub = (0, _createElement2.default)('msub');
            var $mrowBase = (0, _createElement2.default)('mrow');
            var $mrowSequence = (0, _createElement2.default)('mrow');

            (0, _appendElement2.default)($msub, $mrowBase, $mrowSequence);

            this.core.insert($msub, $mrowBase);
          }

          /**
           * Insert a newline in the editor.
           * 
           * @return {Void}
           */

        }, {
          key: 'insertNewline',
          value: function insertNewline() {
            return this.core.insertNewline();
          }

          /**
           * This method is not actually meant to be used, it is here to
           * handle the @input event when the user types in the editor's
           * input element.
           * 
           * @param {String} what 
           * 
           * @return {Void}
           */

        }, {
          key: 'insert',
          value: function insert(what) {
            if (what.match(/^[0-9]$/)) {
              return this.insertNumber(parseInt(what, 10));
            }
            if (what.match(/^[a-zA-Z\\]+$/)) {
              return this.insertIdentifier(what);
            }
            if (_extraOperatorList2.default[what]) {
              return this.insertOperator(what);
            }
            console.warn('MathjaxEditor: insert: unknown "' + what + '"');
          }

          /**
           * Move the cursor to the left.
           * 
           * @return {Void}
           */

        }, {
          key: 'moveCursorLeft',
          value: function moveCursorLeft() {
            return this.core.cursor.moveLeft();
          }

          /**
           * Move the cursor to the right.
           * 
           * @return {Void}
           */

        }, {
          key: 'moveCursorRight',
          value: function moveCursorRight() {
            return this.core.cursor.moveRight();
          }

          /**
           * Get the value of the editor as string.
           * 
           * @return {String}
           */

        }, {
          key: 'toString',
          value: function toString() {
            return this.core.toString();
          }

          /**
           * Get the value of the editor as a tex string.
           * 
           * @return {String}
           */

        }, {
          key: 'toTex',
          value: function toTex() {
            return this.core.toTex();
          }

          /**
           * Get the value of the editor (a copy).
           * 
           * @return {HTMLElement}
           */

        }, {
          key: 'getValue',
          value: function getValue() {
            return this.core.getValue();
          }

          /**
           * Set the value of the editor.
           * 
           * @param {HTMLElement} $value
           * 
           * @return {Void}
           */

        }, {
          key: 'setValue',
          value: function setValue($value) {
            return this.core.setValue($value);
          }

          /**
           * Focus the editor.
           * 
           * @return {Void}
           */

        }, {
          key: 'focus',
          value: function focus() {
            return this.core.focus();
          }

          /**
           * Listen to an editor event.
           * 
           * @param {String} type 
           * @param {Function} listener 
           */

        }, {
          key: 'on',
          value: function on(type, listener) {
            return this.core.on(type, listener);
          }

          /**
           * Perform a "backspace" deletion.
           * 
           * @return {Void}
           */

        }, {
          key: 'backspaceRemove',
          value: function backspaceRemove() {
            return this.core.backspaceRemove();
          }

          /**
           * Perform a "delete" deletion.
           * 
           * @return {Void}
           */

        }, {
          key: 'deleteRemove',
          value: function deleteRemove() {
            return this.core.deleteRemove();
          }

          /**
           * Remove the editor element and event listeners.
           * 
           * @return {Void}
           */

        }, {
          key: 'destroy',
          value: function destroy() {
            return this.core.destroy();
          }
        }]);

        return MathJaxEditor;
}

export { MathJaxEditor }
