import React from 'react';
import { StyleSheet, Dimensions, ScrollView, ImageBackground, Platform, TouchableOpacity,ActivityIndicator } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../components';
import { Images, materialTheme } from '../constants';
import { HeaderHeight } from "../constants/utils";
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationEvents } from 'react-navigation';
const { width, height } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;


function addComponent(number, list) {
  console.log(list);
  average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
  var arr = [];
  if (list != null) {
    

    for (var i = list.length - 1; i >= list.length - 3; i--) {
      if (list[i]==null)
      break;
      var label=[];
      for (var x=parseInt(list[i].From)+1;x<=parseInt(list[i].To);x++){
        label.push(x);
      }
      arr.push(
        <Block key={'Profile'+i} card flex style={[styles.product, styles.shadow]}>
          <Text size={16}> Date: {list[i].Date}</Text>
          <Text size={16}> Time: {list[i].From}-{list[i].To}  </Text>
          <Text size={16}> Total: {parseInt(list[i].To) - parseInt(list[i].From)} hours </Text>
          <Text size={16}> Peak: {Math.max.apply(Math, list[i].NoiseValue)} dB, {Math.max.apply(Math, list[i].LightValue)} lux</Text>
          <Text size={16}> Average: {Math.round(this.average(list[i].NoiseValue))} dB, {Math.round(this.average(list[i].LightValue))} lux</Text>
          <Text size={16}> Quality: {list[i].Quality}</Text>
          <LineChart
          data={{
            labels: label,
            datasets: [
              {
                data: list[i].LightValue,
                strokeWidth: 2,
                color: (opacity = 1) => `rgba(255, 255, 4, ${opacity})`
              },
              {
                data: list[i].NoiseValue,
                strokeWidth: 2,
              }
            ],
          }}
          width={Dimensions.get('window').width - 80}
          height={220}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
              margin: 18,
            },
          }}
          style={{
            alignSelf:'center',
            borderRadius: 16,
          }}
        />
        </Block>
      )
    }
  }
  return arr;

}

export default class Profile extends React.Component {
  state = {
    good: 0,
    normal: 0,
    bad: 0,
    element: null,
    isLoading:true,
    empty:false,

  };
  onFocus = async () => {
    let asyncValue = await AsyncStorage.getItem('SleepData');
    if(asyncValue!=null){
      console.log("91");
      this.setState({ empty:false});
    let data = JSON.parse(asyncValue);
    this.setState({ good: data['good'] });
    this.setState({ normal: data['normal'] });
    this.setState({ bad: data['bad'] });
    this.setState({ element: data['data'] });

  }
  else {
    this.setState({ empty:true});
  }
}
  componentDidMount() {

    AsyncStorage.getItem('SleepData').then((token) => {
      if (token){
        let data = JSON.parse(token)
      this.setState({ good: data['good'] });
      this.setState({ normal: data['normal'] });
      this.setState({ bad: data['bad'] });
      this.setState({ element: data['data'] });
      this.setState({ isLoading: false });
      }
      else{
        this.setState({ empty:true  });
      }
    })
  }
  render() {
      var item1=[]
      
      if (this.state.empty){
        item1.push(
          
          <Block style={{ alignSelf: 'center', alignItems: 'center',justifyContent: 'center',flex:1 }}><Text size={30}>No Record.</Text>
          </Block>
          )
      }
      else if (this.state.isLoading)
        item1.push(
          <Block style={{ alignSelf: 'center', alignItems: 'center',justifyContent: 'center',flex:1 }}><ActivityIndicator size="large" color="#0000ff" /><Text size={30}>Loading...</Text></Block>
          )
      else 
        item1.push(
          <ScrollView showsVerticalScrollIndicator={false}>
            <Block row space="between" style={{ padding: theme.SIZES.BASE, }}>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => this.props.navigation.navigate('ViewAll',{quality:'good'})}
                style={{ alignItems: 'center' }}
              >
                <Text bold size={12} style={{ marginBottom: 8 }}>{this.state.good}</Text>
                <Text muted size={12}>Good Quality</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => this.props.navigation.navigate('ViewAll',{quality:'normal'})}
                style={{ alignItems: 'center' }}
              >
                <Text bold size={12} style={{ marginBottom: 8 }}>{this.state.normal}</Text>
                <Text muted size={12}>Normal Quality</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => this.props.navigation.navigate('ViewAll',{quality:'bad'})}
                style={{ alignItems: 'center' }}
              >
                <Text bold size={12} style={{ marginBottom: 8 }}>{this.state.bad}</Text>
                <Text muted size={12}>Bad Quality</Text>
              </TouchableOpacity>
            </Block>
            <Block row space="between" style={{ paddingVertical: 16, alignItems: 'baseline' }}>
              <Text size={16} style={{ fontWeight: 'bold' }} >Recent Record</Text>
              <Text size={16} style={{ fontWeight: 'bold' }} color={theme.COLORS.PRIMARY} onPress={() => this.props.navigation.navigate('ViewAll')}>View All</Text>
            </Block>
            <Block style={{ paddingBottom: -HeaderHeight * 2 }}>
              <Block space="between" style={{ flexWrap: 'wrap' }} >
                {addComponent(3, this.state.element)}



                <Block card flex style={[styles.product, styles.shadow]}>

                </Block>
              </Block>
            </Block>
          </ScrollView>
        )
    return (
      
      <Block flex style={styles.profile}>
        <NavigationEvents onDidFocus={console.log("")} onWillFocus={this.onFocus}/>
        <Block flex>
          <ImageBackground
            source={{ uri: Images.Profile }}
            style={styles.profileContainer}
            imageStyle={styles.profileImage}>
            <Block flex style={styles.profileDetails}>
              <Block style={styles.profileTexts}>
                <Text color="purple" size={28} style={{ paddingBottom: 8 }}>John Doe</Text>
                <Block row space="between">
                  <Block row>

                  </Block>
                  <Block>
                    <Text color={theme.COLORS.MUTED} size={16}>
                      <Icon name="map-marker" family="font-awesome" color={theme.COLORS.MUTED} size={16} />
                      {` `} SHB, CUHK
                      </Text>
                  </Block>
                </Block>
              </Block>
              <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']} style={styles.gradient} />
            </Block>
          </ImageBackground>
        </Block>
        <Block flex style={styles.options}>
          {item1}
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
    marginBottom: -HeaderHeight * 2,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    shadowOpacity: 0.3,
    elevation: 2,
  },
  product: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0.5,
    minHeight: 114,


  },
  profileImage: {
    width: width * 1.1,
    height: 'auto',
  },
  profileContainer: {
    width: width,
    height: height / 2,
  },
  profileDetails: {
    paddingTop: theme.SIZES.BASE * 4,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  profileTexts: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 2,
    zIndex: 2
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: theme.SIZES.BASE / 2,
    borderRadius: 4,
    height: 19,
    width: 38,
  },
  seller: {
    marginRight: theme.SIZES.BASE / 2,
  },
  options: {
    position: 'relative',
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: -theme.SIZES.BASE * 7,
    borderRadius: 13,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: 'center',
    width: thumbMeasure,
    height: thumbMeasure
  },
  gradient: {
    zIndex: 1,
    left: 0,
    right: 0,
    bottom: 0,
    height: '5%',
    position: 'absolute',
  },
});
