/*Example of Expandable ListView in React Native*/
import React, { Component } from 'react';
//import react in our project
import {
  LayoutAnimation,
  StyleSheet,
  View,
  Text,
  ScrollView,
  UIManager,
  TouchableOpacity,
  Platform,
  Dimensions, Button, Modal
} from 'react-native';
import { Block, Checkbox } from 'galio-framework';
import { LineChart } from 'react-native-chart-kit';
import DateRangePicker from '../components/DateRangePicker';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationEvents } from 'react-navigation';
//import basic react native components

class ExpandableItemComponent extends Component {
  //Custom Component for the Expandable List
  constructor() {
    super();
    this.state = {
      layoutHeight: 0,
      element: null,
    };
  }
  componentDidMount() {


  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.item.isExpanded) {
      this.setState(() => {
        return {
          layoutHeight: null,
        };
      });
    } else {
      this.setState(() => {
        return {
          layoutHeight: 0,
        };
      });
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.layoutHeight !== nextState.layoutHeight) {
      return true;
    }
    return false;
  }

  render() {
    if (this.props.item.category_name != null)
      return (
        <View>
          {/*Header of the Expandable List Item*/}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={this.props.onClickFunction}
            style={styles.header}>
            <Text style={styles.headerText}>Date: {this.props.item.category_name}      Quality: {this.props.item.Quality}</Text>
          </TouchableOpacity>
          <View
            style={{
              height: this.state.layoutHeight,
              overflow: 'hidden',
            }}>
            {/*Content under the header of the Expandable List Item*/}
            {
              this.props.item.subcategory.map((item, key) => (


                <View key={item.id}>
                  {item.val}
                </View>


              ))}
          </View>
        </View>
      );
  }
}

