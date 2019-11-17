import React from 'react';
import { Easing, Animated, Dimensions } from 'react-native';
import { createStackNavigator, createDrawerNavigator, createAppContainer } from 'react-navigation';



import HomeScreen from '../screens/Home';
import PollutionMapScreen from '../screens/PollutionMap';
import ProfileScreen from '../screens/Profile';
import ProScreen from '../screens/Pro';
import SleepTrackerScreen from '../screens/SleepTracker';
import InsMeasureScreen from '../screens/InsMeasure';
import SettingsScreen from '../screens/Settings';
import ViewAllScreen from '../screens/ViewAll';
import Menu from './Menu';
import Header from '../components/Header';
import { Drawer } from '../components/';
const { height, width } = Dimensions.get('screen');
const transitionConfig = (transitionProps, prevTransitionProps) => ({
  transitionSpec: {
    duration: 400,
    easing: Easing.out(Easing.poly(4)),
    timing: Animated.timing,
  },
  screenInterpolator: sceneProps => {
    const { layout, position, scene } = sceneProps;
    const thisSceneIndex = scene.index
    const width = layout.initWidth

    const scale = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      outputRange: [4, 1, 1]
    })
    const opacity = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      outputRange: [0, 1, 1],
    })
    const translateX = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex],
      outputRange: [width, 0],
    })

    const scaleWithOpacity = { opacity }
    const screenName = "Search"

    if (screenName === transitionProps.scene.route.routeName ||
      (prevTransitionProps && screenName === prevTransitionProps.scene.route.routeName)) {
      return scaleWithOpacity;
    }
    return { transform: [{ translateX }] }
  }
})

const ProfileStack = createStackNavigator({
  Profile: {
    screen: ProfileScreen,
    navigationOptions: ({ navigation }) => ({
      header: <Header white transparent title="My Sleep History" navigation={navigation} />,
      headerTransparent: true,
    })
  },
  ViewAll: {
    screen: ViewAllScreen,
    navigationOptions: ({ navigation }) => ({
      header: <Header  title="All Sleep History" navigation={navigation} />,
    })
  },
}, {
  cardStyle: { backgroundColor: '#EEEEEE', },
  transitionConfig,
});

const SettingsStack = createStackNavigator({
  Settings: {
    screen: SettingsScreen,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Settings" navigation={navigation} />,
    })
  },
}, {
  cardStyle: { backgroundColor: '#EEEEEE', },
  transitionConfig,
});

const AboutStack = createStackNavigator({
  About: {
    screen: ProScreen,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="About" navigation={navigation} />,
    })
  },
},
  {
    cardStyle: {
      backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
    },
    transitionConfig,
  }
);

const SleepTrackerStack = createStackNavigator({
  SleepTracker: {
    screen: SleepTrackerScreen,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Sleep Tracker" navigation={navigation} />,
    })
  },
},
  {
    cardStyle: {
      backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
    },
    transitionConfig,
  }
);
const InstantMeasureStack = createStackNavigator({
  InsMeasure: {
    screen: InsMeasureScreen,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Instant Measure" navigation={navigation} />,
    })
  },
},
  {
    cardStyle: {
      backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
    },
    transitionConfig,
  }
);


const PollutionMapStack = createStackNavigator({
  PollutionMap: {
    screen: PollutionMapScreen,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Pollution Map" navigation={navigation} />,
    })
  },
},
  {
    cardStyle: {
      backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
    },
    transitionConfig,
  });

const HomeStack = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="My Log" navigation={navigation} tabTitleLeft="Noise" tabTitleRight="Light" />,
    })
  }
},
  {
    cardStyle: {
      backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
    },
    transitionConfig,
  });

const AppStack = createDrawerNavigator(
  {

    Home: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: ({ focused }) => (
          <Drawer focused={focused} screen="Home" title="My Log" />
        )
      }
    },
    Woman: {
      screen: InstantMeasureStack,
      navigationOptions: (navOpt) => ({
        drawerLabel: ({ focused }) => (
          <Drawer focused={focused} screen="InsMeasure" title="Instant Measure" />
        ),
      }),
    },
    Man: {
      screen: SleepTrackerStack,
      navigationOptions: (navOpt) => ({
        drawerLabel: ({ focused }) => (
          <Drawer focused={focused} screen="SleepTracker" title="Sleep Tracker" />
        ),
      }),
    },
    Kids: {
      screen: PollutionMapStack,
      navigationOptions: (navOpt) => ({
        drawerLabel: ({ focused }) => (
          <Drawer focused={focused} screen="PollutionMap" title="Pollution Map" />
        ),
      }),
    },
    Profile: {
      screen: ProfileStack,
      navigationOptions: (navOpt) => ({
        drawerLabel: ({ focused }) => (
          <Drawer focused={focused} screen="Profile" title="My Sleep History" />
        ),
      }),
    },
    Settings: {
      screen: SettingsStack,
      navigationOptions: (navOpt) => ({
        drawerLabel: ({ focused }) => (

          <Drawer focused={focused} screen="Settings" title="Settings" />
        ),
      }),
    },
    SignUp: {
      screen: AboutStack,
      navigationOptions: (navOpt) => ({
        drawerLabel: ({ focused }) => (
          <Drawer focused={focused} screen="Pro" title="About" />
        ),
      }),
    },
  },
  Menu
);

const AppContainer = createAppContainer(AppStack);
export default AppContainer;