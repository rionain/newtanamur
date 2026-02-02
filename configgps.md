# 🛰️ GPS Hardware Configuration Guide

To connect real GPS devices (Concox, Meitrack, Coban, etc.) to the **Tanamur GPS Rebuild** system, follow these configuration steps.

## 1. Server Connection Settings
The GPS hardware must be pointed to your public IP or Domain where the CodeIgniter 4 backend is hosted.

| Parameter | Recommended Value |
| :--- | :--- |
| **Server Address** | `your-domain.com` or `YOUR_PUBLIC_IP` |
| **Port** | `80` (Standard HTTP) or `8080` (Dev Port) |
| **Protocol** | `HTTP POST` |
| **Data Format** | `Hex-Encoded JSON` (Standard) |

### Configuration Commands (via SMS)
*Note: Commands vary by device model. Below are examples for Concox/GT06.*

1. **Set IP/Port**: `SERVER,1,your-domain.com,8080,0#`
2. **Set APN**: `APN,internet#`
3. **Set Upload Interval**: `TIMER,10#` (10 seconds for Turbo Speed)

---

## 2. Backend URL Endpoint
Real hardware should be configured to send data to the following API path:
`http://your-domain.com:8080/api/pulse`

---

## 3. Registering the Device
Before the system can process data, the `device_kode` (IMEI or ID) must be registered in the Tanamur Dashboard.

1.  Login to Tanamur Dashboard.
2.  Go to **Armada > Registrasi Armada**.
3.  Enter the **Device Code** (This MUST match the ID sent by the hardware).
4.  Set your **Fuel Calibration** (Voltage vs Liter) if using fuel sensors.

---

## 4. Troubleshooting Checklist
- [ ] **Firewall**: Ensure port `8080` is open on your router/server.
- [ ] **SIM Card**: Verify the SIM has an active data plan and no PIN lock.
- [ ] **Database**: Verify the `device_kode` in the `mobil` table exactly matches what the device sends.
- [ ] **Logs**: Check `backend/writable/logs/` for any ingestion errors.

---

> [!IMPORTANT]
> The current implementation uses **Stateless Pulse Ingestion**. If your hardware sends raw binary data (TCP/UDP) instead of HTTP POST, you will need to point them to a Binary Gateway (Gateway Implementation is the next module).
