import React from 'react';
import { withNavigation } from 'react-navigation';
import { StyleSheet, Dimensions,View, TouchableWithoutFeedback,Platform } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoder-reborn';



const { width } = Dimensions.get('screen');
mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ebe3cd"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#523735"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f1e6"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#c9b2a6"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#dcd2be"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#ae9e90"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#93817c"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#a5b076"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#447530"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f1e6"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#fdfcf8"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f8c967"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#e9bc62"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e98d58"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#db8555"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#806b63"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8f7d77"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#ebe3cd"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#b9d3c2"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#92998d"
      }
    ]
  }
]

class Product extends React.Component {
  
  state = {
    render:false,
    element:'Click for detailed address'
  };
  setModalVisible(a,b) {
    if (a==0 && b==0){
      this.setState({render:true});
      this.setState({element:"No Location Infomation"});
      return;
    }

    if (!this.state.render){

    var NY = {
      lat: a,
      lng: b
    };


    Geocoder.geocodePosition(NY).then(res => {
      
      var best="";
      for (i=0;i<res.length;i++){
        if (res[i]['adminArea']!=null){
            if (res[i]['formattedAddress'].length>best.length)
              best=res[i]['formattedAddress'];
        }
      }
      this.setState({render:true});
      this.setState({element:best});
  })
  .catch(err => {console.log("map",err)


})
  }
}

  render() {
    const { navigation, product, horizontal, full, style, priceColor, imageStyle } = this.props;

    if (!this.state.render&&Platform.OS === 'android'){
      this.setModalVisible(product.lat,product.long);
    }
      
    return (

      <Block row={horizontal} card flex style={[styles.product, styles.shadow, style]}>

          <Block flex style={[styles.imageContainer, styles.shadow]}>
            <MapView pitchEnabled={false} rotateEnabled={false} zoomEnabled={false} scrollEnabled={false}
              customMapStyle={mapStyle}
              style={styles.fullImage}
              initialRegion={{
                latitude: product.lat,
                longitude: product.long,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
              }}
            >
              <Marker coordinate={{ latitude: product.lat, longitude: product.long }} />
            </MapView>
            

          </Block>

          <TouchableWithoutFeedback onPress={() => this.setModalVisible(product.lat,product.long)}>
          
        <Block flex space="between" style={styles.productDescription}>
            <Text size={14} style={styles.productTitle}>Peak: {product.maxlight}lux {product.maxnoise}dB      Avearge: {product.avglight}lux {product.avgnoise}dB</Text>
            <Text size={12} style={{ fontWeight: 'bold'}} color={priceColor}>Time: {product.date}</Text>
            <Text size={12} style={{ fontWeight: 'bold'}} color={priceColor}>R: {product.r} G: {product.g} B: {product.b} Temperature: {product.temperature}°C Humidity: {product.humidity}%</Text>
            <Text size={12} style={{ fontWeight: 'bold'}} color={priceColor}>
              {
                this.state.element
              }
            </Text>
          </Block>
          </TouchableWithoutFeedback>


      </Block>
    );
  }
}

export default withNavigation(Product);

const styles = StyleSheet.create({
  product: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
    alignItems:'center',
    padding:5,
    margin:8,
  },
  map: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
  },
  productTitle: {
    flex: 1,
    flexWrap: 'wrap',
    paddingBottom: 6,
    fontWeight: 'bold' ,
  },
  productDescription: {
    padding: theme.SIZES.BASE / 2,
  },
  imageContainer: {
    elevation: 1,
  },
  image: {
    borderRadius: 3,
    marginHorizontal: theme.SIZES.BASE / 2,
    marginTop: -16,
  },
  horizontalImage: {
    height: 122,
    width: 'auto',
  },
  fullImage: {
    height: 215,
    width: width - theme.SIZES.BASE * 3,
    alignContent: 'center',
    marginLeft: 4,
    marginRight:4,
    marginTop: 3

  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});