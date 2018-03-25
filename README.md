<div align="center">
  <img src="screenshots/1.png" width="30%">
  <img src="screenshots/2.png" width="30%">
</div>

# nanokit-spinner-overlay

[![Package version](https://img.shields.io/npm/v/nanokit-spinner-overlay.svg?style=flat-square)](https://npmjs.org/package/nanokit-spinner-overlay)
[![Package version](https://img.shields.io/npm/v/nanokit-spinner-overlay.svg?style=flat-square)](https://npmjs.org/package/nanokit-spinner-overlay)
[![Greenkeeper badge](https://badges.greenkeeper.io/tiaanduplessis/nanokit-spinner-overlay.svg)](https://greenkeeper.io/)
[![Make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/nanokit-spinner-overlay.svg?style=flat-square)](https://github.com/tiaanduplessis/nanokit-spinner-overlay/blob/master/LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/nanokit-spinner-overlay.svg?style=flat-square)](https://npmjs.org/package/nanokit-spinner-overlay)
[![Travis CI build status](https://img.shields.io/travis/tiaanduplessis/nanokit-spinner-overlay.svg?style=flat-square)](https://travis-ci.org/tiaanduplessis/nanokit-spinner-overlay)

> A spinning overlay component for React Native

## Table of Contents 

- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Install

```sh
$ npm install nanokit-spinner-overlay
# OR
$ yarn add nanokit-spinner-overlay
```

## Usage

```jsx
import React from 'react'
import {View, StyleSheet} from 'react-native'
import SpinnerOverlay from 'nanokit-spinner-overlay'

const ExampleOne = () => <View style={styles.container}>
    <SpinnerOverlay visible={true}/>
</View>

const ExampleOne = () => <View style={styles.container}>
    <SpinnerOverlay container containerStyle={{backgroundColor: 'red'}} color="pink" overlayColor="blue"/>
</View>

const styles = StyleSheet.create({
  container: {flex: 1}
})

```

See the [available props](index.js) for more info

## Contributing

Contributions are welcome!

1. Fork it.
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

Or open up [a issue](https://github.com/tiaanduplessis/nanokit-spinner-overlay/issues).

## License

MIT
