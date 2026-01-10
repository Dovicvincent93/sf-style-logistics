import { useState, useEffect, useRef } from "react";
import "./Track.css";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ================= FIX LEAFLET ICON ================= */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ================= STATUS ICONS ================= */
const statusIcons = {
  Pending: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/594/594846.png",
    iconSize: [28, 28],
  }),
  "In Transit": new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 30],
  }),
  "Custom Clearance": new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
    iconSize: [28, 28],
  }),
  "On Hold": new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/463/463612.png",
    iconSize: [26, 26],
  }),
  Delivered: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
    iconSize: [28, 28],
  }),
};

/* ================= MOVING ICON ================= */
const movingIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995470.png",
  iconSize: [32, 32],
});

export default function Track() {
  const location = useLocation();
  const intervalRef = useRef(null);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shipment, setShipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [coords, setCoords] = useState([]);

  /* 🟢 Animated marker */
  const [movingIndex, setMovingIndex] = useState(0);

  /* ================= AUTO-FILL ================= */
  useEffect(() => {
    if (location.state?.trackingNumber) {
      setTrackingNumber(location.state.trackingNumber);
    }
  }, [location.state]);

  /* ================= TRACK SHIPMENT ================= */
  const trackShipment = async () => {
    if (!trackingNumber) {
      setError("Please enter a tracking number");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setShipment(null);
      setHistory([]);
      setCoords([]);
      setMovingIndex(0);

      const res = await api.get(`/tracking/${trackingNumber}`);

      setShipment(res.data.shipment);
      setHistory(res.data.history);

      const points = res.data.history
        .filter((h) => h.lat && h.lng)
        .map((h) => [h.lat, h.lng]);

      setCoords(points);
    } catch (err) {
      setError(err.response?.data?.message || "Tracking number not found");
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTO-TRACK ================= */
  useEffect(() => {
    if (trackingNumber) {
      trackShipment();
    }
    // eslint-disable-next-line
  }, [trackingNumber]);

  /* ================= ANIMATE MOVEMENT ================= */
  useEffect(() => {
    if (coords.length < 2) return;

    intervalRef.current = setInterval(() => {
      setMovingIndex((prev) => {
        if (prev >= coords.length - 1) {
          clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(intervalRef.current);
  }, [coords]);

  return (
    <section
      style={{
        minHeight: "80vh",
        padding: "60px 20px",
        background: "#f8fafc",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1100px" }}>
        <h1 style={{ textAlign: "center", marginBottom: 10 }}>
          Track Your Shipment
        </h1>

        <p style={{ textAlign: "center", color: "#64748b" }}>
          Enter your Dovic Express tracking number to view shipment progress
        </p>

        {/* ================= INPUT ================= */}
        <div className="card">
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Tracking Number"
          />
          <button onClick={trackShipment} disabled={loading}>
            {loading ? "Tracking..." : "Track Shipment"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>

        {/* ================= MAP ================= */}
        {coords.length > 0 && (
          <div className="map-card">
            <MapContainer
              center={coords[movingIndex]}
              zoom={4}
              style={{ height: "420px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* 🔵 Planned route */}
              {coords.length > 1 && (
                <Polyline
                  positions={[coords[0], coords[coords.length - 1]]}
                  pathOptions={{ color: "#2563eb", weight: 3 }}
                />
              )}

              {/* 🟡 Actual route */}
              {coords.length > 1 && (
                <Polyline
                  positions={coords}
                  pathOptions={{
                    color: "#ffd400",
                    weight: 4,
                    dashArray: "8 12",
                  }}
                />
              )}

              {/* 📍 History markers */}
              {coords.map((c, i) => (
                <Marker
                  key={i}
                  position={c}
                  icon={statusIcons[history[i]?.status]}
                >
                  <Popup>
                    <strong>{history[i]?.status}</strong>
                    <br />
                    📍 {history[i]?.city}, {history[i]?.country}
                  </Popup>
                </Marker>
              ))}

              {/* 🚚 Animated marker */}
              <Marker position={coords[movingIndex]} icon={movingIcon}>
                <Popup>Shipment moving</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* ================= SHIPMENT DETAILS ================= */}
        {shipment && (
          <div className="card">
            <h3>Shipment Information</h3>
            <p><strong>Tracking Number:</strong> {shipment.trackingNumber}</p>
            <p><strong>Status:</strong> {shipment.status}</p>
            <p><strong>Origin:</strong> {shipment.origin}</p>
            <p><strong>Destination:</strong> {shipment.destination}</p>
            <p><strong>Estimated Delivery:</strong> {shipment.estimatedDelivery}</p>
            <p><strong>Weight:</strong> {shipment.weight} kg</p>
            <p><strong>Quantity:</strong> {shipment.quantity}</p>
            <p><strong>Shipping Cost:</strong> ${shipment.price}</p>
          </div>
        )}

        {/* ================= TRACKING HISTORY ================= */}
        {history.length > 0 && (
          <div className="card">
            <h3>Shipment Timeline</h3>
            {history.map((h, i) => (
              <div key={i} className="history-item">
                <strong>{h.status}</strong>
                <div style={{ color: "#64748b" }}>
                  📍 {h.city}, {h.country}
                </div>
                {h.message && <p>{h.message}</p>}
                <small>{new Date(h.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
