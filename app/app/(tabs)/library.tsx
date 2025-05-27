import { Text, TouchableOpacity, View } from "react-native";

export default function Library() {
  return (
    <View className="flex-1 justify-center items-center bg-raisin-black">
      <TouchableOpacity onPress={()=>alert("yeah!")}>
        <Text className="text-5xl text-blue-500 font-bold">yeah</Text>
      </TouchableOpacity>
      {/* <ActivityIndicator size="large" color="#f77700"/>
      <FlatList
        data={DATA}
        renderItem={({item})=>(
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
      /> */}
    </View>
  );
}
