import React from 'react';
import { StyleSheet, Dimensions, ScrollView, View, Button, ActivityIndicator, Platform } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import { Product } from '../components/';
const { width } = Dimensions.get('screen');
import { TabView, TabBar } from 'react-native-tab-view';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationEvents } from 'react-navigation';
import firestore, { firebase } from '@react-native-firebase/firestore';
import BackgroundFetch from "react-native-background-fetch";
import { stringToBytes } from 'convert-string';
import NotifService from '../components/NotifService';
const renderLight = (fetchArray) => {

  var pushlist = []
  if (fetchArray == null)
    pushlist = [<Text size={16} key={"Auto0"} style={{ alignSelf: 'center', alignItems: 'center' }}>No Data. Go Settings to turn on Auto Detect.</Text>
    ]
  else
    for (i = 0; i < fetchArray.length; i++) {
      pushlist.push(<Product key={"AutoN" + i} product={fetchArray[i]} full />
      )
    }
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.products}>
      <Block flex>
        {pushlist}
      </Block>
    </ScrollView>
  )
}

const renderNoise = (fetchArray) => {

  var pushlist = []
  if (fetchArray == null)
    pushlist = [<Text size={16} key={"Ins0"} style={{ alignSelf: 'center', alignItems: 'center' }}>No Data. Click "Instant Measure" to start.</Text>,
    <Button key={"Ins0Button"} title="restore" onPress={() => {
      AsyncStorage.getItem('temp').then((token) => {
        AsyncStorage.setItem('InsData', token);

      });
    }}></Button>,

    ]
  else
    for (i = 0; i < fetchArray.length; i++) {
      pushlist.push(<Product key={"InsN" + i} product={fetchArray[i]} full />
      )
    }
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.products}>
      <Block flex>
        {pushlist}
      </Block>
    </ScrollView>
  )
}



export default class Home extends React.Component {
  constructor() {
    super();

    this.notif = new NotifService(this.onRegister.bind(this), this.onNotif.bind(this));
  }
  onRegister(token) {
    //Alert.alert("Registered !", JSON.stringify(token));
    console.log(token);
    //this.setState({ registerToken: token.token, gcmRegistered: true });
  }
  onNotif(notif) {
    this.props.navigation.navigate('InsMeasure');
    //Alert.alert(notif.title, notif.message);
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
<<<<<<< HEAD

      var interval = parseInt(token);
      AsyncStorage.getItem('Auto Decect').then((token) => {

        if (token == "true") {
=======
    
      var interval= parseInt(token);
    AsyncStorage.getItem('Auto Decect').then((token) => {

      if (token == "true") {
        console.log("haha");
         try{
>>>>>>> d15fbe5860cf9783147c40f4eefffd18a76e1b2a
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
              global.BluetoothManager.write(stringToBytes('201'), 1)
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
<<<<<<< HEAD
=======
  
  
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

>>>>>>> d15fbe5860cf9783147c40f4eefffd18a76e1b2a


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
      <Block flex center style={styles.home}>

        {renderNoise(this.state.element)}
      </Block>


    )
  }

  AutoRoute = () => {
    return (
      <Block flex center style={styles.home}>

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
        <NavigationEvents onDidFocus={console.log('reload')} onWillFocus={this.onFocus} />,
        <TabView
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
