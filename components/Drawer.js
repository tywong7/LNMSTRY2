import React from 'react';
import { StyleSheet } from 'react-native';
import { Block, Text, theme } from "galio-framework";

import Icon from './Icon';
import materialTheme from '../constants/Theme';

const proScreens = ['Woman', 'Man', 'Kids', 'New Collection', 'Sign In', 'Sign Up'];

class DrawerItem extends React.Component {
  renderIcon = () => {
    const { title, focused } = this.props;

    switch (title) {
      case 'My Log':
        return (
          <Icon
            size={16}
            name="md-bookmarks"
            family="ionicon"
            color={focused ? 'white' : materialTheme.COLORS.MUTED} />
        );
      case 'Instant Measure':
        return (
          <Icon
            size={16}
            name="ios-speedometer"
            family="ionicon"
            color={focused ? 'white' : materialTheme.COLORS.MUTED} />
        );
      case 'Sleep Tracker':
        return (
          <Icon
            size={16}
            name="md-bed"
            family="ionicon"
            color={focused ? 'white' : materialTheme.COLORS.MUTED} />
        );
      case 'Pollution Map':
        return (
          <Icon
            size={16}
            name="md-map"
            family="ionicon"
            color={focused ? 'white' : materialTheme.COLORS.MUTED} />
        );
      case 'My Sleep History':
        return (
          <Icon
            size={16}
            name="md-timer"
            family="ionicon"
            color={focused ? 'white' : materialTheme.COLORS.MUTED} />
        );
      case 'About':
        return (
          <Icon
            size={16}
            name="md-information-circle"
            family="ionicon"
            color={focused ? 'white' : materialTheme.COLORS.MUTED} />
        );
      case 'Settings':
        return (
          <Icon
            size={16}
            name="gears"
            family="font-awesome"
            color={focused ? 'white' : materialTheme.COLORS.MUTED} />
        );

      default:
        return null;
    }
  }

  renderLabel = () => {
    const { title } = this.props;

    if (proScreens.includes(title)) {
      return (
        <Block middle style={styles.pro}>
          <Text size={12} color="white">PRO</Text>
        </Block>
      )
    }

    return null;
  }

  render() {
    const { focused, title } = this.props;
    const proScreen = proScreens.includes(title);
    return (
      <Block flex row style={[styles.defaultStyle, focused ? [styles.activeStyle, styles.shadow] : null]}>
        <Block middle flex={0.1} style={{ marginRight: 28 }}>
          {this.renderIcon()}
        </Block>
        <Block row center flex={0.9}>
          <Text size={18} color={focused ? 'white' : proScreen ? materialTheme.COLORS.MUTED : 'black'}>
            {title}
          </Text>
          {this.renderLabel()}
        </Block>
      </Block>
    );
  }
}

export default DrawerItem;

const styles = StyleSheet.create({
  defaultStyle: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  activeStyle: {
    backgroundColor: materialTheme.COLORS.ACTIVE,
    borderRadius: 4,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 8,
    shadowOpacity: 0.2
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginLeft: 8,
    borderRadius: 2,
    height: 16,
    width: 36,
  },
})