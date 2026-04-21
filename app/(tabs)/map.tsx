import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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

type SpotMapItem = {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  dangerLevel: number;
  tranquilityLevel: number;
  comfortLevel: number;
  createdBy: string;
  score: number;
  votesScore: number;
  myVote: -1 | 0 | 1;
};

type MapMode = "clubs" | "spots";
type SpotMetricKey = "dangerLevel" | "tranquilityLevel" | "comfortLevel";

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
  const [spots, setSpots] = useState<SpotMapItem[]>([]);
  const [mode, setMode] = useState<MapMode>("clubs");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showSpotForm, setShowSpotForm] = useState(false);
  const [spotName, setSpotName] = useState("");
  const [spotDescription, setSpotDescription] = useState("");
  const [spotLat, setSpotLat] = useState(String(initialRegion.latitude));
  const [spotLng, setSpotLng] = useState(String(initialRegion.longitude));
  const [dangerLevel, setDangerLevel] = useState("2");
  const [tranquilityLevel, setTranquilityLevel] = useState("4");
  const [comfortLevel, setComfortLevel] = useState("3");
  const [creatingSpot, setCreatingSpot] = useState(false);
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [info, setInfo] = useState("");

  const renderMetricPicker = (
    label: string,
    metricKey: SpotMetricKey,
    currentValue: string,
    setValue: (value: string) => void
  ) => (
    <View className="mb-2">
      <Text className="mb-1 text-xs text-botanical-muted">{label}</Text>
      <View className="flex-row gap-1">
        {["1", "2", "3", "4", "5"].map((value) => {
          const active = currentValue === value;
          return (
            <Pressable
              key={`${metricKey}-${value}`}
              className={`h-8 w-8 items-center justify-center rounded-full border ${
                active ? "border-botanical-primary bg-botanical-primary" : "border-botanical-line bg-white"
              }`}
              onPress={() => setValue(value)}
            >
              <Text className={`text-xs font-semibold ${active ? "text-white" : "text-botanical-muted"}`}>{value}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

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

  const loadSpots = async () => {
    if (!refreshing) setLoading(true);
    const { data, error: spotsError } = await supabase
      .from("smoke_spots")
      .select("id, name, description, lat, lng, danger_level, tranquility_level, comfort_level, created_by")
      .order("created_at", { ascending: false });
    const { data: votesData } = await (supabase as any)
      .from("smoke_spot_votes")
      .select("spot_id, user_id, value");

    if (spotsError || !data) {
      setError("No se pudieron cargar los spots. Intenta de nuevo.");
      setSpots([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setError("");
    const rows = (data as any[]) ?? [];
    const votesRows = (votesData as Array<{ spot_id: string; user_id: string; value: number }> | null) ?? [];
    const votesBySpot = votesRows.reduce<Record<string, { total: number; mine: -1 | 0 | 1 }>>((acc, vote) => {
      if (!acc[vote.spot_id]) {
        acc[vote.spot_id] = { total: 0, mine: 0 };
      }
      acc[vote.spot_id].total += Number(vote.value) || 0;
      if (currentUserId && vote.user_id === currentUserId) {
        acc[vote.spot_id].mine = (Number(vote.value) === -1 ? -1 : 1) as -1 | 1;
      }
      return acc;
    }, {});
    const mapped: SpotMapItem[] = rows
      .filter((spot) => typeof spot.lat === "number" && typeof spot.lng === "number")
      .map((spot) => ({
        id: spot.id,
        name: spot.name,
        description: spot.description ?? null,
        latitude: spot.lat as number,
        longitude: spot.lng as number,
        dangerLevel: Number(spot.danger_level) || 1,
        tranquilityLevel: Number(spot.tranquility_level) || 1,
        comfortLevel: Number(spot.comfort_level) || 1,
        createdBy: String(spot.created_by),
        score: (Number(spot.tranquility_level) || 1) + (Number(spot.comfort_level) || 1) - (Number(spot.danger_level) || 1),
        votesScore: votesBySpot[spot.id]?.total ?? 0,
        myVote: votesBySpot[spot.id]?.mine ?? 0
      }));
    mapped.sort((a, b) => (b.score + b.votesScore) - (a.score + a.votesScore));
    setSpots(mapped);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    void supabase.auth.getSession().then((res) => setCurrentUserId(res.data.session?.user.id ?? null));
    if (mode === "clubs") {
      void loadClubs();
    } else {
      void loadSpots();
    }
  }, [mode]);

  const onRefresh = () => {
    setRefreshing(true);
    if (mode === "clubs") {
      void loadClubs();
    } else {
      void loadSpots();
    }
  };

  const filteredClubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter((club) => club.name.toLowerCase().includes(q));
  }, [clubs, search]);
  const filteredSpots = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return spots;
    return spots.filter((spot) => spot.name.toLowerCase().includes(q));
  }, [spots, search]);

  const selectedClub = useMemo(() => filteredClubs.find((club) => club.id === selectedClubId) ?? null, [filteredClubs, selectedClubId]);
  const selectedSpot = useMemo(() => filteredSpots.find((spot) => spot.id === selectedSpotId) ?? null, [filteredSpots, selectedSpotId]);

  const createSpot = async () => {
    if (!spotName.trim()) {
      setError("El nombre del spot es obligatorio.");
      return;
    }
    const lat = Number(spotLat);
    const lng = Number(spotLng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("Latitud y longitud del spot deben ser números válidos.");
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Coordenadas fuera de rango: lat [-90,90], lng [-180,180].");
      return;
    }
    if (![dangerLevel, tranquilityLevel, comfortLevel].every((value) => Number(value) >= 1 && Number(value) <= 5)) {
      setError("Las métricas deben estar entre 1 y 5.");
      return;
    }
    const session = (await supabase.auth.getSession()).data.session;
    const userId = session?.user.id;
    if (!userId) {
      setError("Debes iniciar sesión para crear un spot.");
      return;
    }
    setCreatingSpot(true);
    setInfo("");
    if (editingSpotId) {
      const { error: updateError } = await (supabase as any)
        .from("smoke_spots")
        .update({
          name: spotName.trim(),
          description: spotDescription.trim() || null,
          lat,
          lng,
          danger_level: Number(dangerLevel),
          tranquility_level: Number(tranquilityLevel),
          comfort_level: Number(comfortLevel)
        })
        .eq("id", editingSpotId);
      if (updateError) {
        setError("No se pudo actualizar el spot.");
        setCreatingSpot(false);
        return;
      }
      setInfo("Spot actualizado correctamente.");
    } else {
      const { error: insertError } = await (supabase as any).from("smoke_spots").insert({
        name: spotName.trim(),
        description: spotDescription.trim() || null,
        lat,
        lng,
        danger_level: Number(dangerLevel),
        tranquility_level: Number(tranquilityLevel),
        comfort_level: Number(comfortLevel),
        created_by: userId
      });
      if (insertError) {
        setError("No se pudo crear el spot. Revisa políticas RLS o datos.");
        setCreatingSpot(false);
        return;
      }
      setInfo("Spot creado y publicado en el mapa.");
    }
    setSpotName("");
    setSpotDescription("");
    setShowSpotForm(false);
    setEditingSpotId(null);
    setCreatingSpot(false);
    await loadSpots();
  };

  const startEditingSpot = (spot: SpotMapItem) => {
    setEditingSpotId(spot.id);
    setShowSpotForm(true);
    setSpotName(spot.name);
    setSpotDescription(spot.description ?? "");
    setSpotLat(String(spot.latitude));
    setSpotLng(String(spot.longitude));
    setDangerLevel(String(spot.dangerLevel));
    setTranquilityLevel(String(spot.tranquilityLevel));
    setComfortLevel(String(spot.comfortLevel));
  };

  const deleteSpot = async (spotId: string) => {
    const { error: deleteError } = await (supabase as any).from("smoke_spots").delete().eq("id", spotId);
    if (deleteError) {
      setError("No se pudo eliminar el spot.");
      return;
    }
    setInfo("Spot eliminado.");
    await loadSpots();
    if (selectedSpotId === spotId) setSelectedSpotId(null);
  };

  const voteSpot = async (spotId: string, value: -1 | 1) => {
    if (!currentUserId) {
      setError("Debes iniciar sesión para votar.");
      return;
    }
    const currentSpot = spots.find((spot) => spot.id === spotId);
    if (!currentSpot) return;

    if (currentSpot.myVote === value) {
      const { error: deleteError } = await (supabase as any)
        .from("smoke_spot_votes")
        .delete()
        .eq("spot_id", spotId)
        .eq("user_id", currentUserId);
      if (deleteError) {
        setError("No se pudo quitar tu voto.");
        return;
      }
      setInfo("Voto retirado.");
    } else {
      const { error: upsertError } = await (supabase as any)
        .from("smoke_spot_votes")
        .upsert(
          {
            spot_id: spotId,
            user_id: currentUserId,
            value
          },
          { onConflict: "spot_id,user_id" }
        );
      if (upsertError) {
        setError("No se pudo guardar tu voto.");
        return;
      }
      setInfo("Voto guardado.");
    }
    await loadSpots();
  };

  const confirmDeleteSpot = (spot: SpotMapItem) => {
    Alert.alert(
      "Eliminar spot",
      `¿Seguro que quieres eliminar "${spot.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void deleteSpot(spot.id);
          }
        }
      ]
    );
  };

  if (Platform.OS === "web") {
    return (
      <View className="flex-1 bg-botanical-bg">
        <ScrollView
          className="flex-1 px-4 pt-20"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {error ? <InlineError message={error} /> : null}
          {info ? (
            <View className="mb-3 rounded-2xl bg-emerald-50 px-4 py-3">
              <Text className="text-sm text-emerald-700">{info}</Text>
            </View>
          ) : null}
          <View className="mb-3 flex-row rounded-full bg-white p-1">
            <Pressable
              className={`flex-1 rounded-full px-4 py-2 ${mode === "clubs" ? "bg-botanical-primary" : ""}`}
              onPress={() => {
                setMode("clubs");
                setSelectedSpotId(null);
              }}
            >
              <Text className={`text-center text-sm ${mode === "clubs" ? "text-white" : "text-botanical-muted"}`}>Clubes</Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-full px-4 py-2 ${mode === "spots" ? "bg-botanical-primary" : ""}`}
              onPress={() => {
                setMode("spots");
                setSelectedClubId(null);
              }}
            >
              <Text className={`text-center text-sm ${mode === "spots" ? "text-white" : "text-botanical-muted"}`}>Spots</Text>
            </Pressable>
          </View>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={mode === "clubs" ? "Buscar club..." : "Buscar spot..."}
            className="mb-3 rounded-2xl border border-botanical-line bg-white px-4 py-3 text-botanical-text"
          />
          {mode === "spots" ? (
            <Pressable className="mb-3 rounded-full bg-botanical-primary px-4 py-2" onPress={() => setShowSpotForm((prev) => !prev)}>
              <Text className="text-center text-sm font-semibold text-white">
                {showSpotForm ? "Cerrar formulario spot" : "Añadir spot recomendado"}
              </Text>
            </Pressable>
          ) : null}
          {showSpotForm && mode === "spots" ? (
            <View className="mb-3 rounded-3xl bg-white p-4">
              <Text className="mb-2 text-xs text-botanical-muted">
                Consejo: en móvil puedes tocar el mapa para autocompletar lat/lng del spot.
              </Text>
              <TextInput value={spotName} onChangeText={setSpotName} placeholder="Nombre del spot" className="mb-2 rounded-2xl border border-botanical-line px-3 py-2" />
              <TextInput value={spotDescription} onChangeText={setSpotDescription} placeholder="Descripción (opcional)" className="mb-2 rounded-2xl border border-botanical-line px-3 py-2" />
              <View className="mb-2 flex-row gap-2">
                <TextInput value={spotLat} onChangeText={setSpotLat} placeholder="Lat" className="flex-1 rounded-2xl border border-botanical-line px-3 py-2" />
                <TextInput value={spotLng} onChangeText={setSpotLng} placeholder="Lng" className="flex-1 rounded-2xl border border-botanical-line px-3 py-2" />
              </View>
              {renderMetricPicker("Peligrosidad", "dangerLevel", dangerLevel, setDangerLevel)}
              {renderMetricPicker("Tranquilidad", "tranquilityLevel", tranquilityLevel, setTranquilityLevel)}
              {renderMetricPicker("Comodidad", "comfortLevel", comfortLevel, setComfortLevel)}
              <Pressable className="rounded-full bg-botanical-primary px-4 py-2" onPress={() => void createSpot()} disabled={creatingSpot}>
                <Text className="text-center text-sm font-semibold text-white">
                  {creatingSpot ? "Guardando..." : editingSpotId ? "Actualizar spot" : "Guardar spot"}
                </Text>
              </Pressable>
            </View>
          ) : null}
          <Text className="mb-3 text-botanical-primary">
            {mode === "clubs"
              ? "Selecciona un club para ver la ficha inferior de descubrimiento."
              : "Selecciona un spot para ver su ficha y métricas."}
          </Text>
          {loading ? <SkeletonList count={3} height={56} /> : null}
          {!loading && mode === "clubs" && filteredClubs.length === 0 ? (
            <View>
              <StateCard title="Sin resultados" description="No encontramos clubes para esta búsqueda." variant="empty" />
              <PrimaryEmptyAction label="Reintentar" onPress={onRefresh} />
            </View>
          ) : null}
          {!loading && mode === "spots" && filteredSpots.length === 0 ? (
            <View>
              <StateCard title="Sin spots aún" description="Sé el primero en compartir un spot recomendado." variant="empty" />
              <PrimaryEmptyAction label="Actualizar" onPress={onRefresh} />
            </View>
          ) : null}
          {(mode === "clubs" ? filteredClubs : filteredSpots).map((item) => (
            <Pressable
              key={item.id}
              className="mb-2 rounded-[20px] border border-botanical-line bg-white px-3.5 py-3"
              onPress={() => {
                if (mode === "clubs") setSelectedClubId(item.id);
                else setSelectedSpotId(item.id);
              }}
            >
              <Text className="text-botanical-muted">{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {mode === "clubs" && selectedClub ? (
          <View className="absolute bottom-0 left-0 right-0">
            <ClubMapCard
              clubName={selectedClub.name}
              distanceKm={calculateMockDistanceKm(selectedClub.latitude, selectedClub.longitude)}
              rating={selectedClub.rating}
              onViewProfile={() => router.push(`/club/${selectedClub.id}`)}
            />
          </View>
        ) : null}
        {mode === "spots" && selectedSpot ? (
          <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-4">
            <Text className="font-serif text-2xl text-botanical-primary">{selectedSpot.name}</Text>
            <Text className="mt-1 text-sm text-botanical-muted">{selectedSpot.description || "Spot recomendado por la comunidad."}</Text>
            <View className="mt-3 flex-row gap-3">
              <Text className="text-xs text-botanical-text">Peligrosidad: {selectedSpot.dangerLevel}/5</Text>
              <Text className="text-xs text-botanical-text">Tranquilidad: {selectedSpot.tranquilityLevel}/5</Text>
              <Text className="text-xs text-botanical-text">Comodidad: {selectedSpot.comfortLevel}/5</Text>
            </View>
            <Text className="mt-2 text-xs text-botanical-muted">Score comunidad: {selectedSpot.score}</Text>
            <View className="mt-2 flex-row gap-2">
              <Pressable
                className={`rounded-full px-3 py-1 ${selectedSpot.myVote === 1 ? "bg-emerald-100" : "bg-slate-100"}`}
                onPress={() => void voteSpot(selectedSpot.id, 1)}
              >
                <Text className="text-xs text-slate-700">👍</Text>
              </Pressable>
              <Pressable
                className={`rounded-full px-3 py-1 ${selectedSpot.myVote === -1 ? "bg-red-100" : "bg-slate-100"}`}
                onPress={() => void voteSpot(selectedSpot.id, -1)}
              >
                <Text className="text-xs text-slate-700">👎</Text>
              </Pressable>
              <Text className="self-center text-xs text-botanical-muted">Votos: {selectedSpot.votesScore}</Text>
            </View>
            {currentUserId && selectedSpot.createdBy === currentUserId ? (
              <View className="mt-3 flex-row gap-2">
                <Pressable className="rounded-full border border-botanical-primary px-4 py-2" onPress={() => startEditingSpot(selectedSpot)}>
                  <Text className="text-xs font-semibold text-botanical-primary">Editar</Text>
                </Pressable>
                <Pressable className="rounded-full border border-red-300 px-4 py-2" onPress={() => confirmDeleteSpot(selectedSpot)}>
                  <Text className="text-xs font-semibold text-red-600">Eliminar</Text>
                </Pressable>
              </View>
            ) : null}
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
          <StateCard title={mode === "clubs" ? "Cargando clubes..." : "Cargando spots..."} variant="loading" />
        </View>
      ) : null}

      {!loading && mode === "clubs" && filteredClubs.length === 0 ? (
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
      {!loading && mode === "spots" && filteredSpots.length === 0 ? (
        <View className="absolute left-4 right-4 top-20 z-10">
          <View>
            <StateCard title="Sin spots todavía" description="Usa el modo spots para crear el primero." variant="empty" />
            <PrimaryEmptyAction label="Actualizar" onPress={onRefresh} />
          </View>
        </View>
      ) : null}

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={(event: any) => {
          if (mode !== "spots" || !showSpotForm) return;
          const latitude = event?.nativeEvent?.coordinate?.latitude;
          const longitude = event?.nativeEvent?.coordinate?.longitude;
          if (typeof latitude === "number" && typeof longitude === "number") {
            setSpotLat(latitude.toFixed(6));
            setSpotLng(longitude.toFixed(6));
          }
        }}
      >
        {(mode === "clubs" ? filteredClubs : filteredSpots).map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            title={item.name}
            pinColor={mode === "clubs" ? "#2D463E" : "#8B5CF6"}
            onPress={() => {
              if (mode === "clubs") setSelectedClubId(item.id);
              else setSelectedSpotId(item.id);
            }}
          />
        ))}
      </MapView>
      {mode === "spots" ? (
        <View className="absolute right-3 top-24 rounded-2xl bg-white/95 px-3 py-2">
          <Text className="text-[11px] text-botanical-muted">Toca el mapa para fijar coordenadas del spot</Text>
        </View>
      ) : null}

      {mode === "clubs" && selectedClub ? (
        <View className="absolute bottom-0 left-0 right-0">
          <ClubMapCard
            clubName={selectedClub.name}
            distanceKm={calculateMockDistanceKm(selectedClub.latitude, selectedClub.longitude)}
            rating={selectedClub.rating}
            onViewProfile={() => router.push(`/club/${selectedClub.id}`)}
          />
        </View>
      ) : null}
      {mode === "spots" && selectedSpot ? (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-4">
          <Text className="font-serif text-2xl text-botanical-primary">{selectedSpot.name}</Text>
          <Text className="mt-1 text-sm text-botanical-muted">{selectedSpot.description || "Spot recomendado por la comunidad."}</Text>
          <View className="mt-3 flex-row gap-3">
            <Text className="text-xs text-botanical-text">Peligrosidad: {selectedSpot.dangerLevel}/5</Text>
            <Text className="text-xs text-botanical-text">Tranquilidad: {selectedSpot.tranquilityLevel}/5</Text>
            <Text className="text-xs text-botanical-text">Comodidad: {selectedSpot.comfortLevel}/5</Text>
          </View>
          <Text className="mt-2 text-xs text-botanical-muted">Score comunidad: {selectedSpot.score}</Text>
          <View className="mt-2 flex-row gap-2">
            <Pressable
              className={`rounded-full px-3 py-1 ${selectedSpot.myVote === 1 ? "bg-emerald-100" : "bg-slate-100"}`}
              onPress={() => void voteSpot(selectedSpot.id, 1)}
            >
              <Text className="text-xs text-slate-700">👍</Text>
            </Pressable>
            <Pressable
              className={`rounded-full px-3 py-1 ${selectedSpot.myVote === -1 ? "bg-red-100" : "bg-slate-100"}`}
              onPress={() => void voteSpot(selectedSpot.id, -1)}
            >
              <Text className="text-xs text-slate-700">👎</Text>
            </Pressable>
            <Text className="self-center text-xs text-botanical-muted">Votos: {selectedSpot.votesScore}</Text>
          </View>
          {currentUserId && selectedSpot.createdBy === currentUserId ? (
            <View className="mt-3 flex-row gap-2">
              <Pressable className="rounded-full border border-botanical-primary px-4 py-2" onPress={() => startEditingSpot(selectedSpot)}>
                <Text className="text-xs font-semibold text-botanical-primary">Editar</Text>
              </Pressable>
              <Pressable className="rounded-full border border-red-300 px-4 py-2" onPress={() => confirmDeleteSpot(selectedSpot)}>
                <Text className="text-xs font-semibold text-red-600">Eliminar</Text>
              </Pressable>
            </View>
          ) : null}
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
