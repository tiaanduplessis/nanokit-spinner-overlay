'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const childProcess = require('child_process')

// Separate processes exercise prop-types' actual development/production entries.
if (!process.env.SPINNER_TEST_MODE) {
  for (const mode of ['development', 'production']) {
    const result = childProcess.spawnSync(process.execPath, [__filename], {
      env: Object.assign({}, process.env, {
        NODE_ENV: mode,
        SPINNER_TEST_MODE: mode
      }),
      stdio: 'inherit'
    })
    if (result.error) throw result.error
    assert.strictEqual(result.status, 0, mode + ' tests failed')
  }
} else {
  run()
}

function run () {
  const React = require('react')
  const renderer = require('react-test-renderer')
  const PropTypes = process.env.SPINNER_TEST_RUNTIME
    ? require(require.resolve('prop-types', { paths: [path.resolve(process.env.SPINNER_TEST_RUNTIME)] }))
    : require('prop-types')
  const babel = require('@babel/standalone')
  const filename = path.resolve(process.env.SPINNER_TEST_SOURCE || path.join(__dirname, '..', 'index.js'))
  const source = fs.readFileSync(filename, 'utf8')
  const styleCalls = []
  // These hosts inspect JavaScript props, not native iOS/Android behavior.
  const native = {
    View: 'View',
    Modal: 'Modal',
    ActivityIndicator: 'ActivityIndicator',
    StyleSheet: {
      create: function (styles) {
        styleCalls.push(styles)
        return styles
      }
    }
  }
  const compiled = babel.transform(source, {
    filename: filename,
    presets: ['react'],
    plugins: ['transform-modules-commonjs']
  }).code
  const exports = {}
  const imports = { react: React, 'react-native': native, 'prop-types': PropTypes }
  const wrapper = vm.runInThisContext('(function(require, exports) {\n' + compiled + '\n})', { filename: filename })
  wrapper(function (name) {
    assert(Object.prototype.hasOwnProperty.call(imports, name), 'Unexpected import: ' + name)
    return imports[name]
  }, exports)
  const Spinner = exports.default
  let passed = 0
  function test (name, check) {
    check()
    passed++
    console.log('ok - ' + process.env.NODE_ENV + ' - ' + name)
  }
  function warnings (check) {
    const messages = []
    const original = console.error
    console.error = function () { messages.push(Array.from(arguments).join(' ')) }
    try {
      PropTypes.resetWarningCache()
      check()
    } finally {
      console.error = original
    }
    return messages
  }
  function render (props, check) {
    const tree = renderer.create(React.createElement(Spinner, props))
    try { check(tree.root) } finally { tree.unmount() }
  }

  test('default props and primitive validators stay unchanged', function () {
    const defaults = Spinner.defaultProps
    assert.deepStrictEqual(Object.keys(defaults).sort(), [
      'animationType', 'color', 'container', 'containerStyle', 'onRequestClose',
      'onShow', 'overlayColor', 'overlayStyle', 'size', 'visible'
    ])
    assert.strictEqual(defaults.container, false)
    assert.strictEqual(defaults.visible, false)
    assert.strictEqual(defaults.animationType, 'slide')
    assert.strictEqual(defaults.color, '#757575')
    assert.strictEqual(defaults.size, 'large')
    assert.strictEqual(defaults.overlayColor, 'rgba(0,0,0,.2)')
    assert.deepStrictEqual(defaults.overlayStyle, {})
    assert.deepStrictEqual(defaults.containerStyle, {})
    assert.strictEqual(typeof defaults.onShow, 'function')
    assert.strictEqual(typeof defaults.onRequestClose, 'function')
    assert.strictEqual(defaults.onShow(), undefined)
    assert.strictEqual(defaults.onRequestClose(), undefined)
    const types = {
      container: 'bool', visible: 'bool', animationType: 'string',
      onRequestClose: 'func', onShow: 'func', overlayStyle: 'object',
      containerStyle: 'object', color: 'string', overlayColor: 'string', size: 'string'
    }
    assert.deepStrictEqual(Object.keys(Spinner.propTypes).sort(), Object.keys(types).sort())
    for (const key of Object.keys(types)) assert.strictEqual(Spinner.propTypes[key], PropTypes[types[key]])
    assert.deepStrictEqual(warnings(function () {
      PropTypes.checkPropTypes(Spinner.propTypes, defaults, 'prop', 'SpinnerOverlay')
      render({}, function () {})
    }), [])
  })

  test('invalid values warn in development without throwing; production checks are no-ops', function () {
    const invalid = {
      container: 'yes', visible: 1, animationType: false, onRequestClose: {},
      onShow: 'callback', overlayStyle: [], containerStyle: 'style',
      color: 1, overlayColor: {}, size: 2
    }
    for (const key of Object.keys(invalid)) {
      const values = Object.assign({}, Spinner.defaultProps, { [key]: invalid[key] })
      const messages = warnings(function () {
        PropTypes.checkPropTypes(Spinner.propTypes, values, 'prop', 'SpinnerOverlay')
      })
      if (process.env.NODE_ENV === 'development') {
        assert.strictEqual(messages.length, 1, key)
        assert(messages[0].includes('`' + key + '`'), key + ': ' + messages[0])
      } else {
        assert.deepStrictEqual(messages, [], key)
      }
    }
  })

  test('all optional validators accept missing and null values', function () {
    for (const value of [undefined, null]) {
      const values = {}
      for (const key of Object.keys(Spinner.propTypes)) values[key] = value
      assert.deepStrictEqual(warnings(function () {
        PropTypes.checkPropTypes(Spinner.propTypes, values, 'prop', 'SpinnerOverlay')
      }), [])
    }
  })

  test('React applies defaults when props are omitted or undefined', function () {
    for (const props of [{}, { visible: undefined, color: undefined, size: undefined }]) {
      render(props, function (root) {
        const modal = root.findByType('Modal')
        const indicator = root.findByType('ActivityIndicator')
        assert.strictEqual(modal.props.visible, false)
        assert.strictEqual(modal.props.transparent, true)
        assert.strictEqual(modal.props.animationType, 'slide')
        assert.strictEqual(modal.props.onShow, Spinner.defaultProps.onShow)
        assert.strictEqual(modal.props.onRequestClose, Spinner.defaultProps.onRequestClose)
        assert.strictEqual(indicator.props.animating, false)
        assert.strictEqual(indicator.props.color, '#757575')
        assert.strictEqual(indicator.props.size, 'large')
        assert.strictEqual(root.findAllByType('View').length, 1)
      })
    }
  })

  for (const container of [false, true]) {
    for (const visible of [false, true]) {
      test('container=' + container + ', visible=' + visible + ': hosts, styles and callback forwarding', function () {
        const overlayStyle = { opacity: 0.75 }
        const containerStyle = { width: 180, backgroundColor: 'red' }
        const calls = []
        const event = { nativeEvent: { example: true } }
        const onShow = function (arg) { calls.push(['show', arg]) }
        const onRequestClose = function (arg) { calls.push(['close', arg]) }
        const props = {
          container: container, visible: visible, color: 'pink', size: 'small',
          overlayColor: 'blue', animationType: 'fade', overlayStyle: overlayStyle,
          containerStyle: containerStyle, onShow: onShow, onRequestClose: onRequestClose,
          testID: 'spinner-modal', supportedOrientations: ['portrait']
        }
        assert.deepStrictEqual(warnings(function () {
          PropTypes.checkPropTypes(Spinner.propTypes, props, 'prop', 'SpinnerOverlay')
          render(props, function (root) {
            const modal = root.findByType('Modal')
            const views = root.findAllByType('View')
            const indicator = root.findByType('ActivityIndicator')
            assert.strictEqual(modal.props.visible, visible)
            assert.strictEqual(modal.props.transparent, true)
            assert.strictEqual(modal.props.animationType, 'fade')
            assert.strictEqual(modal.props.testID, 'spinner-modal')
            assert.strictEqual(modal.props.supportedOrientations, props.supportedOrientations)
            assert.strictEqual(modal.props.onShow, onShow)
            assert.strictEqual(modal.props.onRequestClose, onRequestClose)
            assert.deepStrictEqual(calls, [])
            modal.props.onShow(event)
            modal.props.onRequestClose(event)
            assert.deepStrictEqual(calls, [['show', event], ['close', event]])
            assert.deepStrictEqual(indicator.props, { color: 'pink', size: 'small', animating: visible })
            assert.strictEqual(views.length, container ? 2 : 1)
            assert.deepStrictEqual(views[0].props.style[0], { flex: 1, alignItems: 'center', justifyContent: 'center' })
            assert.deepStrictEqual(views[0].props.style[1], { backgroundColor: 'blue' })
            assert.strictEqual(views[0].props.style[2], overlayStyle)
            if (container) {
              assert.deepStrictEqual(views[1].props.style[0], {
                justifyContent: 'center', alignItems: 'center', height: 120,
                width: 120, backgroundColor: '#fff', borderRadius: 10
              })
              assert.strictEqual(views[1].props.style[1], containerStyle)
              assert.strictEqual(indicator.parent, views[1])
            } else {
              assert.strictEqual(indicator.parent, views[0])
            }
            for (const key of ['container', 'containerStyle', 'overlayStyle', 'overlayColor', 'color', 'size']) {
              assert.strictEqual(Object.prototype.hasOwnProperty.call(modal.props, key), false, key)
            }
          })
        }), [])
      })
    }
  }

  test('rest props preserve explicit Modal transparency override', function () {
    render({ transparent: false }, function (root) {
      assert.strictEqual(root.findByType('Modal').props.transparent, false)
    })
  })

  test('repeated visibility and container changes update the existing render tree', function () {
    const tree = renderer.create(React.createElement(Spinner))
    try {
      for (const props of [
        { visible: true, container: true },
        { visible: false, container: true },
        { visible: true, container: false },
        { visible: false, container: false }
      ]) {
        tree.update(React.createElement(Spinner, props))
        assert.strictEqual(tree.root.findByType('Modal').props.visible, props.visible)
        assert.strictEqual(tree.root.findByType('ActivityIndicator').props.animating, props.visible)
        assert.strictEqual(tree.root.findAllByType('View').length, props.container ? 2 : 1)
      }
    } finally { tree.unmount() }
  })

  test('style creation happens once when loading the component', function () {
    assert.strictEqual(styleCalls.length, 1)
  })
  console.log(passed + ' checks passed (' + process.env.NODE_ENV + ', React ' + React.version + ')')
}
