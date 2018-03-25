import React from 'react'
import { View, ActivityIndicator, Modal, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

function noop () {}

const SpinnerOverlay = ({
  visible,
  overlayStyle,
  color,
  containerStyle,
  overlayColor,
  size,
  container,
  ...props
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      {...props}
    >
      <View
        style={[
          styles.overlay,
          { backgroundColor: overlayColor },
          overlayStyle
        ]}
      >
        {container ? (
          <View style={[styles.container, containerStyle]}>
            <ActivityIndicator color={color} size={size} animating={visible} />
          </View>
        ) : (
          <ActivityIndicator color={color} size={size} animating={visible} />
        )}
      </View>
    </Modal>
  )
}

SpinnerOverlay.defaultProps = {
  container: false,
  visible: false,
  animationType: 'slide',
  onRequestClose: noop,
  onShow: noop,
  overlayStyle: {},
  color: '#757575',
  size: 'large',
  overlayColor: 'rgba(0,0,0,.2)',
  containerStyle: {}
}

SpinnerOverlay.propTypes = {
  container: PropTypes.bool,
  visible: PropTypes.bool,
  animationType: PropTypes.string,
  onRequestClose: PropTypes.func,
  onShow: PropTypes.func,
  overlayStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  color: PropTypes.string,
  overlayColor: PropTypes.string,
  size: PropTypes.string
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 10
  }
})

export default SpinnerOverlay