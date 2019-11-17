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
  Dimensions, Button, Modal, TouchableHighlight
} from 'react-native';
import { Block } from 'galio-framework';
import { LineChart } from 'react-native-chart-kit';
import DateRangePicker from '../components/DateRangePicker';

//import basic react native components

class ExpandableItemComponent extends Component {
  //Custom Component for the Expandable List
  constructor() {
    super();
    this.state = {
      layoutHeight: 0,
    };
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
function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}
function pushArray(index) {
  var lable = [], light = [], noise = [];
  var from = 8, to = 16;
  for (j = from; j <= to; j++) {
    lable.push(pad(j, 2));
    light.push(Math.floor((Math.random() * 100) + 20));
    noise.push(Math.floor((Math.random() * 100) + 20));
  }
  var lightsum = light.reduce((previous, current) => current += previous);
  var noisesum = noise.reduce((previous, current) => current += previous);
  Aarray = [];

  Aarray.push(
    <Block key={index} card width={Dimensions.get('window').width - 30} shadow shadowColor='#000000' style={styles.product}>
      <Text size={16}> Time: {lable[0]}:00-{lable[lable.length - 1]}:00  </Text>
      <Text size={16}> Total: {to - from} hours </Text>
      <Text size={16}> Peak: {Math.max.apply(Math, noise)} dB, {Math.max.apply(Math, light)} lux</Text>
      <Text size={16}> Average: {Math.round(noisesum / noise.length)} dB, {Math.round(lightsum / light.length)} lux</Text>
    </Block>,
        <Block key={index*100} card width={Dimensions.get('window').width - 30} shadow shadowColor='#000000' style={styles.product}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
        <Text size={16}> Light: </Text>
        <Text size={40} style={{color: 'yellow'}}>•</Text>
        <Text size={16}> Noise: </Text>
        <Text size={40} style={{color: 'black'}}>•</Text>

        </View>
        
        
      </Block>,
    <LineChart key={index + 1} data={{
      labels: lable,
      datasets: [
        {
          data: light,
          strokeWidth: 2,
          color: (opacity = 1) => `rgba(255, 255, 4, ${opacity})`,
          legend: ["dB", "lux"]
        },
        {
          data: noise,
          strokeWidth: 2,
        }
      ],
    }}
      width={Dimensions.get('window').width - 50}
      height={Dimensions.get('window').height - 250}
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

      }} />);
  return Aarray;
}
export default class ViewAllScreen extends Component {
  //Main View defined under this Class
  constructor() {
    super();
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    this.state = { listDataSource: CONTENT, tempSoucr: CONTENT, modalVisible: false, rangestart: '', rangeend: '' };

  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  updateLayout = index => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const array = [...this.state.listDataSource];
    //For Single Expand at a time


    if (!array[index]['isRendered']) {
      array[index]["subcategory"][0]["val"] = pushArray(index * 2);
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

  render() {
    return (

      <View style={styles.container}>
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
                  initialRange={[CONTENT[0]['category_name'], CONTENT[0]['category_name']]}
                  onSuccess={(s, e) => { this.setState({ rangestart: s }); this.setState({ rangeend: e }) }}
                  theme={{ markColor: '#586cdd', markTextColor: 'white' }} />
                <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }}>
                  <Button title="Cancel" onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                  }} />
                  <Button title="Confirm" onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                    this.state.tempSource = []
                    for (var x = 0; x < CONTENT.length; x++)
                      if (CONTENT[x]['category_name'] >= this.state.rangestart && CONTENT[x]['category_name'] <= this.state.rangeend) {

                        this.state.tempSource.push(CONTENT[x]);
                      }
                    this.setState({ listDataSource: this.state.tempSource });




                  }} />
                </View>

              </View>
            </View>
          </Modal>




          <View style={{ alignItems: 'flex-end' }}>
            <Button style={{ zIndex: 9999, alignSelf: 'right' }} title="Filter" onPress={() => {


              this.setModalVisible(true);
            }
            }></Button>
          </View>

        </View>
        <ScrollView>
          {this.state.listDataSource.map((item, key) => (
            <ExpandableItemComponent
              key={item.category_name}
              onClickFunction={this.updateLayout.bind(this, key)}
              item={item}
            />
          ))}
        </ScrollView>
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
    marginBottom:5
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

//Dummy content to show
//You can also use dynamic data by calling webservice
const CONTENT = [];
for (var i = 0; i < 10; i++) {
  var seed = Math.floor((Math.random() * 3) + 1);
  var qal;
  if (seed == 1)
    qal = 'Good';
  else if (seed == 2)
    qal = 'Normal';
  else qal = 'Bad'
  CONTENT.push({
    isExpanded: false,
    isRendered: false,
    category_name: '2019-11-' + '1' + i,
    Quality: qal,
    subcategory: [{ id: i, val: [] }],
  }
  )
}

