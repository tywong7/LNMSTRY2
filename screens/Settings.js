import React from 'react';
import { StyleSheet, Switch, FlatList, Platform, TouchableOpacity, ScrollView,Dimensions } from "react-native";
import { Block, Text, theme, Icon } from "galio-framework";
import Slider from '@react-native-community/slider';
import materialTheme from '../constants/Theme';
import { Alert } from 'react-native';
import NotifService from '../components/NotifService';
import appConfig from '../app.json';
import AsyncStorage from '@react-native-community/async-storage';
import Home from '../screens/Home';
export default class Settings extends React.Component{
  state = {
    Auto:false,
    Notify:false,
    Interval:1,
  };

  constructor() {
    super();

    this.notif = new NotifService(this.onNotif.bind(this));
  }
  componentDidMount() {
    AsyncStorage.getItem('Auto Decect').then((token) => {

      this.setState({
        Auto: JSON.parse(token),
      });
    });
    AsyncStorage.getItem('Notify').then((token) => {
 
      this.setState({
        Notify: JSON.parse(token),
      });
    });
    AsyncStorage.getItem('Interval').then((token) => {

      this.setState({
        Interval: JSON.parse(token),
      });
    });
  
  }
  onNotif(notif) {
    console.log(notif);
    Alert.alert(notif.title, notif.message);
  }
  
  toggleSwitch =  async switchNumber => {this.setState({ [switchNumber]: !this.state[switchNumber] }); console.log(this.state[switchNumber]);
  
  if (switchNumber=='face'){
    this.setState({Auto:!this.state['Auto']});
   AsyncStorage.setItem('Auto Decect',JSON.stringify(!this.state[switchNumber]));
  }
  else {
    this.setState({Notify:!this.state['Notify']});
     AsyncStorage.setItem('Notify',JSON.stringify(!this.state[switchNumber]));
  }
  if (!this.state[switchNumber]&&switchNumber!='face'){
    this.notif.scheduleNotif(1,0);this.notif.scheduleNotif(6,1);
  }                                
};

  renderItem = ({ item }) => {
    const { navigate } = this.props.navigation;

    switch (item.type) {
      case 'slider':
   
        return (
          <Block row middle space="between" style={styles.rows}>
          <Text size={14}>{item.title}({this.state.Interval} Mins)</Text>
            <Slider
              style={{ width: Dimensions.get('window').width -150, height: 40 }}
              minimumValue={1}
              maximumValue={120}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#800080"
              value={this.state.Interval}
              onValueChange={value=>{
        

                this.setState({Interval:parseInt(value)});

                
              }}
              onSlidingComplete={value => {
                AsyncStorage.setItem('Interval',JSON.stringify(parseInt(value)));
                
              }
              
            }
            />
          </Block>
        );
      case 'switch':

        if (item.id=='Notifications')
              this.state[item.id]=this.state.Notify;
        else 
            this.state[item.id]=this.state.Auto;
        return (
          <Block row middle space="between" style={styles.rows}>
            <Text size={14}>{item.title}</Text>
            <Switch
              onValueChange={() => this.toggleSwitch(item.id)}
              ios_backgroundColor={materialTheme.COLORS.SWITCH_OFF}
              thumbColor={Platform.OS === 'android' ? materialTheme.COLORS.SWITCH_OFF : null}
              trackColor={{ false: materialTheme.COLORS.SWITCH_OFF, true: materialTheme.COLORS.SWITCH_ON }}
              value={this.state[item.id]}
            />
          </Block>
        );
      case 'button':
        var title=''
        if (item.id=='clear_1')
          title='Clear Instant Meausre Data';
        else if (item.id=='clear_2')
          title='Clear Auto Meausre Data';
        else title='Clear My Sleep History';

        return (
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => {

              Alert.alert(
                title,
                'Are you sure to '+title+'?',
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  { text: 'OK', onPress: () => {
                    if (item.id=='clear_1')
                      try {
                        AsyncStorage.removeItem("InsData").then( (data)=>{
                          console.log("done",data);
  
                          Alert.alert('Done','Cleared Instant Measure Data ');
                        });
                      }
                      catch (e){
                        console.log("Clear InsData Error",e);
                      }
                  else if (item.id=='clear_2')
                  try {
                    AsyncStorage.removeItem("AutoData").then( (data)=>{
                      console.log("done",data);
                      Alert.alert('Done','Clear Auto Measure Data ');
                    });
                  }
                  catch (e){
                    console.log("Clear Auto Error",e);
                  }
                  else
                  try {
                    AsyncStorage.removeItem("SleepData").then( (data)=>{
                      console.log("done",data);
                      Alert.alert('Done','Clear My Sleep Record');
                    });
                  }
                  catch (e){
                    console.log("Clear Sleep Error",e);
                  } 
                  } },
                ],
                { cancelable: false }
              );
            }}>
              <Block row middle space="between" style={{ paddingTop: 7 }}>
                <Text size={14}>{item.title}</Text>
                <Icon name="angle-right" family="font-awesome" style={{ paddingRight: 5 }} />
              </Block>
            </TouchableOpacity>
          </Block>);
      default:
        break;
    }
  }

  render() {
    var recommended = []
    if (this.state.Auto)
    {
      recommended=
      [{ title: "Auto detect", id: "face", type: "switch" },
      { title: "Interval", id: "detectInter", type: "slider" },
      { title: "Notifications and Warnings", id: "Notifications", type: "switch" },
      ]
    }
    else {
      recommended=
      [{ title: "Auto detect", id: "face", type: "switch" },
      { title: "Notifications and Warnings", id: "Notifications", type: "switch" },
      ]
    }


    const payment = [
      { title: "Clear Instant Measure Log", id: "clear_1", type: "button" },
      { title: "Clear Auto Measure Record", id: "clear_2", type: "button" },
      { title: "Clear My Sleep Record", id: "clear_3", type: "button" },
    ];


    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        <FlatList
          data={recommended}
          keyExtractor={(item, index) => item.id}
          renderItem={this.renderItem}
          ListHeaderComponent={
            <Block style={styles.title}>
              <Text bold center size={theme.SIZES.BASE} style={{ paddingBottom: 5 }}>
                Detect & Notifications
              </Text>
              <Text center muted size={12}>
                Functions settings
              </Text>
            </Block>
          }
        />
        <Block style={styles.title}>
          <Text bold center size={theme.SIZES.BASE} style={{ paddingBottom: 5 }}>
            Clear History
          </Text>
          <Text center muted size={12}>
            Clear your record
          </Text>
        </Block>
        <FlatList
          data={payment}
          keyExtractor={(item, index) => item.id}
          renderItem={this.renderItem}
        />

      </ScrollView>

    );
  }
}

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
  },
  rows: {
    height: theme.SIZES.BASE * 2,
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE / 2,
  }
});
