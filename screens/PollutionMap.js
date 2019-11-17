import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StyleSheet, Dimensions, Text, View,Button } from 'react-native';
import { Block, theme } from 'galio-framework';
import MapView from 'react-native-maps';
import { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
const { height,width } = Dimensions.get('screen');

const homePlace = { description: 'Home', geometry: { location: { lat: 22.368043, lng: 114.134825 } } };


export default class PollutionMap extends React.Component {
  state = {
    locationResult: 22.368043,
    locationResult2: 114.134825,
    region: {
      latitude: -36.82339,
      longitude: -73.03569,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    }
  };

  componentDidMount() {
    this._getLocationAsync();
  }
  loginHandler = () => {
    console.log('P11');
 }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
      });
      
    }

    let location = await Location.getCurrentPositionAsync({enableHighAccuracy:true});
    this.setState({ locationResult: location['coords']['latitude'] });
    this.setState({ locationResult2: location['coords']['longitude'] });
    this.setState({ region: { ...this.state.region, latitude: location['coords']['latitude'] } });
    this.setState({ region: { ...this.state.region, longitude: location['coords']['longitude'] } });
  };
  render() {
    return (
      <View>
        <View style={{ position: 'absolute', width: width, zIndex: 9999 }}>
          <GooglePlacesAutocomplete
            placeholder='Enter the location'
            minLength={2} // minimum length of text to search
            autoFocus={false}
            returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
            keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
            listViewDisplayed='false'    // true/false/undefined
            fetchDetails={true}
            renderDescription={row => row.description} // custom description render
            onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
              console.log("yolo", details['geometry']["location"]["lat"], details['geometry']["location"]["lng"]);
              this.setState({ region: { ...this.state.region, latitude: details['geometry']["location"]["lat"] } });
              this.setState({ region: { ...this.state.region, longitude: details['geometry']["location"]["lng"] } });
            }}
            predefinedPlaces={[homePlace]}
            getDefaultValue={() => ''}
            query={{
              // available options: https://developers.google.com/places/web-service/autocomplete
              key: 'AIzaSyACtUyn5rtNN70pDldbLtdfHBNSlbqAZUc',
              language: 'en' // default: 'geocode'

            }}
            styles={{

              textInputContainer: {
                backgroundColor: 'rgba(1.0,1.0,1.0,0.7)',
                borderTopWidth: 0,
                borderBottomWidth: 0
              },
              listView: {
                backgroundColor: 'rgba(1.0,1.0,1.0,0.7)',

              }
              ,
              description: {
                fontWeight: 'bold'
              },
              predefinedPlacesDescription: {
                color: '#1faadb'
              }
            }}

          />
          <View  >  
          
            <Button onPress={() => this._getLocationAsync()} title="Current Location" />
          </View>
       

        

        </View>
        <View>
          <Block style={{ flex: 1 }} >

            <MapView style={styles.map}
              region={this.state.region}
            >
              <Marker pinColor='green' coordinate={{ latitude: this.state.locationResult || -36.82339, longitude: this.state.locationResult2 || -73.03569 }}>
                <Callout style={styles.plainView}>
                  <View>
                    <Text>Date: 10/10/2019</Text>
                    <Text>Time: 23:49 </Text>
                    <Text>Noise Level: 30dB </Text>
                    <Text>Light Level: 50lux </Text>
                  </View>
                </Callout>

              </Marker>
              <Marker image={require('../assets/images/yrh.png')} coordinate={{ latitude: this.state.region.latitude || -36.82339, longitude: this.state.region.longitude || -73.03569 }} />

              <Marker pinColor='yellow' coordinate={{ latitude: this.state.locationResult + 0.0002 || -36.82339, longitude: this.state.locationResult2 + 0.0005 || -73.03569 }}>
                <Callout style={styles.plainView}>
                  <View>
                    <Text>Date: 10/10/2019</Text>
                    <Text>Time: 13:49 </Text>
                    <Text>Noise Level: 60dB </Text>
                    <Text>Light Level: 50lux </Text>
                  </View>
                </Callout>

              </Marker>
            </MapView>

          </Block>
        </View>
      </View>





    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.MUTED,
  }, plainView: {
    width: 120,
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 2,
  },
  map: {
    flex: 1,
    width: width,
    height: 720,
    position: "absolute"
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36
  }
});
