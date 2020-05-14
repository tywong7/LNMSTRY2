import React from "react";
import { DrawerItems } from 'react-navigation';
import { TouchableWithoutFeedback, ScrollView, StyleSheet, Dimensions, Image } from "react-native";
import { Block, Text, theme } from "galio-framework";
import AsyncStorage from '@react-native-community/async-storage';
import { Icon } from '../components/';
import { Images, materialTheme } from "../constants/";

const { width } = Dimensions.get('screen');


async function asyncSetProfile(){
  AsyncStorage.getItem('SleepData').then((token) => {
    if (token) {
      let data=JSON.parse(token);
      //console.log(token);
      var total =data['good']+data['normal']+data['bad'];
      if (total!=0)
     profile.rating=((data['good']*5.0+data['normal']*3.0+data['bad']*1.0)/total).toFixed(1);

    }
  })
  AsyncStorage.getItem('userAvatar').then((token) => {
    if (token) {
      profile.avatar=token;
    }
  })
  AsyncStorage.getItem('userName').then((token) => {
    if (token) {
      profile.name=token
    }
  })
  AsyncStorage.getItem('userGender').then((token) => {
    if (token) {
      profile.type=token
    }
  })
 /* profile.avatar=await AsyncStorage.getItem("userAvatar");
  profile.name=await AsyncStorage.getItem("userName");
  profile.type= await AsyncStorage.getItem("userGender");*/

  
}

asyncSetProfile();

const Drawer = (props) => (
  <Block style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
    <Block flex={0.2} style={styles.header}>
      <TouchableWithoutFeedback onPress={() => props.navigation.navigate('Profile')} >
        <Block style={styles.profile}>
          <Image source={{ uri: props.profile.avatar}} style={styles.avatar} />
          <Text h5 color="white">{props.profile.name}</Text>
        </Block>
      </TouchableWithoutFeedback>
      <Block row>
        <Block middle style={styles.pro}>
          <Text size={16} color="white">{props.profile.plan}</Text>
        </Block>
        <Text size={16} muted style={styles.seller}>{props.profile.type}</Text>
        <Text size={16} color={materialTheme.COLORS.WARNING}>
          {props.profile.rating} <Icon name="shape-star" family="GalioExtra" size={14} />
        </Text>
      </Block>
    </Block>
    <Block flex>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <DrawerItems {...props} />
      </ScrollView>
    </Block>
  </Block>
);

let profile = {
  avatar: Images.Profile,
  name: 'FYP',
  type: 'KSL1901',
  plan: 'SEX',
  rating: 'N/A'
};

const Menu = {
  contentComponent: props => <Drawer {...props} profile={profile} />,
  drawerBackgroundColor: 'white',
  drawerWidth: width * 0.8,
  contentOptions: {
    activeTintColor: 'white',
    inactiveTintColor: '#000',
    activeBackgroundColor: 'transparent',
    itemStyle: {
      width: width * 0.75,
      backgroundColor: 'transparent',
    },
    labelStyle: {
      fontSize: 18,
      marginLeft: 12,
      fontWeight: 'normal',
    },
    itemsContainerStyle: {
      paddingVertical: 16,
      paddingHorizonal: 12,
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4B1958',
    paddingHorizontal: 28,
    paddingBottom: theme.SIZES.BASE,
    paddingTop: theme.SIZES.BASE * 2,
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 28,
    justifyContent: 'flex-end'
  },
  profile: {
    marginBottom: theme.SIZES.BASE / 2,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginBottom: theme.SIZES.BASE,
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: 8,
    borderRadius: 4,
    height: 19,
    width: 46,
  },
  seller: {
    marginRight: 16,
  }
});

export default Menu;
