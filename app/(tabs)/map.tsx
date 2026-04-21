import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ClubMapCard } from "../../src/features/map/components/ClubMapCard";
import { supabase } from "../../src/lib/supabase";

type ClubMapItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
};

const initialRegion = {
  latitude: 41.3874,
  longitude: 2.1686,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05
};

function calculateMockDistanceKm(latitude: number, longitude: number) {
  const kmPerLatDegree = 111;
  const kmPerLngDegree = 85;
  const latDistance = Math.abs(latitude - initialRegion.latitude) * kmPerLatDegree;
  const lngDistance = Math.abs(longitude - initialRegion.longitude) * kmPerLngDegree;
  return Number(Math.sqrt(latDistance * latDistance + lngDistance * lngDistance).toFixed(1));
}

export default function MapScreen() {
  const [clubs, setClubs] = useState<ClubMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  const loadClubs = async () => {
      if (!refreshing) setLoading(true);
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, lat, lng, is_verified")
        .order("name", { ascending: true });

      if (error || !data) {
        setClubs([]);
        setLoading(false);
        return;
      }

      const rows = (data as any[]) ?? [];
      const mapped: ClubMapItem[] = rows
        .filter((club) => typeof club.lat === "number" && typeof club.lng === "number")
        .map((club) => ({
          id: club.id,
          name: club.name,
          latitude: club.lat as number,
          longitude: club.lng as number,
          rating: club.is_verified ? 5 : 4
        }));

      setClubs(mapped);
      setLoading(false);
      setRefreshing(false);
    };

  useEffect(() => {
    void loadClubs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    void loadClubs();
  };

  const filteredClubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter((club) => club.name.toLowerCase().includes(q));
  }, [clubs, search]);

  const selectedClub = useMemo(() => filteredClubs.find((club) => club.id === selectedClubId) ?? null, [filteredClubs, selectedClubId]);

  if (Platform.OS === "web") {
    return (
      <View className="flex-1 bg-botanical-bg">
        {loading ? (
          <View className="absolute top-6 z-10 self-center rounded-full border border-botanical-line bg-white px-3.5 py-2">
            <View className="flex-row items-center">
              <ActivityIndicator color="#2D463E" />
              <Text className="ml-2 text-botanical-muted">Cargando clubes...</Text>
            </View>
          </View>
        ) : null}

        <ScrollView
          className="flex-1 px-4 pt-20"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar club..."
            className="mb-3 rounded-2xl border border-botanical-line bg-white px-4 py-3 text-botanical-text"
          />
          <Text className="mb-3 text-botanical-primary">Selecciona un club para ver la ficha inferior de descubrimiento.</Text>
          {filteredClubs.length === 0 ? (
            <View className="rounded-3xl bg-botanical-cream p-4">
              <Text className="text-botanical-muted">No encontramos clubes para esta búsqueda.</Text>
            </View>
          ) : null}
          {filteredClubs.map((club) => (
            <Pressable
              key={club.id}
              className="mb-2 rounded-[20px] border border-botanical-line bg-white px-3.5 py-3"
              onPress={() => setSelectedClubId(club.id)}
            >
              <Text className="text-botanical-muted">{club.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {selectedClub ? (
          <View className="absolute bottom-0 left-0 right-0">
            <ClubMapCard
              clubName={selectedClub.name}
              distanceKm={calculateMockDistanceKm(selectedClub.latitude, selectedClub.longitude)}
              rating={selectedClub.rating}
              onViewProfile={() => router.push(`/club/${selectedClub.id}`)}
            />
          </View>
        ) : null}
      </View>
    );
  }

  const mapsModule = require("react-native-maps");
  const MapView = mapsModule.default;
  const Marker = mapsModule.Marker;

  return (
    <View className="flex-1 bg-botanical-bg">
      {loading ? (
        <View className="absolute top-6 z-10 self-center rounded-full border border-botanical-line bg-white px-3.5 py-2">
          <View className="flex-row items-center">
            <ActivityIndicator color="#2D463E" />
            <Text className="ml-2 text-botanical-muted">Cargando clubes...</Text>
          </View>
        </View>
      ) : null}

      <MapView style={styles.map} initialRegion={initialRegion}>
        {filteredClubs.map((club) => (
          <Marker
            key={club.id}
            coordinate={{ latitude: club.latitude, longitude: club.longitude }}
            title={club.name}
            pinColor="#2D463E"
            onPress={() => setSelectedClubId(club.id)}
          />
        ))}
      </MapView>

      {selectedClub ? (
        <View className="absolute bottom-0 left-0 right-0">
          <ClubMapCard
            clubName={selectedClub.name}
            distanceKm={calculateMockDistanceKm(selectedClub.latitude, selectedClub.longitude)}
            rating={selectedClub.rating}
            onViewProfile={() => router.push(`/club/${selectedClub.id}`)}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
