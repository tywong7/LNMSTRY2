/*import React, { Component } from 'react';
import { TextInput, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import NotifService from '../components/NotifService';
import appConfig from '../app.json';

type Props = {};
export default class SleepTracker extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      senderId: appConfig.senderID
    };

    this.notif = new NotifService(this.onRegister.bind(this), this.onNotif.bind(this));
  }

  render() {
    //const { navigation, horizontal } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Example app react-native-push-notification</Text>
        <View style={styles.spacer}></View>
        <TextInput style={styles.textField} value={this.state.registerToken} placeholder="Register token" />
        <View style={styles.spacer}></View>

        <TouchableOpacity style={styles.button} onPress={() => { this.notif.localNotif() }}><Text>Local Notification (now)</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { {this.notif.scheduleNotif(2,0);this.notif.scheduleNotif(8,1);} }}><Text>Schedule Notification in 30s</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { this.notif.cancelNotif() }}><Text>Cancel last notification (if any)</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { this.notif.cancelAll() }}><Text>Cancel all notifications</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { this.notif.checkPermission(this.handlePerm.bind(this)) }}><Text>Check Permission</Text></TouchableOpacity>

        <View style={styles.spacer}></View>
        <TextInput style={styles.textField} value={this.state.senderId} onChangeText={(e) => {this.setState({ senderId: e })}} placeholder="GCM ID" />
        <TouchableOpacity style={styles.button} onPress={() => { this.notif.configure(this.onRegister.bind(this), this.onNotif.bind(this), this.state.senderId) }}><Text>Configure Sender ID</Text></TouchableOpacity>
        {this.state.gcmRegistered && <Text>GCM Configured !</Text>}

        <View style={styles.spacer}></View>
      </View>
    );
  }

  onRegister(token) {
    Alert.alert("Registered !", JSON.stringify(token));
    //console.log(token);
    this.setState({ registerToken: token.token, gcmRegistered: true });
  }

  onNotif(notif) {
    //this.props.navigation.navigate('InsMeasure');
    ///console.log("Notif49",notif);
    //Alert.alert(notif.title, notif.message);
  }

  handlePerm(perms) {
    Alert.alert("Permissions", JSON.stringify(perms));
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: "#000000",
    margin: 5,
    padding: 5,
    width: "70%",
    backgroundColor: "#DDDDDD",
    borderRadius: 5,
  },
  textField: {
    borderWidth: 1,
    borderColor: "#AAAAAA",
    margin: 5,
    padding: 5,
    width: "70%"
  },
  spacer: {
    height: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  }
});*/
import React, { Component } from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';
import qs from 'qs';
import config from '../config.js';
function OAuth(client_id, cb) {
 Linking.addEventListener('url', handleUrl);
 function handleUrl(event) {
  console.log(event.url);
  Linking.removeEventListener('url', handleUrl);
  const [, query_string] = event.url.match(/\#(.*)/);
  console.log(query_string);
  const query = qs.parse(query_string);
  console.log(`query: ${JSON.stringify(query)}`);
  cb(query.access_token);
}
const oauthurl = 'https://www.fitbit.com/oauth2/authorize?'+
          qs.stringify({
            client_id,
            response_type: 'token',
            scope: 'heartrate activity activity profile sleep',
            redirect_uri: 'lnmstry://fit',
            expires_in: '31536000',
        
          });
console.log(oauthurl);
Linking.openURL(oauthurl).catch(err => console.error('Error processing linking', err));
}


function getData(access_token) {
fetch('https://api.fitbit.com/1.2/user/-/sleep/date/2017-06-27.json', {
method: 'GET',
headers: {
 Authorization: `Bearer ${access_token}`,
},
// body: `root=auto&path=${Math.random()}`
})
.then(res => res.json())
.then(res => {
console.log(`res: ${JSON.stringify(res)}`);
})
.catch(err => {
  console.error('Error: ', err);
});
}
export default class App extends Component {
componentDidMount() {
    OAuth(config.client_id, getData);
 }
 
 render() {
  return (
  <View style={styles.container}>
    <Text style={styles.welcome}>
     Welcome to Fitbit Integration
    </Text>
  </View>
  );
 }
}


const styles = StyleSheet.create({
container: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: '#00a8b5',
},
welcome: {
 fontSize: 25,
 textAlign: 'center',
 color: '#fff',
 margin: 10,
},
});