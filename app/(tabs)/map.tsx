import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { InlineError, PrimaryEmptyAction } from "../../src/components/AppUi";
import { SkeletonList, StateCard } from "../../src/components/StateCard";
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
  const [error, setError] = useState("");

  const loadClubs = async () => {
      if (!refreshing) setLoading(true);
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, lat, lng, is_verified")
        .order("name", { ascending: true });

      if (error || !data) {
        setError("No se pudieron cargar los clubes. Intenta de nuevo.");
        setClubs([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setError("");

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
        <ScrollView
          className="flex-1 px-4 pt-20"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {error ? <InlineError message={error} /> : null}
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar club..."
            className="mb-3 rounded-2xl border border-botanical-line bg-white px-4 py-3 text-botanical-text"
          />
          <Text className="mb-3 text-botanical-primary">Selecciona un club para ver la ficha inferior de descubrimiento.</Text>
          {loading ? <SkeletonList count={3} height={56} /> : null}
          {!loading && filteredClubs.length === 0 ? (
            <View>
              <StateCard title="Sin resultados" description="No encontramos clubes para esta búsqueda." variant="empty" />
              <PrimaryEmptyAction label="Reintentar" onPress={onRefresh} />
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
        <View className="absolute left-4 right-4 top-6 z-10">
          <StateCard title="Cargando clubes..." variant="loading" />
        </View>
      ) : null}

      {!loading && filteredClubs.length === 0 ? (
        <View className="absolute left-4 right-4 top-20 z-10">
          <View>
            <StateCard
              title="No hay clubes con coordenadas"
              description="Completa direccion y geocodificacion desde el panel B2B."
              variant="empty"
            />
            <PrimaryEmptyAction label="Actualizar" onPress={onRefresh} />
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
