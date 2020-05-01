import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StyleSheet, Dimensions, Text, View, Button, Alert } from 'react-native';
import { Block, theme } from 'galio-framework';
import MapView from 'react-native-maps';
import { Marker, Callout, Heatmap } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
const { height, width } = Dimensions.get('screen');
import firestore from '@react-native-firebase/firestore';



export default class PollutionMap extends React.Component {

  state = {
    marginBottom: 0,
    locationResult: 22.368043,
    locationResult2: 114.134825,
    region: {
      latitude: 22.368043,
      longitude: 114.134825,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    },
    MarkerList: [],
    latC: 22.368043,
    longC: 114.134825,
  };
  getData = async (lat, long, delta, deltaL) => {
    var latRange = delta / 2;
    const longRange = deltaL;
    const querySnapshot = firestore().collection('MeasuredResult');

    const temp1 = await querySnapshot.where('date', '>=', Date.parse(new Date()) - 86400 * 1000).orderBy('date', "desc").get();

    var templist = [];
    temp1.forEach((documentSnapshot) => {
      var exist = false;
      if (templist.length >= 10)
        return templist;

      if (documentSnapshot.data().long >= long - longRange && documentSnapshot.data().long <= long + longRange)
        if (documentSnapshot.data().lat >= lat - latRange && documentSnapshot.data().lat <= lat + latRange) {
          for (i = 0; i < templist.length; i++) {
            if (templist[i].lat == documentSnapshot.data().lat && documentSnapshot.data().long == templist[i].long)
              exist = true;
          }
          if (!exist)
            templist.push({
              maxlight: documentSnapshot.data().maxlight,
              maxnoise: documentSnapshot.data().maxnoise,
              avglight: documentSnapshot.data().avglight,
              avgnoise: documentSnapshot.data().avgnoise,
              temperature: documentSnapshot.data().temperature,
              humidity: documentSnapshot.data().humidity,
              lat: documentSnapshot.data().lat,
              long: documentSnapshot.data().long,
              date: new Date(documentSnapshot.data().date).toLocaleString("en"),
            })
        }
    })

    return templist;


  }
  componentDidMount() {
    this._getLocationAsync();
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
      });

      Alert.alert(
        'Permission Denied',
        'Please enable location service for a better experience.',

      )
    }
    try {
      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      this.setState({ locationResult: location['coords']['latitude'] });
      this.setState({ locationResult2: location['coords']['longitude'] });
      let b = await this.getData(location['coords']['latitude'], location['coords']['longitude'], 0.002, 0.002);
      this.genMarker(b);
      this.setState({ region: { ...this.state.region, latitude: location['coords']['latitude'] } });
      this.setState({ region: { ...this.state.region, longitude: location['coords']['longitude'] } });
      this.setState({ latC: location['coords']['latitude'] });
      this.setState({ longC: location['coords']['longitude'] });
    }
    catch (e) {
      Alert.alert(
        'Permission Denied',
        'Please enable location service for a better experience.',

      )
    }

  };
  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }
  onRegionChange = async (region) => {
    await this.setStateAsync({
      region: region
    })

    let b = await this.getData(region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta);
    console.log(b);
    this.genMarker(b);

  }

  getLevel = (db, lux) => {
    if (db >= 75 || lux >= 1500)
      return 'red'
    else if (db >= 55 || lux >= 500)
      return 'yellow'
    else return 'green'
  }
  genMarker = (arrList) => {

    var tempMaker = [];
    for (i = 0; i < arrList.length; i++) {
      tempMaker.push(
        <Marker key={'Marker' + i} pinColor={this.getLevel(arrList[i].maxnoise, arrList[i].maxlight)} coordinate={{ latitude: arrList[i].lat || -36.82339, longitude: arrList[i].long || -73.03569 }}>
          <Callout style={styles.plainView}>
            <View>
              <Text>Time: {arrList[i].date}</Text>
              <Text>Temp: {arrList[i].temperature}°C Humidity: {arrList[i].humidity}%</Text>
              <Text style={{ fontWeight: 'bold' }}>Noise Level: {arrList[i].maxnoise}dB </Text>
              <Text style={{ fontWeight: 'bold' }}>Light Level: {arrList[i].maxlight}lux</Text>

            </View>
          </Callout>

        </Marker>
      )
    }

    this.setState({ MarkerList: tempMaker });

  }
  _onMapReady = () => {this.setState({ marginBottom: 44 }); }
  getCurrentPosition = async (details) => {
    await this.setStateAsync({ region: { ...this.state.region, latitude: details['geometry']["location"]["lat"] } });
    await this.setStateAsync({ region: { ...this.state.region, longitude: details['geometry']["location"]["lng"] } });
       
        _mapView.animateToRegion(
        this.state.region,
          500
        )
      
  }
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
              this.getCurrentPosition(details);
             
            }}

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
                backgroundColor: 'rgba(1.0,1.0,1.0,0.67)',

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

        </View>
        <View>


          <MapView style={[styles.map, { marginTop: this.state.marginBottom }]}
          ref={mapView => {
            _mapView = mapView
          }}
            onMapReady={this._onMapReady}
            initialRegion={this.state.region}
            onRegionChangeComplete={this.onRegionChange}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {this.state.MarkerList}




          </MapView>

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
    marginTop: 44,
    height: height * 0.95,
    position: "absolute",
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36
  }
});
