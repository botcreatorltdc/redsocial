import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { ClubMapCard } from "../../src/features/map/components/ClubMapCard";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme/colors";

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
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  useEffect(() => {
    const loadClubs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, lat, lng, is_verified")
        .order("name", { ascending: true });

      if (error || !data) {
        setClubs([]);
        setLoading(false);
        return;
      }

      const mapped: ClubMapItem[] = data
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
    };

    void loadClubs();
  }, []);

  const selectedClub = useMemo(
    () => clubs.find((club) => club.id === selectedClubId) ?? null,
    [clubs, selectedClubId]
  );

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.pine} />
            <Text style={styles.loadingText}>Cargando clubes...</Text>
          </View>
        ) : null}

        <View style={styles.webPlaceholder}>
          <Text style={styles.webMessage}>
            El mapa está disponible solo en dispositivos móviles. Aquí se mostraría la lista de
            clubes.
          </Text>

          {clubs.map((club) => (
            <Pressable
              key={club.id}
              style={styles.webClubItem}
              onPress={() => setSelectedClubId(club.id)}
            >
              <Text style={styles.webClubText}>{club.name}</Text>
            </Pressable>
          ))}
        </View>

        {selectedClub ? (
          <View style={styles.bottomSheet}>
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
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.pine} />
          <Text style={styles.loadingText}>Cargando clubes...</Text>
        </View>
      ) : null}

      <MapView style={styles.map} initialRegion={initialRegion}>
        {clubs.map((club) => (
          <Marker
            key={club.id}
            coordinate={{
              latitude: club.latitude,
              longitude: club.longitude
            }}
            title={club.name}
            pinColor={colors.sage}
            onPress={() => setSelectedClubId(club.id)}
          />
        ))}
      </MapView>

      {selectedClub ? (
        <View style={styles.bottomSheet}>
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
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0
  },
  loadingOverlay: {
    position: "absolute",
    top: 24,
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center"
  },
  loadingText: {
    marginLeft: 8,
    color: colors.textSecondary
  },
  webPlaceholder: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 16
  },
  webMessage: {
    color: colors.textPrimary,
    marginBottom: 12
  },
  webClubItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8
  },
  webClubText: {
    color: colors.textSecondary
  }
});
