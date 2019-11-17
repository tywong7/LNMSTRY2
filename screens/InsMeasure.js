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
} from 'react-native'
import BleModule from '../components/BleModule';
import AsyncStorage from '@react-native-community/async-storage';

global.BluetoothManager = new BleModule();
const key='first'

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
      demo:{},
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
    console.log("start 62");
    try {
      const saved = await AsyncStorage.getItem(key);
      storedItem = JSON.parse(saved || '{"demo": {}}');
      console.log("done");
    } catch (e) {
      console.warn(e);
    }

    this.setState({
		demo:storedItem
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

  //接收到新数据
  handleUpdateValue = async (data) => {
    //ios接收到的是小写的16进制，android接收的是大写的16进制，统一转化为大写16进制
    let value = data.value;
    var tempStr = "";
    //this.bluetoothReceiveData.push(value);
    value.forEach(element => {
      tempStr = tempStr + String.fromCharCode(element);
      console.log(String.fromCharCode(element));
    });
    this.bluetoothReceiveData.push(tempStr);
    console.log(value, String.fromCharCode(value[0]));
    console.log('BluetoothUpdateValue', value, tempStr);
    this.setState({ receiveData: this.bluetoothReceiveData })
    try {
      await AsyncStorage.setItem(key, JSON.stringify(this.bluetoothReceiveData));

    } catch (e) {
      console.warn(e);
    }
  }

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

  notify = (index) => {
    BluetoothManager.startNotification(index)
      .then(() => {
        this.setState({ isMonitoring: true });
        this.alert('Turned on');
      })
      .catch(err => {
        this.setState({ isMonitoring: false });
        this.alert('Failed to turn on');
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
          onPress={console.log("okok,",this.state.demo)}>
          <Text style={styles.buttonText}>Get demo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.buttonView, { marginHorizontal: 10, height: 40, alignItems: 'center' }]}
          onPress={this.restoreItem}>
          <Text style={styles.buttonText}>Get thing</Text>
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
          <View>
            {this.renderWriteView('Write Data(write)：', 'Send', BluetoothManager.writeWithResponseCharacteristicUUID, this.write, this.state.writeData)}
            {this.renderWriteView('(writeWithoutResponse)：', 'Send', BluetoothManager.writeWithoutResponseCharacteristicUUID, this.writeWithoutResponse, this.state.writeData)}
            {this.renderReceiveView('Read Data：', 'Read', BluetoothManager.readCharacteristicUUID, this.read, this.state.readData)}
            {this.renderReceiveView('Notification Received Data：' + `${this.state.isMonitoring ? 'Monitoring enabled' : 'Monitoring disabled'}`, 'Turn on notification', BluetoothManager.nofityCharacteristicUUID, this.notify, this.state.receiveData)}

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
      <View style={{ marginHorizontal: 10, marginTop: 30 }}>
        <Text style={{ color: 'black', marginTop: 5 }}>{label}</Text>
        <Text style={styles.content}>
          {state}
        </Text>
        {characteristics.map((item, index) => {
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.buttonView}
              onPress={() => { onPress(index) }}
              key={index}>
              <Text style={styles.buttonText}>{buttonText} ({item})</Text>
            </TouchableOpacity>
          )
        })}
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
  },
  content: {
    marginTop: 5,
    marginBottom: 15,
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
