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
global.BluetoothManager = new BleModule();
const key = 'InsData'
export default class InsMeasure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      scaning: false,
      isConnected: false,
      text: '',
      writeData: '',
      receiveData: '',
      readData: '',
      isMonitoring: false,
      lable: [0], light: [0], noise: [0],
      lat: 0,
      long: 0,
      temp: '---',
      humid: '---',
      addr: '',
    }
    this.bluetoothReceiveData = [];  //蓝牙接收的数据缓存
    this.deviceMap = new Map();

  }

  componentDidMount() {
    BluetoothManager.start();  //蓝牙初始化     	    
    this.updateStateListener = BluetoothManager.addListener('BleManagerDidUpdateState', this.handleUpdateState);
    this.stopScanListener = BluetoothManager.addListener('BleManagerStopScan', this.handleStopScan);
    this.discoverPeripheralListener = BluetoothManager.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    this.connectPeripheralListener = BluetoothManager.addListener('BleManagerConnectPeripheral', this.handleConnectPeripheral);
    this.disconnectPeripheralListener = BluetoothManager.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectPeripheral);
    this.updateValueListener = BluetoothManager.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValue);
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
    //console.log("start 62");
    
    try {
      const saved = await AsyncStorage.getItem(key);
      
      /*var  outputData= {
        maxlight: 47,
        maxnoise: 80,
        avglight: 26,
        avgnoise: 99,
        temperature: 26.8,
        humidity: 75,
        lat:25.0650704,
        long:121.4969846,
        date:new Date().toLocaleString("en"),
      }
      var current_data = await AsyncStorage.getItem(key);
      current_data= await JSON.parse(current_data);
      // console.log("this is cuur",current_data);
      current_data.push(outputData);
      await AsyncStorage.setItem(key, JSON.stringify(current_data))*/
      console.log("what is save?",saved);
      storedItem = await JSON.parse(saved);
      
      //console.log("done");

    } catch (e) {
      await AsyncStorage.removeItem(key);
      console.warn("error",e);
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
      //ios连接时不需要用到Mac地址，但跨平台识别同一设备时需要Mac地址
      //如果广播携带有Mac地址，ios可通过广播0x18获取蓝牙Mac地址，
      macAddress = BluetoothManager.getMacAddressFromIOS(data);
      id = data.id;
    }
    this.deviceMap.set(data.id, data);  //使用Map类型保存搜索到的蓝牙设备，确保列表不显示重复的设备
    this.setState({ data: [...this.deviceMap.values()] });
  }

  //蓝牙设备已连接 
  handleConnectPeripheral = (args) => {
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
    this.state.light.push(parseInt(datasplit[0]));
    this.state.noise.push(parseInt(datasplit[1]));

    this.state.lable.push(this.state.light.length - 1);
    this.setState({ light: this.state.light });
    this.setState({ noise: this.state.noise });
    this.setState({ lable: this.state.lable });
    if (this.state.temp == '---')
      this.setState({ temp: datasplit[2] });
    if (this.state.humid == '---')
      this.setState({ humid: datasplit[3] });

  }
  average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
   toTimestamp=(strDate)=>{
    var datum = Date.parse(strDate);
    console.log(datum);
    return datum/1000;
 }
  passData= async()=>{
    var  outputData= {
      maxlight: Math.max.apply(Math, this.state.noise),
      maxnoise: Math.max.apply(Math, this.state.light),
      avglight: Math.round(this.average(this.state.noise)),
      avgnoise: Math.round(this.average(this.state.light)),
      temperature: this.state.temp,
      humidity: this.state.humid,
      lat: this.state.lat,
      long:this.state.long,
      date:new Date().toLocaleString("en"),
    }
    const ref=firestore()
  .collection('MeasuredResult');
    await ref.add({
      maxlight: outputData.maxlight,
      maxnoise: outputData.maxnoise,
      avglight: outputData.avglight,
      avgnoise: outputData.avgnoise,
      temperature: outputData.temperature,
      humidity: outputData.humidity,
      lat: outputData.lat,
      long:outputData.long,
      date:Date.parse(outputData.date),
    });
    var current_data = await AsyncStorage.getItem(key);
    try{
      if (current_data!=null){
       current_data= await JSON.parse(current_data);
      // console.log("this is cuur",current_data);
        current_data.push(outputData);
        await AsyncStorage.setItem(key, JSON.stringify(current_data));
      }
      else 
        await AsyncStorage.setItem(key, "["+JSON.stringify(outputData)+"]");
        console.log('done');
    }
    catch (e){
      console.log('sorry error in sending data',e);
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
      //console.log(String.fromCharCode(element));
    });
    if (tempStr == 'end'){
      try {
        this.passData();
        
      } catch (e) {
        console.warn(e);
      }
      this.offnotify();

    }
    else
      this.parseData(tempStr);
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
    this.setState({ light: [0] });
    this.setState({ noise: [0] });
    this.setState({ lable: [0] });
    this.setState({ lat: 0 });
    this.setState({ long: 0 });
    this.setState({ temp: '---' });
    this.setState({ humid: '---' });
    this.setState({ addr: '' });

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
    await Permissions.askAsync(Permissions.LOCATION);

    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    this.setState({ lat: location['coords']['latitude'] });
    this.setState({ long: location['coords']['longitude'] });

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
        BluetoothManager.write(stringToBytes('201'),1)
        .then(() => {
          this.bluetoothReceiveData = [];
          this.setState({
            writeData: 201,
            text: '',
          })
        })
        .catch(err => {
          console.log(err)
          this.alert('Failed to send');
        })
        this._getLocationAsync();
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
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.buttonView, { marginHorizontal: 10, height: 40, alignItems: 'center' }]}
          onPress={this.restoreItem}>
          <Text style={styles.buttonText}>Debug(Get Async Stroage)</Text>
        </TouchableOpacity>
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
    return (
      <View style={{ marginBottom: 30 }}>
        {this.state.isConnected ?
          <View >
            {this.renderReceiveView('Current Status：' + `${this.state.isMonitoring ? 'Monitoring enabled' : 'Monitoring disabled'}`, `${this.state.isMonitoring ? 'Start Measuring' : 'Ready to measure'}`, BluetoothManager.nofityCharacteristicUUID, this.notify, this.state.receiveData)}
            <View style={{ alignSelf: 'center', alignItems: 'center' }}>
              <Block card width={Dimensions.get('window').width - 30} shadow shadowColor='#000000' style={styles.product}>
                <Text size={16}> Date: {new Date().toLocaleString("en")}</Text>
                <Text size={16}> Temperature: {this.state.temp}°C Humidity: {this.state.humid}%</Text>
                <Text size={16}> Peak: {Math.max.apply(Math, this.state.noise)} dB, {Math.max.apply(Math, this.state.light)} lux</Text>
                <Text size={16}> Average: {Math.round(this.average(this.state.noise))} dB, {Math.round(this.average(this.state.light))}lux</Text>
                <Text size={16}> Location: {this.state.addr}</Text>
              </Block>
              <Block card width={Dimensions.get('window').width - 30} shadow shadowColor='#000000' style={styles.product}>
                <View style={{ flexDirection: 'row'}}>
                  <Text size={16}> Light: </Text>
                  <Text size={40} style={{ color: 'yellow' }}>•</Text>
                  <Text size={16}> Noise: </Text>
                  <Text size={40} style={{ color: 'black' }}>•</Text>
                </View>
                <LineChart data={{
                  labels: this.state.lable,
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
                  width={Dimensions.get('window').width - 50}
                  height={Dimensions.get('window').height * 0.3}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                      marginRight: 30,
                      alignSelf: 'center'
                    },
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    margin: 10,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                    shadowOpacity: 0.1,
                    elevation: 2,
                    alignSelf: 'center'

                  }} />
              <Text size={40} style={{ color: 'black' ,alignSelf:'center', alignItems: 'center',}}>Time(second)</Text>
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
    alignSelf:'center',
    alignItems:'center',
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
