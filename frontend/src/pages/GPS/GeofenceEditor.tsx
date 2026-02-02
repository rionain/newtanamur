import React, { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import { geofences } from "../../utils/apiClient";
import { GoogleMap, useJsApiLoader, DrawingManager, Polygon, Circle } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '600px'
};

const defaultCenter = {
    lat: -6.200000,
    lng: 106.816666
};

const libraries: ("drawing" | "geometry" | "places" | "visualization")[] = ["drawing"];

const GeofenceEditor: React.FC = () => {
    const [existingGeofences, setExistingGeofences] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [selectedType, setSelectedType] = useState<"polygon" | "circle">("polygon");
    const [currentCoordinates, setCurrentCoordinates] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
        libraries
    });

    const fetchGeofences = useCallback(async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (!user.cid) return;
            const res = await geofences.list(user.cid);
            if (res.status === "ok") {
                setExistingGeofences(res.data.map((g: any) => ({
                    ...g,
                    coordinates: JSON.parse(g.coordinates)
                })));
            }
        } catch (err) {
            console.error("Failed to fetch geofences:", err);
        }
    }, []);

    useEffect(() => {
        fetchGeofences();
    }, [fetchGeofences]);

    const onPolygonComplete = (polygon: google.maps.Polygon) => {
        const path = polygon.getPath();
        const coords = [];
        for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            coords.push({ lat: point.lat(), lng: point.lng() });
        }
        setCurrentCoordinates(coords);
        setSelectedType("polygon");
        polygon.setMap(null); // Remove the drawn polygon as we'll render it ourselves
    };

    const onCircleComplete = (circle: google.maps.Circle) => {
        const center = circle.getCenter();
        const coords = {
            center: { lat: center?.lat(), lng: center?.lng() },
            radius: circle.getRadius()
        };
        setCurrentCoordinates(coords);
        setSelectedType("circle");
        circle.setMap(null);
    };

    const handleSave = async () => {
        if (!name || !currentCoordinates) {
            setError("Please provide a name and draw a geofence on the map.");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await geofences.save(user.cid, {
                name,
                type: selectedType,
                coordinates: currentCoordinates,
                color: "#3B82F6"
            });

            if (res.status === "ok") {
                setName("");
                setCurrentCoordinates(null);
                fetchGeofences();
                alert("Geofence saved successfully!");
            }
        } catch (err) {
            setError("Failed to save geofence. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this geofence?")) return;

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await geofences.delete(user.cid, id);
            if (res.status === "ok") {
                fetchGeofences();
            }
        } catch (err) {
            alert("Failed to delete geofence.");
        }
    };

    if (!isLoaded) return <div className="p-10 text-center animate-pulse">Loading Map Engine...</div>;

    return (
        <>
            <PageMeta
                title="Tanamur GPS | Geofence Editor"
                description="Create and manage your fleet geofences on a map."
            />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Geofence Polygon Editor</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar: Management */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Create New</h2>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-500">Geofence Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Warehouse Zone"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                {currentCoordinates ? (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-lg border border-green-100 dark:border-green-800">
                                        Geometry captured: {selectedType.toUpperCase()}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 text-gray-500 text-xs rounded-lg border border-gray-100 dark:border-gray-800 italic">
                                        Use drawing tools on top of the map.
                                    </div>
                                )}
                                {error && <p className="text-red-500 text-xs">{error}</p>}
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !currentCoordinates}
                                    className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save Geofence"}
                                </button>
                            </div>
                        </div>

                        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-h-[400px] overflow-y-auto">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Existing Zones</h2>
                            <div className="space-y-2">
                                {existingGeofences.map(gf => (
                                    <div key={gf.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 group">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">{gf.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{gf.type}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(gf.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                                {existingGeofences.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm py-4">No geofences found.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main: Map */}
                    <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 relative">
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={defaultCenter}
                            zoom={10}
                        >
                            <DrawingManager
                                onPolygonComplete={onPolygonComplete}
                                onCircleComplete={onCircleComplete}
                                options={{
                                    drawingControl: true,
                                    drawingControlOptions: {
                                        position: google.maps.ControlPosition.TOP_CENTER,
                                        drawingModes: [
                                            google.maps.drawing.OverlayType.POLYGON,
                                            google.maps.drawing.OverlayType.CIRCLE,
                                        ],
                                    },
                                    polygonOptions: {
                                        fillColor: "#3B82F6",
                                        fillOpacity: 0.3,
                                        strokeWeight: 2,
                                        clickable: false,
                                        editable: true,
                                        zIndex: 1,
                                    },
                                    circleOptions: {
                                        fillColor: "#3B82F6",
                                        fillOpacity: 0.3,
                                        strokeWeight: 2,
                                        clickable: false,
                                        editable: true,
                                        zIndex: 1,
                                    }
                                }}
                            />

                            {/* Render Preview of current unsaved shape if needed, or rely on internal DrawingManager handles */}

                            {/* Render Existing Geofences */}
                            {existingGeofences.map(gf => (
                                gf.type === 'polygon' ? (
                                    <Polygon
                                        key={gf.id}
                                        paths={gf.coordinates}
                                        options={{
                                            fillColor: gf.color,
                                            fillOpacity: 0.2,
                                            strokeColor: gf.color,
                                            strokeWeight: 2
                                        }}
                                    />
                                ) : (
                                    <Circle
                                        key={gf.id}
                                        center={gf.coordinates.center}
                                        radius={gf.coordinates.radius}
                                        options={{
                                            fillColor: gf.color,
                                            fillOpacity: 0.2,
                                            strokeColor: gf.color,
                                            strokeWeight: 2
                                        }}
                                    />
                                )
                            ))}
                        </GoogleMap>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeofenceEditor;
