import { useEffect, useState, Fragment } from "react";
import api from "../../api/axios";

/* ================= ALLOWED ADMIN STATUSES ================= */
const STATUS_OPTIONS = [
  "In Transit",
  "Customs Clearance",
  "On Hold",
  "Out for Delivery",
];

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [historyMap, setHistoryMap] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  /* ================= CREATE ORDER STATE ================= */
  const [sender, setSender] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [receiver, setReceiver] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [shipmentInfo, setShipmentInfo] = useState({
    origin: "",
    destination: "",
    weight: "",
    quantity: 1,
    estimatedDelivery: "6–10 business days",
    price: "",
    city: "",
    country: "",
    message: "",
  });

  /* ================= UPDATE STATE ================= */
  const [updateData, setUpdateData] = useState({
    status: "",
    city: "",
    country: "",
    message: "",
  });

  /* ================= LOAD SHIPMENTS ================= */
  const loadShipments = async () => {
    const res = await api.get("/shipments");
    setShipments(res.data || []);
  };

  useEffect(() => {
    loadShipments();
  }, []);

  /* ================= LOAD HISTORY ================= */
  const loadHistory = async (trackingNumber, shipmentId) => {
    if (historyMap[shipmentId]) {
      setExpandedId(expandedId === shipmentId ? null : shipmentId);
      return;
    }

    const res = await api.get(`/tracking/${trackingNumber}`);
    setHistoryMap((prev) => ({
      ...prev,
      [shipmentId]: res.data.history || [],
    }));
    setExpandedId(shipmentId);
  };

  /* ================= CREATE SHIPMENT ================= */
  const createShipment = async () => {
    const {
      origin,
      destination,
      weight,
      quantity,
      estimatedDelivery,
      price,
      city,
      country,
      message,
    } = shipmentInfo;

    if (
      !sender.name ||
      !sender.phone ||
      !sender.email ||
      !sender.address ||
      !receiver.name ||
      !receiver.phone ||
      !receiver.email ||
      !receiver.address ||
      !origin ||
      !destination ||
      !weight ||
      !price ||
      !city ||
      !country
    ) {
      alert("Please fill all required fields");
      return;
    }

    await api.post("/shipments", {
      sender,
      receiver,
      origin,
      destination,
      weight: Number(weight),
      quantity: Number(quantity),
      estimatedDelivery,
      price: Number(price),
      city,
      country,
      message,
    });

    setSender({ name: "", phone: "", email: "", address: "" });
    setReceiver({ name: "", phone: "", email: "", address: "" });
    setShipmentInfo({
      origin: "",
      destination: "",
      weight: "",
      quantity: 1,
      estimatedDelivery: "6–10 business days",
      price: "",
      city: "",
      country: "",
      message: "",
    });

    loadShipments();
  };

  /* ================= UPDATE STATUS ================= */
  const submitUpdate = async (id) => {
    const { status, city, country, message } = updateData;

    if (!status || !city || !country) {
      alert("Status, city and country are required");
      return;
    }

    await api.patch(`/shipments/${id}/status`, {
      status,
      city,
      country,
      message,
    });

    setUpdatingId(null);
    setUpdateData({ status: "", city: "", country: "", message: "" });
    loadShipments();
  };

  /* ================= DELETE SHIPMENT ================= */
  const deleteShipment = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure? This will permanently delete the shipment and its tracking history."
    );

    if (!confirmDelete) return;

    await api.delete(`/shipments/${id}`);
    loadShipments();
  };

  return (
    <div className="admin-page">
      <h2>Shipments</h2>

      {/* ================= CREATE ORDER ================= */}
      <div className="admin-card">
        <h3>Create Shipment (Admin Order)</h3>

        <div className="shipment-form-grid">
          {/* SENDER */}
          <div className="shipment-box">
            <h4>Sender Information</h4>
            <input placeholder="Name" value={sender.name}
              onChange={(e) => setSender({ ...sender, name: e.target.value })} />
            <input placeholder="Phone" value={sender.phone}
              onChange={(e) => setSender({ ...sender, phone: e.target.value })} />
            <input placeholder="Email" value={sender.email}
              onChange={(e) => setSender({ ...sender, email: e.target.value })} />
            <input placeholder="Address" value={sender.address}
              onChange={(e) => setSender({ ...sender, address: e.target.value })} />
          </div>

          {/* RECEIVER */}
          <div className="shipment-box">
            <h4>Receiver Information</h4>
            <input placeholder="Name" value={receiver.name}
              onChange={(e) => setReceiver({ ...receiver, name: e.target.value })} />
            <input placeholder="Phone" value={receiver.phone}
              onChange={(e) => setReceiver({ ...receiver, phone: e.target.value })} />
            <input placeholder="Email" value={receiver.email}
              onChange={(e) => setReceiver({ ...receiver, email: e.target.value })} />
            <input placeholder="Address" value={receiver.address}
              onChange={(e) => setReceiver({ ...receiver, address: e.target.value })} />
          </div>

          {/* SHIPMENT */}
          <div className="shipment-box">
            <h4>Shipment Information</h4>
            <input placeholder="Origin" value={shipmentInfo.origin}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, origin: e.target.value })} />
            <input placeholder="Destination" value={shipmentInfo.destination}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, destination: e.target.value })} />
            <input placeholder="Weight (kg)" type="number" value={shipmentInfo.weight}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, weight: e.target.value })} />
            <input placeholder="Quantity" type="number" value={shipmentInfo.quantity}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, quantity: e.target.value })} />
            <input placeholder="Estimated delivery" value={shipmentInfo.estimatedDelivery}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, estimatedDelivery: e.target.value })} />
            <input placeholder="Price" type="number" value={shipmentInfo.price}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, price: e.target.value })} />
            <input placeholder="City" value={shipmentInfo.city}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, city: e.target.value })} />
            <input placeholder="Country" value={shipmentInfo.country}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, country: e.target.value })} />
            <input placeholder="Admin note (optional)" value={shipmentInfo.message}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, message: e.target.value })} />
          </div>
        </div>

        <div className="shipment-actions">
          <button onClick={createShipment}>Create Order</button>
        </div>
      </div>

      {/* ================= SHIPMENTS TABLE ================= */}
      <table className="admin-table">
        <tbody>
          {shipments.map((s) => (
            <Fragment key={s._id}>
              <tr>
                <td><strong>{s.trackingNumber}</strong></td>

                <td>
                  <div><strong>Sender:</strong> {s.sender?.name}</div>
                  <div><strong>Receiver:</strong> {s.receiver?.name}</div>
                </td>

                <td>
                  <div>{s.origin} → {s.destination}</div>
                  <div>{s.weight}kg</div>
                </td>

                {/* STATUS BADGE */}
                <td>
                  <span
                    className={`status ${s.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {s.status}
                  </span>
                </td>

                <td>
                  <button onClick={() => loadHistory(s.trackingNumber, s._id)}>
                    {expandedId === s._id ? "Hide History" : "View History"}
                  </button>

                  {/* ❌ Disable update if Delivered */}
                  {!s.isDelivered && (
                    <button onClick={() => setUpdatingId(s._id)}>
                      Update Status
                    </button>
                  )}

                  {/* 🗑️ DELETE SHIPMENT */}
                  <button
                    style={{ background: "#991b1b" }}
                    onClick={() => deleteShipment(s._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>

              {/* UPDATE STATUS PANEL */}
              {updatingId === s._id && (
                <tr>
                  <td colSpan="5">
                    <select
                      value={updateData.status}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, status: e.target.value })
                      }
                    >
                      <option value="">Select status</option>
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>

                    <input
                      placeholder="City"
                      value={updateData.city}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, city: e.target.value })
                      }
                    />

                    <input
                      placeholder="Country"
                      value={updateData.country}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, country: e.target.value })
                      }
                    />

                    <input
                      placeholder="Admin note"
                      value={updateData.message}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, message: e.target.value })
                      }
                    />

                    <button onClick={() => submitUpdate(s._id)}>Save</button>
                    <button onClick={() => setUpdatingId(null)}>Cancel</button>
                  </td>
                </tr>
              )}

              {/* HISTORY */}
              {expandedId === s._id && historyMap[s._id] && (
                <tr>
                  <td colSpan="5">
                    {historyMap[s._id].map((h, i) => (
                      <div key={i} className="history-item">
                        <strong>📍 {h.city}, {h.country}</strong>
                        <div>{h.status}</div>
                        {h.message && <div>{h.message}</div>}
                        <small>{new Date(h.createdAt).toLocaleString()}</small>
                      </div>
                    ))}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
