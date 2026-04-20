import { Tabs } from "expo-router";
import React from "react";

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
        }
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Inicio" }} />
      <Tabs.Screen name="map" options={{ title: "Mapa" }} />
      <Tabs.Screen name="catalog" options={{ title: "Catálogo" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
