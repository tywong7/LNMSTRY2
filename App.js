/*!

 =========================================================
 * Material Kit React Native - v1.3.0
 =========================================================
 * Product Page: https://demos.creative-tim.com/material-kit-react-native/
 * Copyright 2019 Creative Tim (http://www.creative-tim.com)
 * Licensed under MIT (https://github.com/creativetimofficial/material-kit-react-native/blob/master/LICENSE)
 =========================================================
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React from 'react';
import { Platform, StatusBar, Image } from 'react-native';

import { Asset } from 'expo-asset';
import { Block, GalioProvider } from 'galio-framework';

import AppContainer from './navigation/Screens';
import { Images, products, materialTheme } from './constants/';

// cache app images
const assetImages = [
  Images.Pro,
  Images.Profile,
  Images.Avatar,

];

// cache product images


function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return 0;//Asset.fromModule(image).downloadAsync();
    }
  });
}

export default class App extends React.Component {
  state = {
    isLoadingComplete: true,
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        console.log("fuck you"),
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      
      return (
        <GalioProvider theme={materialTheme}>
          <Block flex>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <AppContainer />
          </Block>
        </GalioProvider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      ...cacheImages(assetImages),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}
