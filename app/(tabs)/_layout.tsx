import { Tabs } from "expo-router";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2F5D50",
        tabBarInactiveTintColor: "#7E8C86",
        tabBarStyle: {
          backgroundColor: "#F7F6F2",
          borderTopColor: "#DFE8E2"
        },
        tabBarIcon: ({ focused, color, size }) => {
          return <Ionicons name={focused ? "ellipse" : "ellipse-outline"} size={size} color={color} />;
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: "Catálogo",
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color, size }) => <Ionicons name="log-in-outline" size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
