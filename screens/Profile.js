import React from 'react';
import { StyleSheet, Dimensions, ScrollView, ImageBackground, Platform } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../components';
import { Images, materialTheme } from '../constants';
import { HeaderHeight } from "../constants/utils";
import { LineChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;
var list = [];

function pad(num, size) {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}

function addComponent(number, list) {
  for (i = 0; i < number; i++) {
    var from=8,to=16;
    var lable=[],light=[],noise=[];
    for (j=from;j<=to;j++){
      lable.push(pad(j,2));
      light.push(Math.floor((Math.random() * 100) + 20));
      noise.push(Math.floor((Math.random() * 100) + 20));
    }
    var lightsum = light.reduce((previous, current) => current += previous);
    var noisesum = noise.reduce((previous, current) => current += previous);
    list.push(
      <Block key={i} card flex style={[styles.product, styles.shadow]}>
        <Text size={16}> Date: 1{i}/10/2019</Text>
        <Text size={16}> Time: {lable[0]}:00-{lable[lable.length-1]}:00  </Text>
        <Text size={16}> Total: {to-from} hours </Text>
        <Text size={16}> Peak: {Math.max.apply(Math, noise)} dB, {Math.max.apply(Math, light)} lux</Text>
        <Text size={16}> Average: {Math.round(noisesum/noise.length)} dB, {Math.round(lightsum / light.length)} lux</Text>
        <Text size={16}> Quality: Good</Text>
        <LineChart
          data={{
            labels: lable,
            datasets: [
              {
                data: light,
                strokeWidth: 2,
                color: (opacity = 1) => `rgba(255, 255, 4, ${opacity})`
              },
              {
                data: noise,
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
            marginRight: 20,
            borderRadius: 16,
          }}
        />
      </Block>

    )
  }
  return list;
}
export default class Profile extends React.Component {
  render() {
    return (
      <Block flex style={styles.profile}>
        <Block flex>
          <ImageBackground
            source={{ uri: Images.Profile }}
            style={styles.profileContainer}
            imageStyle={styles.profileImage}>
            <Block flex style={styles.profileDetails}>
              <Block style={styles.profileTexts}>
                <Text color="purple" size={28} style={{ paddingBottom: 8 }}>John Doe</Text>
                <Block row space="between">
                  <Block row>

                  </Block>
                  <Block>
                    <Text color={theme.COLORS.MUTED} size={16}>
                      <Icon name="map-marker" family="font-awesome" color={theme.COLORS.MUTED} size={16} />
                      {` `} SHB, CUHK
                      </Text>
                  </Block>
                </Block>
              </Block>
              <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']} style={styles.gradient} />
            </Block>
          </ImageBackground>
        </Block>
        <Block flex style={styles.options}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Block row space="between" style={{ padding: theme.SIZES.BASE, }}>
              <Block middle>
                <Text bold size={12} style={{ marginBottom: 8 }}>36</Text>
                <Text muted size={12}>Good Quality</Text>
              </Block>
              <Block middle>
                <Text bold size={12} style={{ marginBottom: 8 }}>5</Text>
                <Text muted size={12}>Normal Quality</Text>
              </Block>
              <Block middle>
                <Text bold size={12} style={{ marginBottom: 8 }}>2</Text>
                <Text muted size={12}>Bad Quality</Text>
              </Block>
            </Block>
            <Block row space="between" style={{ paddingVertical: 16, alignItems: 'baseline' }}>
              <Text size={16}>Recent Record</Text>
              <Text size={16} style={{fontWeight: 'bold'}} color={theme.COLORS.PRIMARY} onPress={() => this.props.navigation.navigate('ViewAll')}>View All</Text>
            </Block>
            <Block style={{ paddingBottom: -HeaderHeight * 2 }}>
              <Block space="between" style={{ flexWrap: 'wrap' }} >
              {addComponent(3, list)}



                <Block card flex style={[styles.product, styles.shadow]}>

                </Block>
              </Block>
            </Block>
          </ScrollView>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
    marginBottom: -HeaderHeight * 2,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    shadowOpacity: 0.3,
    elevation: 2,
  },
  product: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
  },
  profileImage: {
    width: width * 1.1,
    height: 'auto',
  },
  profileContainer: {
    width: width,
    height: height / 2,
  },
  profileDetails: {
    paddingTop: theme.SIZES.BASE * 4,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  profileTexts: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 2,
    zIndex: 2
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: theme.SIZES.BASE / 2,
    borderRadius: 4,
    height: 19,
    width: 38,
  },
  seller: {
    marginRight: theme.SIZES.BASE / 2,
  },
  options: {
    position: 'relative',
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: -theme.SIZES.BASE * 7,
    borderRadius: 13,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: 'center',
    width: thumbMeasure,
    height: thumbMeasure
  },
  gradient: {
    zIndex: 1,
    left: 0,
    right: 0,
    bottom: 0,
    height: '5%',
    position: 'absolute',
  },
});
