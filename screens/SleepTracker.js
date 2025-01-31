

import React from 'react';
import { StyleSheet, Text, View, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import * as AppAuth from 'expo-app-auth';
import { LineChart, PieChart } from 'react-native-chart-kit';

import { Block, Checkbox, Button } from 'galio-framework';
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
import { stringToBytes } from 'convert-string';
var item = [];
export default class SleepTracker extends React.Component {


  state = {
    authState: null,
    ele: [],
    ele2: [],
    data: [],
    lightdata: [],
    noisedata: [],
    temp: [],
    label: [1, 2, 3, 4, 5, 6, 7, 8],
    templight: [],
    tempnoise: [],
    outString: "",
    light: false,
    noise: false,
    stage: false,
    firstCall: true,
    loadLogin: true,
    sleepData: null,
  };

  constructor(props) {
    super(props);

  }

  async componentDidMount() {

    let cachedAuth = await this.getCachedAuthAsync();
    console.log("look", cachedAuth, this.state.authState);
    if (cachedAuth && !this.state.authState) {

      this.setState({ authState: cachedAuth });

    }

    let asyncValue = await AsyncStorage.getItem('SleepData');
    if (asyncValue != null) {
      this.state.sleepData = JSON.parse(asyncValue);
    }
    else {
      this.state.sleepData ={"good":0,"normal":0,"bad":0,"data":[]}; 
      await AsyncStorage.setItem('SleepData',JSON.stringify({"good":0,"normal":0,"bad":0,"data":[]}))
  };
  }
  wait=(timeout) =>{
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}
  refreshAuthAsync = async ({ refreshToken }, param) => {
    //console.log(refreshToken);
    const { navigation } = this.props;
   if (param == 2 && !global.BluetoothManager.isConnected) {
      Alert.alert(
        'Failed to sync',
        'Please check your device connectivity.',
        [

          { text: 'CHECK Device', onPress: () => navigation.navigate('InsMeasure') },
          { text: 'OK' }
        ],
        { cancelable: true }
      )
      return
    }
    else {
    if (param == 2)
        await global.BluetoothManager.startNotification(0)
            .then(() => {
              global.BluetoothManager.write(stringToBytes('s'), 1)
                .then(() => {
                })
                .catch(err => {
             
                  this.alert('Failed to send');
                })

            }).catch(err => {
              console.log("error",err);
              //this.notif.localNotif("Connection Error: Please check the device connectivity at Instant Measure.")
            })
          
      }
    await this.wait(4);
    let authState = await AppAuth.refreshAsync(config, refreshToken);
   
   await this.getData(authState.accessToken, param);

    await this.cacheAuthAsync(authState);
    return authState;
  }

  signInAsync = async () => {
    console.log('signInAsyncBegin');
    let authState = await AppAuth.authAsync(config);
    Alert.alert(
      'Signed In',
      'You have been signed in successfully',
      [

        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: true }
    )
    await this.cacheAuthAsync(authState);

    this.setState({ loadLogin: false });

    return authState;
  }

  cacheAuthAsync = async (authState) => {
    return await AsyncStorage.setItem(StorageKey, JSON.stringify(authState));
  }

  getCachedAuthAsync = async () => {
    let value = await AsyncStorage.getItem(StorageKey);
    let authState = JSON.parse(value);
    //console.log('getCachedAuthAsync', authState);
    if (authState) {
      this.setState({ loadLogin: false })
      if (this.checkIfTokenExpired(authState)) {
        console.log("expired", authState);
        return await this.refreshAuthAsync(authState, 1);
      } else {
        //console.log("still valid");
        return authState;
      }
    }
    return null;
  }

  checkIfTokenExpired = ({ accessTokenExpirationDate }) => {
    console.log(accessTokenExpirationDate);
    var dateOffset = (8 * 60 * 60 * 1000) //5 days
    var d = new Date(accessTokenExpirationDate);
    d.setTime(d.getTime() - dateOffset);
    return d < new Date();
  }



  signOutAsync = async () => {
    

   try {
      await AppAuth.revokeAsync(config, {
        token: this.state.authState.accessToken,
        isClientIdProvided: true,
      });
      this.setState({ loadLogin: true, ele: [], ele2: [], firstCall: true });

      Alert.alert(
        'Signed Out',
        'You have been signed out successfully',
        [

          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: true }
      )
      //console.log("revoked");
     this.setState({ authState: null });;
      await AsyncStorage.removeItem(StorageKey);

      return null;
    } catch (e) {
      alert(`Failed to revoke token: ${e.message}`);
    }
  }
  timeConvert = (n) => {
    //console.log(n);
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + ' hrs ' + rminutes + " mins";
  }
  calQuality = (time, efficiency, deep, rem, timeInBed) => {
    // time > 7 hour 1 point
    //efficiency>85 1 point
    //ratio normal 1 point
    // 3 point:good 2 point: normal 1 point:bad
    var point = 0;
    var outString = '';
    if (time >= 420)
      point += 1;
    else outString = '; Insuffient Sleep Hour';
    if (efficiency >= 85)
      point += 1;
    else outString += '; Low efficiency'
    var deepr = deep / timeInBed * 100;
    var remr = rem / timeInBed * 100;
    if (deepr >= 10 && deepr <= 25 && remr >= 20 && remr <= 25)
      point += 1;
    else outString += '; Low rem or deep stage ratio'
    if (point == 3) {
      if (this.state.sleepData["good"] == null)
        this.state.sleepData["good"] = 1;
      else this.state.sleepData["good"] += 1;
      return "good"
    }
    else if (point == 2) {
      if (this.state.sleepData["normal"] == null)
        this.state.sleepData["normal"] = 1;
      else this.state.sleepData["normal"] += 1;
      return "normal" + outString
    }
    else {
      if (this.state.sleepData["bad"] == null)
        this.state.sleepData["bad"] = 1;
      else
        this.state.sleepData["bad"] += 1; return "bad" + outString
    }
  }
  showData = (option) => {
    if (this.state.firstCall) {
      this.setState({ firstCall: false })
    }
    else {
      if (option == 0) {
        if (!this.state.noise) {
          
          this.setState({ noisedata: [] });
        }
        else {
         // console.log(this.state.tempnoise);
          this.setState({ noisedata: this.state.tempnoise });
        }
        this.setState({ noise: !this.state.noise });
      }
      else if (option == 1) {
        if (!this.state.light) {
          this.setState({ lightdata: [] });
        }
        else {
        //  console.log(this.state.templight);
          this.setState({ lightdata: this.state.templight });
        }
        this.setState({ light: !this.state.light });
      }
      else {

        if (!this.state.stage) {
          this.setState({ data: [] });
        }
        else {
        //  console.log(this.state.temp);
          this.setState({ data: this.state.temp });
        }
        this.setState({ stage: !this.state.stage });

      }
    }
  }
  average = arr => arr.reduce((p, c) => p + c, 0) / (arr.length - 1);
  dataFormatter = (data,param) => {
    var sum=0;
    var intervalList=[];
    var noisedata1=[];
    var lightdata1=[];
    data.forEach(element => {
      sum=sum+ Math.round(element.seconds/(5*60));
      intervalList.push(sum);
    }
      );

      try{
        AsyncStorage.getItem('DailySleep').then((token) => {
          var sleepData=JSON.parse(token);
          var timestamp=new Date(data[0].dateTime).getTime()/1000;
          var firstEle=0;
          //console.log("mystamp",timestamp);
          //console.log(sleepData);
          for (i=0;i<sleepData.length;i++){
            if (sleepData[i][0]>=timestamp-10 &&sleepData[i][0]<=timestamp +10){
              
              firstEle=i;
              if (sleepData[i][0]==timestamp)
                break;
          
            }
          }
         intervalList.forEach(x=>{
          lightdata1.push(sleepData[firstEle+x][1]);
          noisedata1.push(sleepData[firstEle+x][2]);
           
         })
        
          if (param == 1) {
            var outString="Max: " + Math.max.apply(Math, lightdata1) + "lux " + Math.max.apply(Math, noisedata1) + "dB    Avg: " + Math.round(this.average(lightdata1)) + "lux " + Math.round(this.average(noisedata1)) + "dB"
      var chunk = Math.ceil(data.length / 8);
      var label = [];
      var dataOut = [];
      var lightOut = [];
      var noiseOut = [];
      for (i = 0; i < data.length; i += chunk) {
        label.push(data[i]['dateTime'].substring(11, 16));
      }
      data.forEach(element => {
        if (element['level'] == 'wake')
          dataOut.push(4);
        else if (element['level'] == 'rem')
          dataOut.push(3);
        else if (element['level'] == 'light')
          dataOut.push(2);
        else if (element['level'] == 'deep')
          dataOut.push(1);
      });
      noisedata1.forEach(element => {
        if (element >= 100)
          noiseOut.push(4);
        else if (element >= 80)
          noiseOut.push(3);
        else if (element >= 55)
          noiseOut.push(2);
        else noiseOut.push(1);
      });
      lightdata1.forEach(element => {
        if (element >= 1750)
          lightOut.push(4);
        else if (element >= 1500)
          lightOut.push(3);
        else if (element >= 500)
          lightOut.push(2);
        else lightOut.push(1);
      });

    }
   
    
    this.setState({outString: outString, label: label, data: dataOut, temp: dataOut, lightdata: lightOut, templight: lightOut, noisedata: noiseOut, tempnoise: noiseOut })
    this.state.sleepData['data'][this.state.sleepData['data'].length-1]['LightValue']=lightOut;
    this.state.sleepData['data'][this.state.sleepData['data'].length-1]['NoiseValue']=noiseOut;
    this.state.sleepData['data'][this.state.sleepData['data'].length-1]['SleepValue']=dataOut;
    this.state.sleepData['data'][this.state.sleepData['data'].length-1]['SleepValue']=dataOut;
    this.state.sleepData['data'][this.state.sleepData['data'].length-1]['maxavg']=outString;
    this.state.sleepData['data'][this.state.sleepData['data'].length-1]["label"]=label;
     AsyncStorage.setItem("SleepData", JSON.stringify(this.state.sleepData));
        })
    }
    catch{
      console.log("no sleep Data")
    };

      
   
  }
  getData = async (access_token, param) => {
    //console.log(param);
    if (param == 1) {
      var api = "https://api.fitbit.com/1/user/-/profile.json";
    }
    else {
      var api = "https://api.fitbit.com/1.2/user/-/sleep/list.json?afterDate=2017-03-27&sort=desc&offset=0&limit=1"
    }
    fetch(
      api,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`
        },
        //body: `root=auto&path=${Math.random()}`

      }
    ).then((res) => {
      return res.json()
    }).then(async (res) => {
      //console.log(res);
      
      if (param == 1) {
        AsyncStorage.setItem("userName", res.user.fullName);
        AsyncStorage.setItem("userGender", res.user.gender);
        AsyncStorage.setItem("userAvatar", res.user.avatar640);
      }
      else {
        this.dataFormatter(res['sleep'][0]['levels']['data'],1);
        var efficiency = res['sleep'][0]['efficiency'];
        var minutesAsleep = res['sleep'][0]['minutesAsleep'];
        var timeInBed = res['sleep'][0]['timeInBed'];
        var deep = res['sleep'][0]['levels']['summary']['deep']['minutes'];
        var light = res['sleep'][0]['levels']['summary']['light']['minutes'];
        var rem = res['sleep'][0]['levels']['summary']['rem']['minutes'];
        var wake = res['sleep'][0]['levels']['summary']['wake']['minutes'];
        var temp = res['sleep'][0]['startTime'].substring(0, 16).replace('T', ' ') + '-' + res['sleep'][0]['endTime'].substring(11, 16);
        var quality = this.calQuality(minutesAsleep, efficiency, deep, rem, timeInBed);
        this.state.sleepData['data'].push(
          {
            "Date": temp.substring(0, 10).replace(/-/g, '/')
            , "Quality": quality.substring(0, quality.indexOf(';')),
            "label": this.state.label,
            "DetailQ": quality.substring(quality.indexOf(';')),
            "Hour": temp.substring(11),
            "AcutalSleep": this.timeConvert(minutesAsleep),
            "maxavg": this.state.outString,
            "LightValue": this.state.templight,
            "NoiseValue": this.state.tempnoise,
            "SleepValue": this.state.temp,
            "Efficiency": efficiency,
            "ratio":[deep,light,rem,wake],
          }
        )

       
        this.setState({
          ele2: [
            <Text style={{ fontSize: 17, fontWeight: 'bold', marginLeft: 3 }}>Sleep Summary: {temp}  </Text>,
            <Block card width={screenWidth * 0.95} style={{ alignSelf: 'flex-start', marginLeft: 3 }}>
              <Text>Time Asleep: {this.timeConvert(minutesAsleep)}       Efficiency: {efficiency}</Text>
              <Text>Quality: {quality}</Text>
            </Block>
          ]
        })
        this.setState({
          ele:
            [

              <View style={{ alignSelf: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', width: screenWidth * 0.5, paddingBottom: 5 }}>
                <Text>Showing:       </Text>
                <Checkbox color="#c4c4c4" initialValue={true} label='Sleep' style={{ marginLeft: 5 }} onChange={() => this.showData(2)} />

                <Checkbox color="red" initialValue={true} label='Light' style={{ marginLeft: 5 }} onChange={() => this.showData(1)} />
                <Checkbox color="#e2db00" initialValue={true} label='Noise' style={{ marginLeft: 5 }} onChange={() => this.showData(0)} />

              </View>,


              <PieChart
                data={[
                  {
                    name: "Deep(" + deep + " mins)",
                    population: deep,
                    color: "#154BA6",
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12
                  },
                  {
                    name: "Light(" + light + " mins)",
                    population: light,
                    color: "#3F8DFF",
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12
                  },
                  {
                    name: "Rem(" + rem + " mins)",
                    population: rem,
                    color: "#7EC4FF",
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12
                  },
                  {
                    name: "Awake(" + wake + " mins)",
                    population: wake,
                    color: "#E73360",
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12
                  }
                ]}
                chartConfig={{


                  barRadius: 5,
                  decimalPlaces: 0, // optional, defaults to 2dp
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,


                }}
                style={{
                  borderRadius: 16
                }

                }
                width={screenWidth * 0.95}
                height={screenHeight * 0.2}
                accessor="population"
                backgroundColor="#201842"


              />]
        });

      }


    }).catch((err) => {
      console.error('Error: ', err);
    });
  }
  render() {
    return (
      <View style={styles.container}>

        {this.state.ele2}
        <Text>{this.state.outString}</Text>
        <LineChart
          bezier
          withDots={false}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          width={screenWidth * 0.95 * !this.state.firstCall}
          data={{
            labels: this.state.label,
            legend: ["Sleep Stage", "Light", "Noise"],
            datasets: [

              {
                data: this.state.data,

                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
              },
              {
                data: this.state.lightdata,
                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`
              },
              {
                data: this.state.noisedata,

                color: (opacity = 1) => `rgba(255, 237, 0, ${opacity})`
              }

            ]
          }}
          // from react-native
          height={screenHeight * 0.28* !this.state.firstCall}
          verticalLabelRotation={0}
          // optional, defaults to 1
          fromZero={true}
          yAxisInterval={1} 
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
        {this.state.ele}
        <Button round
          style={{ height: screenHeight * 0.06 * this.state.loadLogin, width: screenWidth * 0.9 * this.state.loadLogin }}
          color="#50C7C7"
          onPress={async () => {
            const authState = await this.signInAsync();
            this.setState({ authState: authState });
          }}
        >Sign In with FitBit</Button>
        <Text style={{ color: "gray", fontSize: 14 }}>Remember to connect your device</Text>
        <Button
          color="#50C7C7"
          round
          style={{ height: screenHeight * 0.06 * !this.state.loadLogin, width: screenWidth * 0.9 * !this.state.loadLogin }}
          onPress={async () => {
            const authState = await AsyncStorage.getItem(StorageKey);
            var temp = JSON.parse(authState);
            //console.log(authState);
            await this.refreshAuthAsync(temp, 2);

          }}
        > Sync Data </Button>

        <Button
          round
          style={{ height: 44 * !this.state.loadLogin, marginVertical: 5, width: screenWidth * 0.9 * !this.state.loadLogin }}
          color="#50C7C7"
          onPress={async () => {

            await this.signOutAsync();
           // 
          }}
        >Sign Out</Button>


      </View>
    )
  }

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

let config = {
  clientId: '22BFMN',
  prompt:'login consent',
  clientSecret: 'b33306de5862a2b913471c30aa2c9ffc',
  redirectUrl: 'lnmstry://sleeptracker', //note: path is required
  scopes: ['activity', 'sleep', 'profile', 'weight', 'heartrate'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
    tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
    revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke'
  }
};

let StorageKey = '@MyApp:CustomGooleOAuthKey';



