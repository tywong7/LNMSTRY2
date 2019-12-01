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

import React,{useEffect} from 'react';
import { Platform, StatusBar, Image } from 'react-native';

import { Asset } from 'expo-asset';
import { Block, GalioProvider } from 'galio-framework';

import AppContainer from './navigation/Screens';
import { Images, materialTheme } from './constants/';
import RNBootSplash from "react-native-bootsplash";
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
      Asset.fromModule(image).downloadAsync();
    }
  });
}
function big(){
  let init=async () => {
    return Promise.all([
      ...cacheImages(assetImages),
    ]);
  };


    init().finally(() => {
      // without fadeout: RNBootSplash.hide()
      //console.log("done done");
      RNBootSplash.hide({ duration: 50 });
    });

    
  return (
    <GalioProvider theme={materialTheme}>
      <Block flex>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <AppContainer />
      </Block>
    </GalioProvider>
  );
}
export default class App extends React.Component {
  state = {
    isLoadingComplete: true,
  };

  render() {
    return big();
  }

  

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}