function pushArray(index, list) {
  average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
  console.log("index", index, list)
  Aarray = [];
  if (list != null) {

    var label = [];
    for (var x = parseInt(list.From) + 1; x <= parseInt(list.To); x++) {
      label.push(x);
    }
    Aarray.push(
      <Block key={index} card width={Dimensions.get('window').width - 30} shadow shadowColor='#000000' style={styles.product}>
        <Text size={16}> Time: {list.From}-{list.To}  </Text>
        <Text size={16}> Total: {parseInt(list.To) - parseInt(list.From)} hours </Text>
        <Text size={16}> Peak: {Math.max.apply(Math, list.NoiseValue)} dB, {Math.max.apply(Math, list.LightValue)} lux</Text>
        <Text size={16}> Average: {Math.round(this.average(list.NoiseValue))} dB, {Math.round(this.average(list.LightValue))} lux</Text>
      </Block>,
      <Block key={index + "graph"} card width={Dimensions.get('window').width - 30} shadow shadowColor='#000000' style={styles.product}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text size={16}> Light: </Text>
          <Text size={40} style={{ color: 'yellow' }}>•</Text>
          <Text size={16}> Noise: </Text>
          <Text size={40} style={{ color: 'black' }}>•</Text>

        </View>


      </Block>,
      <LineChart
        data={{
          labels: label,
          datasets: [
            {
              data: list.LightValue,
              strokeWidth: 2,
              color: (opacity = 1) => `rgba(255, 255, 4, ${opacity})`
            },
            {
              data: list.NoiseValue,
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
          alignSelf: 'center',
          borderRadius: 16,
        }}
      />);

  }

  return Aarray;
}
export default class ViewAllScreen extends Component {
  //Main View defined under this Class
  constructor(props) {
    super(props);
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    var qua = JSON.stringify(this.props.navigation.getParam('quality'));

    this.state = {
      listDataSource: CONTENT, tempSoucr: CONTENT, allData: CONTENT,
      modalVisible: false, rangestart: null, rangeend: null, ele: null,
      good: true, normal: true, bad: true, trigger:false,
    };

    if (qua != null) {
      if (qua.includes('bad')) {
        this.state.good=false;
        this.state.normal=false ;
      }
      else if (qua.includes('normal')) {
        this.state.bad=false;
        this.state.good=false;
      }
      else if (qua.includes('good')) {
        this.state.bad=false;
        this.state.normal=false ;
      }
    }

  }
  onFocus = async () => {
    AsyncStorage.getItem('SleepData').then((token) => {
      if (token) {
        let ele = JSON.parse(token);

        if (this.state.tempSoucr.length != ele['data'].length) {
          CONTENT=[];


          for (var i = 0; i < ele['data'].length; i++) {
            CONTENT.push({
              isExpanded: false,
              isRendered: false,
              category_name: ele['data'][i].Date,
              Quality: ele['data'][i].Quality,
              subcategory: [{ id: i, val: [] }],
            }
            )
          }
          this.setState({tempSoucr:CONTENT});
          this.setState({ listDataSource: CONTENT });
        }
      }


    })


   
  }
  componentDidMount() {
    AsyncStorage.getItem('SleepData').then((token) => {
      if (token) {
        let data = JSON.parse(token)
        if (this.state.ele == null)
          this.setState({ ele: data['data'] });
      }
    })
    var qua = JSON.stringify(this.props.navigation.getParam('quality'));


    if (qua != null) {
      if (qua.includes('bad')) {
        this.setState({ normal: false });
        this.setState({ good: false });
      }
      else if (qua.includes('normal')) {
        this.setState({ bad: false });
        this.setState({ good: false });
      }
      else if (qua.includes('good')) {
        this.setState({ bad: false });
        this.setState({ normal: false });
      }
      var temp = [];
      for (var i = 0; i < CONTENT.length; i++) {
        if (qua.includes(CONTENT[i].Quality))
          temp.push(CONTENT[i]);

      }
      this.setState({ listDataSource: temp })

    }
  }
  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }



  updateLayout = index => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const array = [...this.state.listDataSource];
    //For Single Expand at a time


    if (!array[index]['isRendered']) {
      array[index]["subcategory"][0]["val"] = pushArray(index, this.state.ele[index]);
      array[index]['isRendered'] = true;

    }


    array.map((value, placeindex) =>
      placeindex === index
        ? (array[placeindex]['isExpanded'] = !array[placeindex]['isExpanded'])
        : (array[placeindex]['isExpanded'] = false)
    );

    //For Multiple Expand at a time
    //array[index]['isExpanded'] = !array[index]['isExpanded'];
    this.setState(() => {
      return {
        listDataSource: array,
      };
    });
  };
  test1=()=>{

    console.log(this.state.good);
    console.log(this.state.normal);
    console.log(this.state.bad);
  }
  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
}
getQuality=async (index)=>{
    if(!this.state.trigger){
      this.setState({trigger:true});
      console.log("trigger");
      console.log(index);
    }
    else{
      if(index==0)
        await this.setStateAsync({bad:!this.state.bad});
      else if(index==1)
        await this.setStateAsync({normal:!this.state.normal});
      else 
        await this.setStateAsync({good:!this.state.good});
      this.filterQuality();
      
    }
    }
  filterQuality=()=>{
    
    var temp = [];
      for (var i = 0; i < CONTENT.length; i++) {
        if (this.state.bad){
  
          if (CONTENT[i].Quality=='bad')
            temp.push(CONTENT[i]);
        }
        if (this.state.normal){

          if (CONTENT[i].Quality=='normal')
            temp.push(CONTENT[i]);
        }
        if (this.state.good){

          if (CONTENT[i].Quality=='good')
            temp.push(CONTENT[i]);
        }
          
      }
      this.setState({ listDataSource: temp })

  }

  render() {
    if (this.state.listDataSource.length > 0){
      ele_to_add=[
      <ScrollView>
      {this.state.listDataSource.map((item, key) => (
        <ExpandableItemComponent
          key={item.category_name + key}
          onClickFunction={this.updateLayout.bind(this, key)}
          item={item}
        />
      ))
      
      }
    </ScrollView>
      ]

      date=this.state.tempSoucr[0]['category_name'].replace(/\//g, '-');
    }
    else {
      ele_to_add=[<View style={{ alignItems: 'center' }}>
   
      <Text size={20}>No Sleep Record.</Text></View>]
      date=this.state.allData[0]['category_name'].replace(/\//g, '-');
    }

      return (

        <View style={styles.container}>
          
          <NavigationEvents onDidFocus={console.log('reloadViewAll')} onWillFocus={this.onFocus} />
          <View>

            <Modal
              animationType="slide"
              transparent={false}
              visible={this.state.modalVisible}
              onRequestClose={() => {

                this.setModalVisible(!this.state.modalVisible);
              }}>
              <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>

                <View style={{
                  width: 300,
                  height: 300
                }}>

                  <DateRangePicker
                    initialRange={[date, date]}
                    onSuccess={(s, e) => { this.setState({ rangestart: s.replace(/-/g, '/') }); this.setState({ rangeend: e.replace(/-/g, '/') }) }}
                    theme={{ markColor: '#586cdd', markTextColor: 'white' }} />
                  <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }}>
                    <Button title="Cancel" onPress={() => {
                      this.setModalVisible(!this.state.modalVisible);
                    }} />
                    <Button title="Confirm" onPress={() => {
                      this.setModalVisible(!this.state.modalVisible);
                      var temp = []
                      for (var x = 0; x < this.state.tempSoucr.length; x++) {
                        var date1 = new Date(this.state.tempSoucr[x]['category_name']);
                        var startdate = new Date(this.state.rangestart);
                        var enddate = new Date(this.state.rangeend);
                        //console.log(date1, startdate, enddate);
                        if (date1 >= startdate && date1 <= enddate) {
                          temp.push(this.state.tempSoucr[x]);
                        }
                        else{}
                          //console.log("123", this.state.rangestart, this.state.rangeend);
                      }
                      this.setState({ listDataSource: temp });




                    }} />
                  </View>

                </View>
              </View>
            </Modal>



            <View style={{ flexDirection: 'row-reverse' }}>
              <Button style={{ zIndex: 9999, alignSelf: 'right' }} title="Filter" onPress={() => {
                this.setModalVisible(true);
              }} />
              <Checkbox color="error" label="Bad " initialValue={this.state.bad} onChange={()=>{this.getQuality(0)} }/>
              <Checkbox color="warning" label="Normal " initialValue={this.state.normal} onChange={()=>{this.getQuality(1)} } />
              <Checkbox color="success" label="Good " initialValue={this.state.good} onChange={()=>this.getQuality(2) } />



            </View>


          </View>
                {ele_to_add}
        </View>
      );
 
  }
}

const styles = StyleSheet.create({
  modalstyle: {
    width: 250,
    height: 100,
  },
  product: {
    backgroundColor: '#ffffff',
    alignSelf: 'center',
    marginBottom: 5
  },
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#F5FCFF',
  },
  topHeading: {
    paddingLeft: 10,
    fontSize: 20,
  },
  header: {
    backgroundColor: '#F5FCFF',
    padding: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#808080',
    width: '95%',
    marginLeft: 16,
    marginRight: 16,
  },
  text: {
    fontSize: 16,
    color: '#606070',
    padding: 10,
  },
  content: {

    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
  },
});

var CONTENT = [];
AsyncStorage.getItem('SleepData').then((token) => {
  if (token) {
    let ele = JSON.parse(token);

    for (var i = 0; i < ele['data'].length; i++) {
      CONTENT.push({
        isExpanded: false,
        isRendered: false,
        category_name: ele['data'][i].Date,
        Quality: ele['data'][i].Quality,
        subcategory: [{ id: i, val: [] }],
      }
      )
    }
  }
})


