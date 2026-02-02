# Tanamur Application Architecture Reference
> [!NOTE]
> This document serves as a technical blueprint for the "Tanamur" Legacy GPS Tracking system, designed to assist in the migration/rebuild using modern frameworks like CodeIgniter 4.

## 1. Core Methodology: Kecepatan Turbo & Hemat Bandwidth
This application was built for high-performance scale on limited network infrastructure. It is designed like a "tight" optimized piece of machine code rather than a "loose" modern web app.

### 1. The Cache-First Strategy (`web_LastPos.php`)
This is the most significant script for **Turbo Speed**.
Look at **`web_LastPos.php` (Lines 19–34)**. Instead of hitting the MySQL database for every fleet update (which is slow), the app checks the "File Modification Time" (`filemtime`) of a small text file (`company_[id].txt`).

- **Logic**: If the vehicle data hasn't changed since the user's last check, the server returns an empty response almost instantly (in milliseconds). It doesn't even open a database connection. This is the "Turbo" part—the interface feels instantaneous because it's reading from a RAM-cached or lightweight file system instead of a heavy SQL query.

### 2. Custom Binary Encoding (`global.php`)
This is where the **Hemat Bandwidth** (Save Bandwidth) happens.
In **`global.php`**, find the **`binEncode`** and **`hexEncode`** functions.

- **Logic**: Most web apps send data in long, readable strings (JSON). Your app compresses coordinate data and status bits into a custom binary-like format. For example, instead of sending `"latitude": -6.12345, "longitude": 106.12345`, the system might pack all of that into a 20-character non-human-readable string. This reduces the size of every "pulse" by **60-80%**, which was critical back when GPS trackers relied on expensive GPRS/2G data plans.

### 3. The "Frame" Compression (`frame.php`)
In **`frame.php` (Lines 94–101)**, you can see how the app handles the UI transport.

- **Logic**: Instead of serving a standard HTML file that the browser has to parse and render multiple times, the app reads the HTML, finds the first tag, and then encodes the entire structure into a compressed binary blob.
```php
$ipos = strpos($str, "<");
$txt = substr($str, $ipos);
$txt .= str_repeat(" ", 400); // Standard padding
$str = binEncode($txt);
exitOK($str);
```
By sending the whole UI as an encoded binary package, the browser downloads it as a single "chunk" that is treated like a binary resource, which bypasses some of the overhead of standard HTML delivery and keeps the interface "locked" and fast.

### Summary
*   **Turbo Speed**: Achieved via File-System Buffering (not always waiting for SQL).
*   **Hemat Bandwidth**: Achieved via Custom Binary Protocols and Minimalist Payloads (no redundant JSON keys like "lat": or "lon":).

---

## 2. Positioning & Accuracy Logic
High-accuracy tracking requires handling hardware quirks and satellite resets.

### A. GPS Week Rollover & Leap Year Correction ("Tahun Kabisat")
Every 1024 weeks (~19.6 years), GPS hardware counters reset, often causing older devices to report dates exactly 7,168 days in the past or future. The app mathematically "bounces" these dates back to the current window.

- **Script**: `gps08post.php`
- **Methodology**: Uses a `CASE` statement during the data ingestion pulse to verify if the reported date is logically sound compared to `NOW()`.

```php
// gps08post.php: Data Normalization Query
$qry = "UPDATE receiverposition t 
    LEFT JOIN gps_zone z ON t.kode=z.kode 
    SET t.dtime = CASE 
        -- Handles hardware sending year 2002 or zero coordinates
        WHEN t.longitude=0 THEN IF( t.dtime>'2002-02-02', '2002-02-02', t.dtime) 
        
        -- Catch dates ~80 years in the future (29,357 days)
        WHEN (DATE_SUB(t.dtime,INTERVAL 29350 DAY)>NOW()) THEN (t.dtime - INTERVAL 29357 DAY)	
        
        -- Catch dates ~19.6 years in the future (1024 weeks / 7,168 days)
        WHEN (DATE_SUB(t.dtime,INTERVAL 7160 DAY)>NOW()) THEN (t.dtime - INTERVAL 7168 DAY)
        
        -- Fix dates reported 1024 weeks in the past
        WHEN (DATEDIFF(NOW(), t.dtime) BETWEEN 7167 AND 7169) THEN (t.dtime + INTERVAL 7168 DAY)
        
        -- Standard Timezone adjustment (WIB/GMT+7)
        ELSE (t.dtime - INTERVAL IFNULL(z.iwaktu,0) HOUR) 
        END";
```

### B. Map Accuracy: Gliding Markers
To prevent "jumping" icons, the app uses a pulse-based update with angular heading calculation.
- **Frontend Logic**: The map layer calculates the delta between the old and new coordinates.
- **Icon Rotation**: The `heading` field (0-360) is sent from the hardware and used to rotate the vehicle icon in the `xmap.js` layer.

---

## 3. Gasoline & Sensor Logic: Dual-Point Calibration
The gasoline utilization isn't hardcoded; it's a linear mathematical model.

- **Formula**: `Liter = Liter1 + ( (Volt_Now - Volt1) * (Liter2 - Liter1) / (Volt2 - Volt1) )`
- **Storage**: Point A (Volt1, Liter1) and Point B (Volt2, Liter2) are stored in the `mobil` table.
- **Utilization**: KM/Liter is calculated by comparing the fuel tank delta against the `gpsmeter` (odometer) delta.

---

## 4. Stateless API Hierarchy
This application uses a unique **Stateless Hex-Encoded JSONP API** architecture. Instead of using standard Bearer Tokens or Cookies, the credentials and state are packed into a JSON object, hex-encoded for basic obfuscation, and passed in almost every request.

