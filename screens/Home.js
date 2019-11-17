import React from 'react';
import { StyleSheet, Dimensions, ScrollView, View } from 'react-native';
import { Button, Block, Text, Input, theme } from 'galio-framework';

import { Icon, Product } from '../components/';
import * as Location from 'expo-location';
const { width } = Dimensions.get('screen');
import products from '../constants/products';

import { TabView, SceneMap,TabBar  } from 'react-native-tab-view';






const renderLight = () => {

  return (
    
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.products}>
      <Block flex>
        <Product product={products[1]} full />
        <Product product={products[2]} full />
        <Product product={products[4]} full />
        <Product product={products[4]} full />
      </Block>
    </ScrollView>
  )
}

const renderNoise = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.products}>
      <Block flex>
        <Product product={products[3]} full />
        <Product product={products[4]} full />
        <Product product={products[4]} full />
        <Product product={products[4]} full />
      </Block>
    </ScrollView>
  )
}

const FirstRoute = () => (
  <Block flex center style={styles.home}>
    {renderNoise()}
  </Block>
);

const SecondRoute = () => (
  <Block flex center style={styles.home}>
    {renderLight()}
  </Block>
);

export default class Home extends React.Component {
  
  state = {
    index: 0,
    routes: [
      { key: 'light', title: 'LIGHT', icon: 'map' },
      { key: 'noise', title: 'NOISE' },
    ],
    element:[]
  };

  renderSearch = () => {
    const { navigation } = this.props;
    const iconCamera = <Icon size={16} color={theme.COLORS.MUTED} name="zoom-in" family="material" />

    return (
      <Input
        right
        color="black"
        style={styles.search}
        iconContent={iconCamera}
        placeholder="What are you looking for?"

      />
    )
  }


  renderTabs = () => {
    const { navigation } = this.props;

    return (
      <Block row style={styles.tabs}>
        <Button shadowless style={[styles.tab, styles.divider]} onPress={() => navigation.navigate('Pro')}>
          <Block row middle>
            <Icon name="grid" family="feather" style={{ paddingRight: 8 }} />
            <Text size={16} style={styles.tabTitle}>Noise</Text>
          </Block>
        </Button>
        <Button shadowless style={styles.tab} onPress={() => this.renderProductss()}>
          <Block row middle>
            <Icon size={16} name="camera-18" family="GalioExtra" style={{ paddingRight: 8 }} />
            <Text size={16} style={styles.tabTitle}>Light</Text>
          </Block>
        </Button>
      </Block>
    )
  }


  renderProductss = async () => {



    let a = await Location.reverseGeocodeAsync({
      latitude: 22.368043,
      longitude: 114.134825
    });


    console.log(a[0].region, a[0].street, a[0].name)




  }


  renderTabBar(props) {
    return (<TabBar
      style={{ backgroundColor: '#FFFFFF' }}
      labelStyle={{ color: 'black', fontWeight: 'bold' }}
      {...props}
      indicatorStyle={{ backgroundColor: '#9c26b0'}}
    />
    );
  }
  render() {
    return (

      <TabView
        renderTabBar={this.renderTabBar}
        navigationState={this.state}
        renderScene={SceneMap({
          noise: FirstRoute,
          light: SecondRoute,
        })}
        onIndexChange={index => this.setState({ index })}

      />

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
