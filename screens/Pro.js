import React from 'react';
import { StyleSheet, Dimensions, Platform, Text ,ScrollView} from 'react-native';
import { Block, Button, theme } from 'galio-framework';


const { height, width } = Dimensions.get('screen');
import { materialTheme } from '../constants/';
import { HeaderHeight } from "../constants/utils";
import products from '../constants/products';
import { Icon, Product } from '../components/';
export default class Pro extends React.Component {
  render() {
    const { navigation, horizontal } = this.props;

    return (
      <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.products}>
      <Block flex style={alignSelf='center'}>
      <Block row={horizontal} card flex style={[styles.product, styles.shadow]}>
          <Block flex space="between" style={styles.productDescription}>
          <Text style={{fontSize:20,fontWeight :'bold'}}>LNMS is a system which can help you to improve your living quality.
                  
          </Text>
          <Text  >By monitoring your noise exposure daily, this system can show how they affect your life.</Text>
          </Block>
        </Block>
     
        <Block row={horizontal} card flex style={[styles.product, styles.shadow]}>
          <Block flex space="between" style={styles.productDescription}>
            <Text style={{fontSize:20,fontWeight :'bold'}} >My Log</Text>
            <Text >Here saves the records from "Instant Measure".</Text>
          </Block>
        </Block>

        <Block row={horizontal} card flex style={[styles.product, styles.shadow]}>
          <Block flex space="between" style={styles.productDescription}>
            <Text style={{fontSize:20,fontWeight :'bold'}} >Instant Measure</Text>
            <Text >Measure the level of noise and light level at instant time.</Text>
          </Block>
        </Block>

        <Block row={horizontal} card flex style={[styles.product, styles.shadow]}>
          <Block flex space="between" style={styles.productDescription}>
            <Text style={{fontSize:20,fontWeight :'bold'}} >Sleep Tracker</Text>

            <Text >This function can be used alone or used with FitBit or Apple Watch to monitor your sleep.</Text>
            <Text></Text>
            <Text >Comparing the data from the watch and the light and noise sensor to analyse the result.</Text>
            <Text></Text>
            <Text >Results are saved in "My Sleep History"</Text>
          </Block>
        </Block>

        <Block row={horizontal} card flex style={[styles.product, styles.shadow]}>
          <Block flex space="between" style={styles.productDescription}>
            <Text style={{fontSize:20,fontWeight :'bold'}} >Pollution Map </Text>
            <Text >A map which collects multiple users data together with their locations to show the
light and noise level at different places. </Text>
<Text></Text>
          <Text>Using color pin to indicate pollution level,
red as serious, yellow as moderate and green as low.</Text>
          </Block>
        </Block>
        <Block row={horizontal} card flex style={[styles.product, styles.shadow]}>
          <Block flex space="between" style={styles.productDescription}>
            <Text style={{fontSize:20,fontWeight :'bold'}} >My Sleep History</Text>
            <Text >Here saves the sleep history of user</Text>
          </Block>
        </Block>
        <Block row={horizontal} card flex >
          <Block flex space="between" style={styles.productDescription}>
          <Button
                  shadowless
                  style={styles.button}
                  color={materialTheme.COLORS.BUTTON_COLOR}
                  onPress={() => navigation.navigate('Home')}>
                  Home
              </Button>
          </Block>
        </Block>
      </Block>
    </ScrollView>
      );
      }
    }
    
const styles = StyleSheet.create(
  {
    productDescription: {
      padding: theme.SIZES.BASE / 2,
    },
          product: {
          backgroundColor: theme.COLORS.WHITE,
        marginVertical: theme.SIZES.BASE,
        borderWidth: 0,
        minHeight: 114,
      },
   shadow: {
          shadowColor: theme.COLORS.BLACK,
    shadowOffset: {width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.1,
        elevation: 2,
      },
  container: {
          backgroundColor: theme.COLORS.WHITE,
        marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
  },  product: {
          backgroundColor: theme.COLORS.WHITE,
        marginVertical: theme.SIZES.BASE,
        borderWidth: 0,
        minHeight: 50,
      },
  padded: {
          paddingHorizontal: theme.SIZES.BASE * 2,
        zIndex: 3,
        position: 'absolute',
        bottom: Platform.OS === 'android' ? theme.SIZES.BASE * 2 : theme.SIZES.BASE * 3,
      },
  button: {
        width: width - theme.SIZES.BASE * 4,
        height: theme.SIZES.BASE * 3,
        marginLeft:6,
        shadowRadius: 0,
        shadowOpacity: 0,
      },
  pro: {
          backgroundColor: materialTheme.COLORS.LABEL,
        paddingHorizontal: 8,
        marginLeft: 12,
        borderRadius: 2,
        height: 22
      },
  gradient: {
          zIndex: 1,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 166,
  },  shadow: {
          shadowColor: theme.COLORS.BLACK,
    shadowOffset: {width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.1,
        elevation: 2,
      },
      products: {
        alignSelf:'center',
        alignItems:'center',
        width: width - theme.SIZES.BASE * 2,
        paddingVertical: theme.SIZES.BASE * 1.2,
      },
    });
