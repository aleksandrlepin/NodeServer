import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { setUserInfo, clearUserInfo } from '../../actions/userInfo'
import nodeApi from '../../api'
import { loadFacebookSDK } from './utils'
import { FACE_BOOK } from '../../constants/common';
import { storage } from '../../utils';

const withFaceBookApi = (WrappedComponent) => class extends Component {
  static propTypes = {
    setUserInfo: PropTypes.func.isRequired,
    clearUserInfo: PropTypes.func.isRequired,
  }

  componentDidMount = () => {
    // if (this.props.userInfo) { return }
    loadFacebookSDK(this.updateUserInfo)
  }

  updateUserInfo = (resp) => {
    const { status, authResponse } = resp
    console.log('​extends -> updateUserInfo -> resp', resp)

    if (status === 'connected') {
      window.FB.api('/me?fields=name,picture', (response) => {
        // TODO: check expire token
        const userInfo = storage.get('userInfo')
        const expiresIn = userInfo ? userInfo.expiresIn : null
        if (!userInfo || Date.now() > expiresIn) {
          this.loginFbUserToApp(response)
        }
      })
    }
  }

  loginFbUserToApp = ({ id, name }) => {
    nodeApi.loginFbUser({
      id,
      name,
    })
      .then(response => {
        if (response && response.data) {
          storage.set('userInfo', response.data)
          const payload = {
            ...response.data,
            profileType: FACE_BOOK,
          }
          this.props.setUserInfo(payload)
        }
        throw new Error('No response from loginFbApi.')
      })
      .catch(err => {
        console.info(err)
      })
  }

  render() {
    return <WrappedComponent {...this.props} />
  }
}

withFaceBookApi.propTypes = {
  component: PropTypes.any,
}

const MSTP = (state) => ({
  userInfo: state.userInfo,
})

const MDTP = {
  setUserInfo,
  clearUserInfo,
}

export default compose(
  connect(MSTP, MDTP),
  withFaceBookApi,
)
