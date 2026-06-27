import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ data }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const valueKey = Object.keys(data[0]).find(
      (k) => k !== "lat" && k !== "lon" && k !== "date"
    );

    const values = data.map((d) => d[valueKey]).filter((v) => v != null);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    const map = L.map(mapRef.current).setView([0, 75], 2);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
      data.forEach((point) => {
        if (point.lat == null || point.lon == null) return;
        const val = point[valueKey];
        const ratio =
          val != null ? (val - minVal) / (maxVal - minVal || 1) : 0.5;
        const r = Math.round(ratio * 255);
        const b = Math.round((1 - ratio) * 255);
        const color = `rgb(${r}, 50, ${b})`;

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28">
  <circle cx="14" cy="14" r="12" fill="${color}" stroke="white" stroke-width="2"/>
</svg>`;
        const icon = L.icon({
          iconUrl:
            "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([point.lat, point.lon], { icon })
          .bindTooltip(
            `<b>Lat:</b> ${point.lat}<br/>
             <b>Lon:</b> ${point.lon}<br/>
             ${valueKey ? `<b>${valueKey}:</b> ${Number(val).toFixed(2)}` : ""}`
          )
          .addTo(map);
      });
    }, 300);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data]);

  if (!data || data.length === 0) return null;
  const hasLatLon =
    data[0].hasOwnProperty("lat") && data[0].hasOwnProperty("lon");
  if (!hasLatLon) return null;

  const valueKey = Object.keys(data[0]).find(
    (k) => k !== "lat" && k !== "lon" && k !== "date"
  );
  const values = data.map((d) => d[valueKey]).filter((v) => v != null);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  return (
    <div style={{ marginTop: "12px", borderRadius: "12px", overflow: "hidden" }}>
      <div ref={mapRef} style={{ height: "280px", width: "100%" }} />
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.75rem",
        color: "#888",
        marginTop: "4px",
        padding: "0 4px"
      }}>
        <span>🔵 Low ({minVal.toFixed(2)})</span>
        <span>{valueKey} distribution map</span>
        <span>🔴 High ({maxVal.toFixed(2)})</span>
      </div>
    </div>
  );
}