import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native'
import BleModule from '../components/BleModule';
import AsyncStorage from '@react-native-community/async-storage';
import { Block, theme } from 'galio-framework';
import { LineChart } from 'react-native-chart-kit';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Geocoder from 'react-native-geocoder-reborn';
import { stringToBytes } from 'convert-string';
import firestore, { firebase } from '@react-native-firebase/firestore';
import NotifService from '../components/NotifService';
global.BluetoothManager = new BleModule();
var key = 'InsData';
var tempJson = "";
var isSleep = false;
export default class InsMeasure extends React.Component {
  constructor(props) {
    super(props);
    this.notif = new NotifService(this.onNotif.bind(this));

    this.state = {
      data: [],
      scaning: false,
      isConnected: false,
      text: '',
      writeData: '',
      receiveData: '',
      readData: '',
      isMonitoring: false,
      lable: [0], light: [0], noise: [0], r: [0], g: [0], b: [0],
      lat: 0,
      long: 0,
      temp: '---',
      humid: '---',
      addr: '---',
      notify: false,
      isSet: false,
    }
    this.bluetoothReceiveData = [];  //蓝牙接收的数据缓存
    this.deviceMap = new Map();

  }
  onNotif(notif) {
    this.props.navigation.navigate('Home');
  }
  componentDidMount() {
    BluetoothManager.start();  //蓝牙初始化     	    
    this.updateStateListener = BluetoothManager.addListener('BleManagerDidUpdateState', this.handleUpdateState);
    this.stopScanListener = BluetoothManager.addListener('BleManagerStopScan', this.handleStopScan);
    this.discoverPeripheralListener = BluetoothManager.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    this.connectPeripheralListener = BluetoothManager.addListener('BleManagerConnectPeripheral', this.handleConnectPeripheral);
    this.disconnectPeripheralListener = BluetoothManager.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectPeripheral);
    this.updateValueListener = BluetoothManager.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValue);
    //this._getLocationAsync();
  }

  componentWillUnmount() {
    this.updateStateListener.remove();
    this.stopScanListener.remove();
    this.discoverPeripheralListener.remove();
    this.connectPeripheralListener.remove();
    this.disconnectPeripheralListener.remove();
    this.updateValueListener.remove();
    if (this.state.isConnected) {
      BluetoothManager.disconnect();  //退出时断开蓝牙连接
    }
  }


  restoreItem = async () => {
    let storedItem = {};

    try {
      const saved = await AsyncStorage.getItem(key);

      console.log("what is save?", saved);
      storedItem = await JSON.parse(saved);


    } catch (e) {
      await AsyncStorage.removeItem(key);
      console.warn("error", e);
    }

    this.setState({
      demo: storedItem
    },
    );
  };
  //蓝牙状态改变
  handleUpdateState = (args) => {
    console.log('BleManagerDidUpdateStatea:', args);
    BluetoothManager.bluetoothState = args.state;
    if (args.state == 'on') {  //蓝牙打开时自动搜索
      this.scan();
    }
  }

  //扫描结束监听
  handleStopScan = () => {
    console.log('BleManagerStopScan:', 'Scanning is stopped');
    this.setState({ scaning: false });
  }

  //搜索到一个新设备监听
  handleDiscoverPeripheral = (data) => {
    // console.log('BleManagerDiscoverPeripheral:', data);
    console.log(data.id, data.name);
    let id;  //蓝牙连接id
    let macAddress;  //蓝牙Mac地址           
    if (Platform.OS == 'android') {
      macAddress = data.id;
      id = macAddress;
    } else {

      macAddress = BluetoothManager.getMacAddressFromIOS(data);
      id = data.id;
    }
    this.deviceMap.set(data.id, data);
    this.setState({ data: [...this.deviceMap.values()] });
  }

  //蓝牙设备已连接 
  handleConnectPeripheral = async (args) => {
    await Permissions.askAsync(Permissions.LOCATION);
    await Location.getCurrentPositionAsync({ enableHighAccuracy: true });

    console.log('BleManagerConnectPeripheral:', args);
  }

  //蓝牙设备已断开连接
  handleDisconnectPeripheral = (args) => {
    console.log('BleManagerDisconnectPeripheral:', args);
    let newData = [...this.deviceMap.values()]
    BluetoothManager.initUUID();  //断开连接后清空UUID
    this.setState({
      data: newData,
      isConnected: false,
      writeData: '',
      readData: '',
      receiveData: '',
      text: '',
    });
  }

  parseData = (input) => {
    var datasplit = input.split(",");

    this.state.light.push(parseFloat(datasplit[7]));
    this.state.noise.push(parseFloat(parseFloat(datasplit[8]).toFixed(2)));
    this.state.r.push(parseInt(datasplit[2]));
    this.state.g.push(parseInt(datasplit[3]));
    this.state.b.push(parseInt(datasplit[4]));

    this.state.lable.push(this.state.light.length - 1);

    this.setState({ light: this.state.light });
    this.setState({ noise: this.state.noise });
    this.setState({ r: this.state.r });
    this.setState({ g: this.state.g });
    this.setState({ b: this.state.b });

    this.setState({ lable: this.state.lable });
    if (this.state.temp == '---')
      this.setState({ temp: datasplit[5] });
    if (this.state.humid == '---')
      this.setState({ humid: datasplit[6] });

  }
  average = arr => arr.reduce((p, c) => p + c, 0) / (arr.length - 1);
  toTimestamp = (strDate) => {
    var datum = Date.parse(strDate);

    return datum / 1000;
  }
  sendNotiOrWarn = (light, noise, key) => {
    // console.log(195,this.state.notify);
    if (!this.state.notify && key == "AutoData")
      return;

    var msg = "";
    var type = 0;
    if (noise >= 75 || light >= 1500)  //strong
    {
      type = 1;
      if (noise >= 75 && light >= 1500) //2 2
        msg = "You are under severe light and noise exposure.";
      else if (noise >= 75 && light >= 500) //2 1
        msg = "You are under moderate light and severe noise exposure.";
      else if (noise >= 55 && light >= 1500) // 1 2
        msg = "You are under moderate noise and severe light exposure.";
      else if (noise >= 75) // 2 0
        msg = "You are under severe noise exposure.";
      else if (light >= 1500) // 0 2
        msg = "You are under severe light exposure.";

    }
    else if (noise >= 55 || light >= 500)  //moderate
    {
      if (noise >= 55 && light >= 500) //1 1
        msg = "You are under moderate light and noise exposure.";
      else if (noise >= 55) //1 0ex
        msg = "You are under moderate noise exposure.";
      else if (light >= 500) //1 1
        msg = "You are under moderate light exposure.";
    }
    var value = "(" + light + "lux " + noise + "dB" + ")"
    if (msg.length > 0) {
      if (key == "InsData") {
        Alert.alert('Done: ', msg, [{ text: 'OK', onPress: () => { } }]);
      }
      else {
        this.notif.localNotif(msg + value, type);
      }

    }
    else if (key == "InsData")
      Alert.alert('Done: ', "Light and noise level of now is safe.", [{ text: 'OK', onPress: () => { } }]);



  }
  passData = async (key) => {
    try {
      console.log(this.state.lat, this.state.long);
      await AsyncStorage.getItem('Notify').then((token) => {
        console.log(497, token);
        if (token == "true") {
          this.setState({ notify: true });

        } else this.setState({ notify: false });
      });
    }
    catch{
      console.log("no location")
    };

    var outputData = {
      maxlight: Math.max.apply(Math, this.state.light),
      maxnoise: Math.max.apply(Math, this.state.noise),
      avglight: Math.round(this.average(this.state.light)),
      avgnoise: Math.round(this.average(this.state.noise)),
      r: Math.round(this.average(this.state.r)),
      g: Math.round(this.average(this.state.g)),
      b: Math.round(this.average(this.state.b)),
      temperature: this.state.temp,
      humidity: this.state.humid,
      lat: this.state.lat,
      long: this.state.long,
      date: new Date().toLocaleString("en"),
    }
    const ref = firestore()
      .collection('MeasuredResult');
    await ref.add({
      maxlight: outputData.maxlight,
      maxnoise: outputData.maxnoise,
      avglight: outputData.avglight,
      avgnoise: outputData.avgnoise,
      r: outputData.r,
      g: outputData.g,
      b: outputData.b,
      temperature: outputData.temperature,
      humidity: outputData.humidity,
      lat: outputData.lat,
      long: outputData.long,
      date: Date.parse(outputData.date),
    });
    var current_data = await AsyncStorage.getItem(key);
    try {
      if (current_data != null) {
        current_data = await JSON.parse(current_data);
        // console.log("this is cuur",current_data);
        current_data.unshift(outputData);
        await AsyncStorage.setItem(key, JSON.stringify(current_data));
      }
      else
        await AsyncStorage.setItem(key, "[" + JSON.stringify(outputData) + "]");
      //console.log(outputData.avgnoise);

      this.sendNotiOrWarn(outputData.avglight, outputData.avgnoise, key);


      this.resetBody()

      console.log('done');
    }
    catch (e) {
      console.log('sorry error in sending data', e);
      AsyncStorage.removeItem(key);

    }
  }
  
  handleUpdateValue = async (data) => {
    //ios接收到的是小写的16进制，android接收的是大写的16进制，统一转化为大写16进制
    let value = data.value;
    var tempStr = "";
 
    //this.bluetoothReceiveData.push(value);
    value.forEach(element => {

      tempStr = tempStr + String.fromCharCode(element);

    });
    if (tempStr == '"send"') {
      //console.log("hey",tempJson);
     
     var outJSON= "["+tempJson.slice(0, -1)+"]";

     console.log(JSON.parse(outJSON));
     AsyncStorage.setItem("DailySleep", outJSON);
   
      isSleep=false;
    }
    else
    if (tempStr == '"sleep",') {
      isSleep = true;
    }
    else if (isSleep==true){
      tempJson=tempJson+tempStr;
    }
    else
      if (tempStr == 'end' || tempStr == 'aend') {

        this.setState({ isSet: false });
        console.log("mystr2:", this.state.lat, this.state.long);
        try {
          if (tempStr == 'aend') {
            this.passData('AutoData');
          }
          else this.passData('InsData');

        } catch (e) {
          console.warn(e);
        }
        this.offnotify();

      }
      else {
       
        this.parseData(tempStr);
      }
    this.bluetoothReceiveData.push(tempStr);

    console.log('BluetoothUpdateValue', tempStr);
    //this.setState({ receiveData: this.bluetoothReceiveData })

    /* try {
       await AsyncStorage.setItem(key, JSON.stringify(this.bluetoothReceiveData));
 
     } catch (e) {
       console.warn(e);
     }*/
  }
  resetBody = () => {
    if (!this.state.isSet)
      this._getLocationAsync();
    else {
      // this.setState({ lat: 0 });
      // this.setState({ long: 0 });
    }
    this.setState({ light: [0] });
    this.setState({ noise: [0] });
    this.setState({ lable: [0] });
    this.setState({ r: [0] });
    this.setState({ g: [0] });
    this.setState({ b: [0] });

    this.setState({ temp: '---' });
    this.setState({ humid: '---' });
    //this.setState({ addr: '---' });

  };
  connect(item) {
    //当前蓝牙正在连接时不能打开另一个连接进程
    if (BluetoothManager.isConnecting) {
      console.log('Cannot connect multiple BLE servers at a time.');
      return;
    }
    if (this.state.scaning) {  //当前正在扫描中，连接时关闭扫描
      BluetoothManager.stopScan();
      this.setState({ scaning: false });
    }
    let newData = [...this.deviceMap.values()]
    newData[item.index].isConnecting = true;
    this.setState({ data: newData });

    BluetoothManager.connect(item.item.id)
      .then(peripheralInfo => {
        let newData = [...this.state.data];
        newData[item.index].isConnecting = false;
        //连接成功，列表只显示已连接的设备
        this.resetBody();
        // this._getLocationAsync(); 
        this.setState({
          data: [item.item],
          isConnected: true
        });
        BluetoothManager.isConnected = true;
      })
      .catch(err => {
        let newData = [...this.state.data];
        newData[item.index].isConnecting = false;
        this.setState({ data: newData });
        this.alert('Connection failed');
      })
  }

  disconnect() {
    this.setState({
      data: [...this.deviceMap.values()],
      isConnected: false
    });
    BluetoothManager.isConnected = false;
    BluetoothManager.disconnect();
  }

  scan() {
    if (this.state.scaning) {  //当前正在扫描中
      BluetoothManager.stopScan();
      this.setState({ scaning: false });
    }
    if (BluetoothManager.bluetoothState == 'on') {
      BluetoothManager.scan()
        .then(() => {
          this.setState({ scaning: true });
          console.log("start scanning");
        }).catch(err => {

        })
    } else {
      BluetoothManager.checkState();
      if (Platform.OS == 'ios') {
        this.alert('Please turn on bluetooth');
      } else {
        Alert.alert('Reminder:', 'Please turn on bluetooth', [
          {
            text: 'Cancel',
            onPress: () => { }
          },
          {
            text: 'Turn On',
            onPress: () => { BluetoothManager.enableBluetooth() }
          }
        ]);
      }

    }
  }


  alert(text) {
    Alert.alert('Reminder: ', text, [{ text: 'Confirm', onPress: () => { } }]);
  }

  write = (index) => {
    if (this.state.text.length == 0) {
      this.alert('Please input message');
      return;
    }
    BluetoothManager.write(this.state.text, index)
      .then(() => {
        this.bluetoothReceiveData = [];
        this.setState({
          writeData: this.state.text,
          text: '',
        })
      })
      .catch(err => {
        this.alert('Failed to send');
      })
  }

  writeWithoutResponse = (index) => {
    if (this.state.text.length == 0) {
      this.alert('Please input message');
      return;
    }
    BluetoothManager.writeWithoutResponse(this.state.text, index)
      .then(() => {
        this.bluetoothReceiveData = [];
        this.setState({
          writeData: this.state.text,
          text: '',
        })
      })
      .catch(err => {
        this.alert('Failed to send');
      })
  }

  read = (index) => {
    BluetoothManager.read(index)
      .then(data => {
        this.setState({ readData: data });
      })
      .catch(err => {
        this.alert('Failed to read');
      })
  }

  _getLocationAsync = async () => {
    this.setState({ isSet: true });
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    this.setState({ addr: 'Loading...' });
    this.setState({ lat: location['coords']['latitude'] });
    this.setState({ long: location['coords']['longitude'] });
    console.log("omg" + this.state.lat, this.state.long);
    await Geocoder.geocodePosition({ lat: this.state.lat, lng: this.state.long }).then(res => {

      var best = "";
      for (i = 0; i < res.length; i++) {
        if (res[i]['adminArea'] != null) {
          if (res[i]['formattedAddress'].length > best.length)
            best = res[i]['formattedAddress'];
        }
      }

      this.setState({ addr: best });
    })
  }

  notify = (index) => {
    this.resetBody();

    BluetoothManager.startNotification(index)
      .then(() => {

        BluetoothManager.write(stringToBytes('i'), 1)
          .then(() => {
            this.bluetoothReceiveData = [];
            this.setState({
              writeData: 201,
              text: '',
            })
          })
          .catch(err => {

            this.alert('Failed to send');
          })

        this.setState({ isMonitoring: true });
        //this.alert('Turned on');
      })
      .catch(err => {
        this.setState({ isMonitoring: false });
        this.alert('Failed to turn on');
      })
  }

  offnotify = () => {
    BluetoothManager.stopNotification(0)
      .then(() => {
        this.setState({ isMonitoring: false })
        //console.log("bubu")
      })
      .catch(err => {

        this.alert('Failed to turn off');
      })
  }
  renderItem = (item) => {
    const { navigation } = this.props;
    let data = item.item;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={this.state.isConnected ? true : false}
        onPress={() => { this.connect(item) }}
        style={styles.item}>

        <View style={{ flexDirection: 'row', }}>
          <Text style={{ color: 'black' }}>{data.name ? data.name : ''}</Text>
          <Text style={{ marginLeft: 50, color: "red" }}>{data.isConnecting ? 'Connecting...' : ''}</Text>
        </View>
        <Text>{data.id}</Text>

      </TouchableOpacity>
    );
  }

  renderHeader = () => {
    return (
      <View style={{ marginTop: 20 }}>
        {/*<TouchableOpacity
          activeOpacity={0.7}
          style={[styles.buttonView, { marginHorizontal: 10, height: 40, alignItems: 'center' }]}
          onPress={this.restoreItem}>
        <Text style={styles.buttonText}>Debug(Get Async Stroage)</Text>
        </TouchableOpacity>*/}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.buttonView, { marginHorizontal: 10, height: 40, alignItems: 'center' }]}
          onPress={this.state.isConnected ? this.disconnect.bind(this) : this.scan.bind(this)}>
          <Text style={styles.buttonText}>{this.state.scaning ? 'Now Searching' : this.state.isConnected ? 'Disconnect Device' : 'Search Device'}</Text>
        </TouchableOpacity>

        <Text style={{ marginLeft: 10, marginTop: 10 }}>
          {this.state.isConnected ? 'Current connected device' : 'Available devices'}
        </Text>
      </View>
    )
  }

  renderFooter = () => {
    var myR = Math.round(this.average(this.state.r));
    var myG = Math.round(this.average(this.state.g));
    var myB = Math.round(this.average(this.state.b));





    return (
      <View style={{ marginBottom: 30 }}>
        {this.state.isConnected ?
          <View >
            {this.renderReceiveView('Current Status：' + `${this.state.isMonitoring ? 'Monitoring enabled' : 'Monitoring disabled'}`, `${this.state.isMonitoring ? 'Start Measuring' : 'Click to start measure'}`, BluetoothManager.nofityCharacteristicUUID, this.notify, this.state.receiveData)}
            <View style={{ alignSelf: 'center', alignItems: 'center' }}>
              <Block card width={Dimensions.get('window').width - 30} shadow shadowColor='#000000' style={styles.product}>
                <Text size={16}> Date: {new Date().toLocaleString("en")}</Text>
                <Text size={16}> Temperature: {this.state.temp}°C Humidity: {this.state.humid}%</Text>
                <Text size={16}> Peak: {Math.max.apply(Math, this.state.noise)} dB, {Math.max.apply(Math, this.state.light)} lux</Text>
                <Text size={16}> Average: {Math.round(this.average(this.state.noise))} dB, {Math.round(this.average(this.state.light))}lux</Text>
                <Text size={16}> R: {myR} G:{myG} B:{myB} </Text>
                <Text size={16}> Location: {this.state.addr}</Text>
              </Block>
              <Block card width={Dimensions.get('window').width - 30} shadow shadowColor='#000000' style={styles.product}>
                <LineChart data={{
                  labels: this.state.lable,
                  legend: ["Light", "Noise"],
                  datasets: [
                    {
                      data: this.state.light,
                      strokeWidth: 2,
                      color: (opacity = 1) => `rgba(255, 255, 4, ${opacity})`,

                    },
                    {
                      data: this.state.noise,
                      strokeWidth: 2,
                    }
                  ],
                }}
                  width={Dimensions.get('window').width * 0.9}
                  height={Dimensions.get('window').height * 0.3}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                      //marginRight: 30,
                      alignSelf: 'center'
                    },
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                    shadowOpacity: 0.1,
                    elevation: 2,
                    alignSelf: 'center'

                  }} />
                <Text size={40} style={{ color: 'black', alignSelf: 'center', alignItems: 'center', }}>Time(second)</Text>
              </Block>
            </View>

            {/*{this.renderWriteView('Write Data(write)：', 'Send', BluetoothManager.writeWithResponseCharacteristicUUID, this.write, this.state.writeData)}
            {this.renderWriteView('(writeWithoutResponse)：', 'Send', BluetoothManager.writeWithoutResponseCharacteristicUUID, this.writeWithoutResponse, this.state.writeData)}
            {this.renderReceiveView('Read Data：', 'Read', BluetoothManager.readCharacteristicUUID, this.read, this.state.readData)}
                */}

          </View>
          : <View></View>
        }
      </View>
    )
  }

  renderReceiveView = (label, buttonText, characteristics, onPress, state) => {
    if (characteristics.length == 0) {
      return;
    }
    return (
      <View style={{ marginHorizontal: 10, marginTop: 5 }}>

        {characteristics.map((item, index) => {
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.buttonView}
              onPress={() => onPress(index)}
              key={index}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          )
        })}
        <Text style={{ color: 'black', marginTop: 5 }}>{label}</Text>
      </View>
    )
  }

  renderWriteView = (label, buttonText, characteristics, onPress, state) => {
    if (characteristics.length == 0) {
      return;
    }
    return (
      <View style={{ marginHorizontal: 10, marginTop: 30 }} behavior='padding'>
        <Text style={{ color: 'black' }}>{label}</Text>
        <Text style={styles.content}>
          {this.state.writeData}
        </Text>
        {characteristics.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={styles.buttonView}
              onPress={() => { onPress(index) }}>
              <Text style={styles.buttonText}>{buttonText} ({item})</Text>
            </TouchableOpacity>
          )
        })}
        <TextInput
          style={[styles.textInput]}
          value={this.state.text}
          placeholder='Please input message'
          onChangeText={(text) => {
            this.setState({ text: text });
          }}
        />
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          renderItem={this.renderItem}
          ListHeaderComponent={this.renderHeader}
          ListFooterComponent={this.renderFooter}
          keyExtractor={item => item.id}
          data={this.state.data}
          extraData={[this.state.isConnected, this.state.text, this.state.receiveData, this.state.readData, this.state.writeData, this.state.isMonitoring, this.state.scaning]}
          keyboardShouldPersistTaps='handled'
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  product: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: Platform.OS == 'ios' ? 20 : 0,
  },
  item: {
    flexDirection: 'column',
    borderColor: 'rgb(235,235,235)',
    borderStyle: 'solid',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingLeft: 10,
    paddingVertical: 8,
  },
  buttonView: {
    height: 30,
    backgroundColor: 'rgb(33, 150, 243)',
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: 'center',
    alignItems: 'flex-start',
    marginTop: 10
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    alignSelf: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: 5,
    marginBottom: 5,
  },
  textInput: {
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: 'white',
    height: 50,
    fontSize: 16,
    flex: 1,
  },
})
