import React from 'react';
import { StyleSheet, Dimensions, ScrollView, ImageBackground, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
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


function addComponent(list) {


  var arr = [];
  if (list != null) {


    for (var i = list.length - 1; i >= list.length - 3; i--) {
      if (list[i] == null)
        break;
      //console.log(2555,list[i].SleepValue,list[i].NoiseValue,list[i].LightValue);
      arr.push(
        <Block key={'Profile' + i} card flex style={[styles.product, styles.shadow]}>
          <Text size={16}> Date: {list[i].Date}</Text>
          <Text size={16}> Time: {list[i].Hour} </Text>
          <Text size={16}> Total: {list[i].AcutalSleep}</Text>
          <Text size={16}> Quality: {list[i].Quality + list[i].DetailQ}</Text>
          <Text size={16}> Efficiency: {list[i].Efficiency} </Text>
          <Text size={16}> {list[i].maxavg}</Text>

          <LineChart
            bezier
            withDots={false}
            withShadow={false}
            withInnerLines={false}
            withOuterLines={false}
            width={Dimensions.get('window').width - 30}
            height={Dimensions.get('window').height * 0.32}
            data={{
              labels: list[i].label,
              legend: ["Sleep Stage", "Light", "Noise"],
              datasets: [

                {
                  data: list[i].SleepValue,

                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
                },
                {
                  data: list[i].LightValue,
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`
                },
                {
                  data: list[i].NoiseValue,

                  color: (opacity = 1) => `rgba(255, 237, 0, ${opacity})`
                }

              ]
            }}
            // from react-nativ
            verticalLabelRotation={0}
            // optional, defaults to 1
            fromZero={true}
            chartConfig={{
              backgroundColor: "#000000",
              backgroundGradientFrom: "#000000",
              backgroundGradientTo: "#000000",
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726"
              }
            }}

            style={{
              marginVertical: 8,
              borderRadius: 16
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
    isLoading: true,
    empty: false,
    username: "USER",
    avatar: "https://www.cuhk.edu.hk/english/images/fav-icons/mstile-310x310.png",

  };
  onFocus = async () => {
    let asyncValue = await AsyncStorage.getItem('SleepData');
    if (asyncValue != null) {

      this.setState({ empty: false });
      let data = JSON.parse(asyncValue);
      //console.log(data);
      this.setState({ good: data['good'] });
      this.setState({ normal: data['normal'] });
      this.setState({ bad: data['bad'] });
      this.setState({ element: data['data'] });

    }
    else {
      this.setState({ empty: true });
    }

  }
  componentDidMount() {
    AsyncStorage.getItem('userName').then((token) => {
      //console.log(token);
      this.setState({ username: token });
    })
    AsyncStorage.getItem('userAvatar').then((token) => {
      if (token) {
        fetch(token)
          .then(res => {
            //console.log(res.status);
            if (res.status == 200) {
              this.setState({ avatar: token });
            }
          })
      }


    })
    AsyncStorage.getItem('SleepData').then((token) => {
      if (token) {
        //console.log(token);
        let data = JSON.parse(token)
        this.setState({ good: data['good'] });
        this.setState({ normal: data['normal'] });
        this.setState({ bad: data['bad'] });
        this.setState({ element: data['data'] });
        this.setState({ isLoading: false });
      }
      else {
        this.setState({ empty: true });
      }
    })
  }
  render() {
    const { avatar } = this.state;
    var item1 = []

    if (this.state.empty) {
      item1.push(

        <Block key={'ProfileEmpty'} style={{ alignSelf: 'center', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Text size={30}>No Record.</Text>
        </Block>
      )
    }
    else if (this.state.isLoading)
      item1.push(
        <Block key={'ProfileLoading'} style={{ alignSelf: 'center', alignItems: 'center', justifyContent: 'center', flex: 1 }}><ActivityIndicator size="large" color="#0000ff" /><Text size={30}>Loading...</Text></Block>
      )
    else
      item1.push(
        <ScrollView key={'ProfileList'} showsVerticalScrollIndicator={false}>
          <Block row space="between" style={{ padding: theme.SIZES.BASE, }}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.props.navigation.navigate('ViewAll', { quality: 'good' })}
              style={{ alignItems: 'center' }}
            >
              <Text bold size={12} style={{ marginBottom: 8 }}>{this.state.good}</Text>
              <Text muted size={12}>Good Quality</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.props.navigation.navigate('ViewAll', { quality: 'normal' })}
              style={{ alignItems: 'center' }}
            >
              <Text bold size={12} style={{ marginBottom: 8 }}>{this.state.normal}</Text>
              <Text muted size={12}>Normal Quality</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.props.navigation.navigate('ViewAll', { quality: 'bad' })}
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
              {addComponent(this.state.element)}



              <Block card flex style={[styles.product, styles.shadow]}>

              </Block>
            </Block>
          </Block>
        </ScrollView>
      )
    return (

      <Block flex style={styles.profile}>
        <NavigationEvents onDidFocus={null} onWillFocus={this.onFocus} />
        <Block flex>
          <ImageBackground
            source={avatar ? { uri: avatar } : ""}
            style={styles.profileContainer}
            imageStyle={styles.profileImage}>
            <Block flex style={styles.profileDetails}>
              <Block style={styles.profileTexts}>
                <Text color="purple" size={28} style={{ paddingBottom: 8 }}>{this.state.username}</Text>
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
    padding: theme.SIZES.BASE - 10,
    marginHorizontal: theme.SIZES.BASE - 10,
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
