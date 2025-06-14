import { Tabs } from 'expo-router';
import { Camera, Users, Utensils } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

const BRAND_PINK_HEX = '#f7438d';
const INACTIVE_ICON_COLOR_HEX = '#9CA3AF'
;

const ICON_SIZE_STANDARD = 24;

const StandardTabIcon = ({ focused, IconComponent, label }: { focused: boolean; IconComponent: any; label: string }) => {
  if (focused) {
    return (
      <View className="items-center justify-center h-11 w-20">
        <IconComponent
          color={BRAND_PINK_HEX} 
          size={ICON_SIZE_STANDARD}
          strokeWidth={2.5}
        />
        <Text className='font-exo2 text-white'>{label}</Text>
        
      </View>
    );
  } else {
    return (
      <View className="items-center justify-center h-11 w-20">
        <IconComponent
          color={INACTIVE_ICON_COLOR_HEX}
          size={ICON_SIZE_STANDARD}
          strokeWidth={2}
        />
        <Text className='font-exo2 text-gray-400'>{label}</Text>
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
        tabBarInactiveBackgroundColor: 'transparent',        tabBarItemStyle:{
            flex: 1,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        tabBarStyle:{
            backgroundColor: '#2A2A2A',
            height: 46,
            paddingBottom:60,
            paddingTop: 20,
            borderTopWidth:0,
        },
      }}
    >      <Tabs.Screen
        name="library"
        options={{
          title: "Library", 
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon focused={focused} IconComponent={Utensils} label="Dania" />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Camera",
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon focused={focused} IconComponent={Camera} label="Skanuj"  />
          ),
          
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon focused={focused} IconComponent={Users} label="Socjale" />
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