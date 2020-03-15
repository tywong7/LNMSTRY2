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
import { LineChart,PieChart } from 'react-native-chart-kit';
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

pushArray= (index, list) => {
    Aarray = [];

    if (list != null) {
      Aarray.push(

        <Block key={index} card width={Dimensions.get('window').width - 30} shadow shadowColor='#000000' style={styles.product}>
          <Text size={16}> Time: {list.Hour}  </Text>
          <Text size={16}> Total: {list.AcutalSleep}</Text>
          <Text size={16}> Quality: {list.Quality+list.DetailQ}</Text>
          <Text size={16}> Efficiency: {list.Efficiency} </Text>
          <Text size={16}> {list.maxavg}</Text>
        </Block>,
        <LineChart
        key={'line'+index}
        bezier
        withDots={false}
        withShadow={false}
        withInnerLines={false}
        withOuterLines={false}
        width={Dimensions.get('window').width -30}
        height={Dimensions.get('window').height*0.32}
        data={{
          labels: list.label,
          legend: ["Sleep Stage", "Light", "Noise"],
          datasets: [
  
            {
              data: list.SleepValue,
  
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
            },
            {
              data:list.LightValue,
              color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`
            },
            {
              data:list.NoiseValue,
  
              color: (opacity = 1) => `rgba(255, 237, 0, ${opacity})`
            }
  
          ]
        }
      }
   // from react-nativ
        verticalLabelRotation={0}
        // optional, defaults to 1
  
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
          marginHorizontal:16,
          marginVertical: 8,
          borderRadius: 16
        }}
      />,
      <PieChart
      key={'pie'+index}
      data={[
        {
          name: "Deep(" + list.ratio[0] + " mins)",
          population: list.ratio[0],
          color: "#154BA6",
          legendFontColor: "#7F7F7F",
          legendFontSize: 12
        },
        {
          name: "Light(" + list.ratio[1] + " mins)",
          population: list.ratio[1],
          color: "#3F8DFF",
          legendFontColor: "#7F7F7F",
          legendFontSize: 12
        },
        {
          name: "Rem(" + list.ratio[2] + " mins)",
          population: list.ratio[2],
          color: "#7EC4FF",
          legendFontColor: "#7F7F7F",
          legendFontSize: 12
        },
        {
          name: "Awake(" + list.ratio[3] + " mins)",
          population: list.ratio[3],
          color: "#E73360",
          legendFontColor: "#7F7F7F",
          legendFontSize: 12
        }
      ]}
      chartConfig={{
     
        decimalPlaces: 0, // optional, defaults to 2dp
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      }}
      style={{
        borderRadius: 16,
        marginLeft:16,
        alignSelf:'center',
      }
  
      }
      width={Dimensions.get('window').width*0.97}
      height={Dimensions.get('window').height*0.30}
      accessor="population"
      backgroundColor="#201842"
  
  
    />
        );
  
    }
  
    return Aarray;
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
  
      array[index]["subcategory"][0]["val"] = this.pushArray(index, this.state.ele[index]);
      console.log(366,this.state.ele[index]);
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
     // console.log("trigger");
     // console.log(index);
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
      <ScrollView key={'bigbigView'}>
      
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
      ele_to_add=[<View key={'viewempty'} style={{ alignItems: 'center' }}>
   
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
    //console.log(token);
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