### Primary API Categories and Endpoints

#### 1. Authentication & Session Services
- **`web_logon.php`**: The entry point for all modern interfaces (Web & Mobile).
- **`j2meLogon.php`**: Legacy authentication for JAR/J2ME mobile applications (old Nokia/Blackberry style).
- **`upd_pwdChange.php`**: Endpoint for changing user passwords.

#### 2. Live Tracking Services
- **`web_LastPos.php`**: High-speed endpoint used for the "Live" dashboard. Optimized with file-system caching (`company_[id].txt`) to provide "Turbo" updates without hitting the database on every pulse.
- **`web_ReadTbl.php`**: The "Swiss Army Knife" API. It handles multiple request types (`tname`) including:
    - `position`: Real-time coordinate updates.
    - `mobil`: Fleet metadata retrieval.
    - `fuelhis`: Historical fuel and temperature logs.
    - `poi`: Point of Interest data.
    - `geo_read`: Geofence definitions.

#### 3. Historical & Data Services
- **`web_report.php`**: Dedicated API for fetching historical travel reports, engine playtime, and geofence logs.
- **`web_getmaster.php`**: Fetches global master data (like address lists or company profiles).
- **`web_Geofence.php`**: API for saving or modifying geofence boundaries.

#### 4. Management & Update Services
- **`upd_mobChange.php`**: Updates vehicle settings (names, fuel calibration, icons).
- **`upd_user.php`**: Manages user accounts and access rights.
- **`web_create_new_mobil.php`**: Handles the logic for newly detected hardware on the network.

### Authentication Method: "Stateless Payload Auth"
The APIs do not use standard headers. Authentication is handled inside the payload:

1. **Transport**: All requests are sent via `GET` using a `req` parameter.
2. **Encoding**: The `req` value is a **Hex-Encoded JSON String**.
3. **Encapsulation**: Inside that decoded JSON, you must provide:
    - `cid`: Company ID.
    - `u`: Username.
    - `uid`: User ID (Token).
4. **Validation**: Every time an API script (like `web_ReadTbl.php`) runs, it immediately decodes this payload and verifies the user's rights against a cached security file in the `./access/userid/` directory.

This architecture allows the app to be extremely portable and performant, as the server doesn't have to keep thousands of active session files open in memory—each request tells the server exactly who it is and what it's allowed to see.

---

## 5. Migration Blueprint: CodeIgniter 4 & React
For the from-scratch rebuild, the system will move from a monolithic PHP structure to a modern Decoupled Architecture.

### Proposed Directory Structure
```text
/root/
├── backend/   (CodeIgniter 4 API)
└── frontend/  (React JS Application)
```

### Technical Stack
- **Backend**: **CodeIgniter 4** (Handling RESTful API, Binary Parsing, and Background Pulses).
- **Frontend**: **React** (State-managed Dashboard with Real-time Map updates).
- **Database**: **MySQL** (Relational storage for fleet, users, and tracking logs).
- **Styling**: **Tailwind CSS** (Modern utility-first styling for a premium UI look).

### Migration Recommendations
1. **Migration-Ready Settings**: Move all hardcoded hex strings and phone numbers into a `SystemSettings` table.
2. **Buffer Persistence**: Replicate the "Company File" logic using CI4's `Cache` driver (Redis or File-based).
3. **Hex Service**: Create a dedicated `EncodingService` in CI4 to handle the legacy `binEncode` / `hexEncode` so existing GPS hardware can still talk to the new server.
4. **Task Scheduling**: Replace the `gps08post.php` looping pulse with a CI4 CLI Command running as a background worker.

---

## 6. Popular GPS Tracker Brands & Protocols (Indonesia)
This list contains the most common hardware targets for this application in the Indonesia region. Each series often requires specific listener ports and custom parser logic.

### 🚘 Concox / GTxx Series
Common China-made devices using the "GT" protocol variant:
- **Models**: GT06, GT06N, GT06E, GT06F, GT02, GT03, GT08, GT100, TR02, TR06, AT3, AT4, AT-1, GV20, GV25, JM01, JV200, MT200, Qbit.

### 🛰️ Meitrack
Advanced telematics with extended data fields and rich telemetry:
- **Models**: MT88, MT90, MVT100, MVT340, MVT380, MVT600, MVT800, T1, T3, T322, T622.

### 📡 Teltonika
European-built professional devices (supporting CAN bus and industrial sensors):
- **Models**: FM1010, FM1100, FM1120, FM1202, FM2100, FM2200, FM3200, FM4200, FM5300.

### 📍 Xexun / TK Series
Classic low-cost GSM tracker family:
- **Models**: TK101, TK102, TK103, TK201, TK202, TK203, XT009, XT011, XT107.

### 📊 Meiligao
Supports Meiligao protocol variants:
- **Models**: GT30i, GT60, VT300, VT310, VT400, VT600.

### 📶 Atrack
- **Models**: AT1, AT1 Pro, AT3, AT5, AT5i, AU5i, AX5, AY5i.

### 🔹 Bofan
- **Models**: PT80, PT95, PT100, PT200, PT300X, PT500, PT600X.

### 🚚 Coban
Known for older large series protocols:
- **Models**: GPS102 – GPS107, GPS301 – GPS306.

### 🔊 Eelink
- **Models**: GOT08, GOT10, TK115, TK121.

### 🔧 Ruptela
European telematics brand:
- **Models**: FM-Eco3, FM-Eco4, FM-Pro3, FM-Pro3R, FM-Trailer series.

### 📡 Topflytech
Industrial/project-oriented models:
- **Models**: T8801, T8803, T8901.
