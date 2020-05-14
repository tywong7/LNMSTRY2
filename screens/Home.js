import React from 'react';
import { StyleSheet, Dimensions,View, ActivityIndicator, Platform,FlatList } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import { Product } from '../components/';
const { width } = Dimensions.get('screen');
import { TabView, TabBar } from 'react-native-tab-view';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationEvents } from 'react-navigation';
import BackgroundFetch from "react-native-background-fetch";
import { stringToBytes } from 'convert-string';
import NotifService from '../components/NotifService';

const renderLight = (fetchArray) => {
  
  if (fetchArray == null)
  {
    return (
      <Text size={16} key={"Auto0"} style={{ alignSelf: 'center', alignItems: 'center' }}>No Data. Go Settings to turn on Auto Detect.</Text>)
    
  }  
  else{
    return (
      <FlatList
      data={fetchArray}
      renderItem={({ item }) => <Product key={item.date} product={item} full />}
      keyExtractor={item => item.date}
    />)
  }

}

const renderNoise = (fetchArray) => {


  if (fetchArray == null)
   { 
     return (
      <Text size={16} key={"Ins0"} style={{ alignSelf: 'center', alignItems: 'center' }}>
        No Data. Click "Instant Measure" to start.
      </Text>
    
     )
   }
  else
{   
  return (
    <FlatList
    data={fetchArray}
    renderItem={({ item }) => <Product key={item.date} product={item} full />}
    keyExtractor={item => item.date}
  />)
 
}

}

export default class Home extends React.Component {
  constructor() {
    super();
    this.notif = new NotifService(this.onRegister.bind(this), this.onNotif.bind(this));


  }
  onRegister(token) {
    console.log(token);
  }
  onNotif(notif) {
    this.props.navigation.navigate('InsMeasure');
  }
  state = {
    index: 0,
    routes: [
      { key: 'light', title: 'INSTANT MEASURE', icon: 'map' },
      { key: 'noise', title: 'AUTO MEASURE' },
    ],
    element: [],
    autoelement: [],
    isLoading: true,
    test: Math.random(),
  };


  onFocus = async () => {
    let asyncValue = await AsyncStorage.getItem('InsData');
    let objFromAsyncValue = JSON.parse(asyncValue);
    this.setState({
      element: objFromAsyncValue
    })

    asyncValue = await AsyncStorage.getItem('AutoData');
    objFromAsyncValue = JSON.parse(asyncValue);
    this.setState({
      autoelement: objFromAsyncValue
    })
    //console.log("88");
  }

  componentDidMount() {
    AsyncStorage.getItem('Interval').then((token) => {
      var interval= parseInt(token);
    AsyncStorage.getItem('Auto Decect').then((token) => {

      if (token == "true") {
         try{
          BackgroundFetch.configure({
            minimumFetchInterval: interval,
            forceAlarmManager: false,
            stopOnTerminate: false,
            startOnBoot: false,
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
          }, async (taskId) => {
            console.log("[js] Received background-fetch event: ", taskId);


            if (global.BluetoothManager.isConnected)
            global.BluetoothManager.startNotification(0)
            .then(() => {
              global.BluetoothManager.write(stringToBytes('a'), 1)
                .then(() => {
                })
                .catch(err => {
                  console.log(err)
                  this.alert('Failed to send');
                })

            }).catch(err => {
              console.log("error");
              this.notif.localNotif("Connection Error: Please check the device connectivity at Instant Measure.")
            })
            else {console.log("dummy");
            this.notif.localNotif("Connection Error: Please check the device connectivity at Instant Measure.")}

            // Remember to call finish()
            BackgroundFetch.finish(taskId);
          }, (error) => {
            console.log("[js] RNBackgroundFetch failed to start");
          });

          BackgroundFetch.status((status) => {
            switch (status) {
              case BackgroundFetch.STATUS_RESTRICTED:
                console.log("BackgroundFetch restricted");
                break;
              case BackgroundFetch.STATUS_DENIED:
                console.log("BackgroundFetch denied");
                break;
              case BackgroundFetch.STATUS_AVAILABLE:
                console.log("BackgroundFetch is enabled");
                break;
            }
          });
        }
          catch (err){
            console.log("ohno",err);
          }



          BackgroundFetch.status((status) => {
            switch (status) {
              case BackgroundFetch.STATUS_RESTRICTED:
                console.log("BackgroundFetch restricted");
                break;
              case BackgroundFetch.STATUS_DENIED:
                console.log("BackgroundFetch denied");
                break;
              case BackgroundFetch.STATUS_AVAILABLE:
                console.log("BackgroundFetch is enabled");
                break;
            }
          });



        }

      }
      );

    });
    AsyncStorage.getItem('AutoData').then((token) => {

      this.setState({

        autoelement: JSON.parse(token)
      });
    });
    AsyncStorage.getItem('InsData').then((token) => {
      if (token != null)
        AsyncStorage.setItem('temp', token);

      this.setState({
        isLoading: false,
        element: JSON.parse(token)
      });
    });
    //console.log("DidMount");
  }


  FirstRoute = () => {
    return (
      <Block key={'InsBlock'} flex center style={styles.home}>

        {renderNoise(this.state.element)}
      </Block>


    )
  }

  AutoRoute = () => {
    return (
      <Block key={'AutoBlcok'} flex center style={styles.home}>

        {renderLight(this.state.autoelement)}
      </Block>


    )
  }


  renderTabBar(props) {

    return (<TabBar
      style={{ backgroundColor: '#FFFFFF' }}
      labelStyle={{ color: 'black', fontWeight: 'bold' }}
      {...props}
      indicatorStyle={{ backgroundColor: '#9c26b0' }}
    />
    );
  }

  forceUpdateHandler() {
    this.setState({ test: Math.random(), element: null });

  };
  render() {
    const { navigation, horizontal } = this.props;
    if (this.state.isLoading) {
      var size = 1;
      if (Platform.OS == 'android')
        size = 80;
      return (<View style={{ alignSelf: 'center', alignItems: 'center', justifyContent: 'center', flex: 1 }}><ActivityIndicator size={size} color="#0000ff" /><Text size={30}>Loading...</Text></View>)
    }
    return (


      [
        <NavigationEvents key={'HomeNav'} onDidFocus={console.log('reload')} onWillFocus={this.onFocus} />,
        <TabView
        key={'HomeTabView'}
          renderTabBar={this.renderTabBar}
          navigationState={this.state}
          renderScene={({ route }) => {
            switch (route.key) {
              case 'light':
                return this.FirstRoute();
              case 'noise':
                return this.AutoRoute();

              default:
                return null;
            }
          }}
          onIndexChange={index => this.setState({ index })}

        />]

    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 4,
    zIndex: 2,
  },
  tabs: {
    marginBottom: 0,
    marginTop: 0,
    elevation: 4,
  },
  tab: {
    backgroundColor: theme.COLORS.WHITE,
    width: width * 0.50,
    borderRadius: 0,
    borderWidth: 0,
    height: 50,
    elevation: 0,
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: '300'
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.MUTE,
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 1.2,
  },
});
