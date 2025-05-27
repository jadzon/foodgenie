import { Tabs } from 'expo-router';
import { Camera, Users, Utensils } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

const BRAND_PINK_HEX = '#f7438d';
const INACTIVE_ICON_COLOR_HEX = '#ffffff';

const ICON_SIZE_STANDARD = 24;

const StandardTabIcon = ({ focused, IconComponent }) => {
  if (focused) {
    return (
      <View className="items-center justify-center w-11 h-11">
        <IconComponent
          color={BRAND_PINK_HEX} 
          size={ICON_SIZE_STANDARD}
          strokeWidth={2.5}
        />
      </View>
    );
  } else {
    return (
      <View className="items-center justify-center w-11 h-11">
        <IconComponent
          color={INACTIVE_ICON_COLOR_HEX}
          size={ICON_SIZE_STANDARD}
          strokeWidth={2}
        />
      </View>
    );
  }
};

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveBackgroundColor: 'transparent', 
        tabBarInactiveBackgroundColor: 'transparent', 
        tabBarItemStyle:{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'


        },
        tabBarStyle:{
            backgroundColor: '#25242A',
            height: 52,
            paddingBottom:70,
            paddingTop: 20,
            borderTopWidth:0.5,
            borderTopColor: '#A1A1A1'


        }
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: "Library", 
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon focused={focused} IconComponent={Utensils} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Camera",
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon focused={focused} IconComponent={Camera} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon focused={focused} IconComponent={Users} />
          ),
        }}
      />
    </Tabs>
  );
};

const _layout = () => {
  return (
    <TabLayout/>
  )
}

export default _layout