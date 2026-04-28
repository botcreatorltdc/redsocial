import React, { useEffect } from "react";
import L from "leaflet";

type MapItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  pinType: "club" | "spot";
};

type WebInteractiveMapProps = {
  items: MapItem[];
  onSelect: (id: string) => void;
  canPickCoordinates: boolean;
  onPickCoordinates: (lat: number, lng: number) => void;
};

const clubIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const spotIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export function WebInteractiveMap({
  items,
  onSelect,
  canPickCoordinates,
  onPickCoordinates
}: WebInteractiveMapProps) {
  useEffect(() => {
    const id = "leaflet-css-cdn";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const container = document.getElementById("web-interactive-map");
    if (!container) return;

    const map = L.map(container, {
      center: [41.3874, 2.1686],
      zoom: 13
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    items.forEach((item) => {
      const marker = L.marker([item.latitude, item.longitude], {
        icon: item.pinType === "club" ? clubIcon : spotIcon
      }).addTo(markerLayer);
      marker.bindPopup(item.name);
      marker.on("click", () => onSelect(item.id));
    });

    const clickHandler = (event: L.LeafletMouseEvent) => {
      if (!canPickCoordinates) return;
      onPickCoordinates(event.latlng.lat, event.latlng.lng);
    };
    map.on("click", clickHandler);

    return () => {
      map.off("click", clickHandler);
      map.remove();
    };
  }, [items, canPickCoordinates, onPickCoordinates, onSelect]);

  return <div id="web-interactive-map" style={{ height: "100%", width: "100%", borderRadius: 24, overflow: "hidden" }} />;
}
