import React from 'react';
import { StyleSheet, Dimensions, ScrollView, View, Button, } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import { Product } from '../components/';
const { width } = Dimensions.get('screen');
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import AsyncStorage from '@react-native-community/async-storage';




const renderLight = (fetchArray) => {

  var pushlist = []
  if (fetchArray == null)
    pushlist = <Text size={16} style={{ alignSelf:'center',alignItems: 'center' }}>No Data. Turn on "Auto Detect" from Settings to start.</Text>
    
  else
    for (i = 0; i < fetchArray.length; i++) {
      pushlist.push(<Product key={"Ins" + i} product={fetchArray[i]} full />
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
    pushlist = [<Text size={16} style={{ alignSelf:'center',alignItems: 'center' }}>No Data. Click "Instant Mesure" to start.</Text>,
    <Button title="restore" onPress={() => {
      AsyncStorage.getItem('temp').then((token) => {
        AsyncStorage.setItem('InsData', token);
        console.log("done");
      });
    }}></Button>,

    ]
  else
    for (i = 0; i < fetchArray.length; i++) {
      pushlist.push(<Product key={"Ins" + i} product={fetchArray[i]} full />
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

  state = {
    index: 0,
    routes: [
      { key: 'light', title: 'INSTANT MEASURE', icon: 'map' },
      { key: 'noise', title: 'AUTO MEASURE' },
    ],
    element: [],
    isLoading: true,
    test: Math.random(),
  };

  componentDidMount() {
    AsyncStorage.getItem('InsData').then((token) => {
      AsyncStorage.setItem('temp', token);
      this.setState({
        isLoading: false,
        element: JSON.parse(token)
      });
    });
  }


  FirstRoute = () => {
    return (
      <Block flex center style={styles.home}>
      
        {renderNoise(this.state.element)}
      </Block>


    )
  }
  SecondRoute = () => {
  
    return (
      <Block flex center style={styles.home}>
      
        {renderLight(null)}
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

  forceUpdateHandler(){

    this.setState( {test:Math.random(),element: null});
    

  };
  render() {
    if (this.state.isLoading) {
      return (<View><Text>Loading...</Text></View>)
    }
    return (

      
      [<Button title="restore"  onPress={() => {this.forceUpdateHandler()
        }} />,
        <Text>{this.state.test}</Text>,
      <TabView
        renderTabBar={this.renderTabBar}
        navigationState={this.state}
        renderScene={({ route}) => {
          switch (route.key) {
              case 'light':
                  return this.FirstRoute();
              case 'noise':
                  return this.SecondRoute();

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
