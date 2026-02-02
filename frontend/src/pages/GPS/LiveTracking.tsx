import React, { useState, useEffect, useCallback } from "react";
import { tracking } from "../../utils/apiClient";
import PageMeta from "../../components/common/PageMeta";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: -6.200000,
    lng: 106.816666
};

const LiveTracking: React.FC = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [lastFetch, setLastFetch] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || ""
    });

    const fetchPositions = useCallback(async () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        try {
            const res = await tracking.getLastPos(user.cid, lastFetch);
            if (res.status === "ok") {
                setVehicles(res.data);
                setLastFetch(res.time);
            }
            setIsLoading(false);
        } catch (err) {
            console.error("Tracking Error:", err);
        }
    }, [lastFetch]);

    useEffect(() => {
        fetchPositions();
        const interval = setInterval(fetchPositions, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchPositions]);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(_map: google.maps.Map) {
        setMap(null);
    }, []);

    const centerMapOnVehicle = (v: any) => {
        if (map) {
            map.panTo({ lat: Number(v.last_lat), lng: Number(v.last_lng) });
            map.setZoom(16);
        }
        setSelectedVehicle(v);
    };

    return (
        <>
            <PageMeta
                title="Tanamur GPS | Live Tracking"
                description="Real-time vehicle tracking on map."
            />
            <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                        Live Tracking
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="flex w-3 h-3 bg-success-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-gray-500">Live Feed</span>
                    </div>
                </div>

                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Map Area */}
                    <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/[0.05] dark:bg-white/[0.03] relative overflow-hidden">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={defaultCenter}
                                zoom={12}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                options={{
                                    mapTypeControl: true,
                                    streetViewControl: false,
                                    fullscreenControl: true,
                                }}
                            >
                                {vehicles.map((v) => (
                                    <Marker
                                        key={v.id}
                                        position={{ lat: Number(v.last_lat), lng: Number(v.last_lng) }}
                                        onClick={() => setSelectedVehicle(v)}
                                        onMouseOver={() => setSelectedVehicle(v)}
                                        icon={{
                                            url: "https://maps.google.com/mapfiles/ms/icons/truck.png",
                                            scaledSize: new google.maps.Size(32, 32),
                                        }}
                                    />
                                ))}

                                {selectedVehicle && (
                                    <InfoWindow
                                        position={{ lat: Number(selectedVehicle.last_lat), lng: Number(selectedVehicle.last_lng) }}
                                        onCloseClick={() => setSelectedVehicle(null)}
                                    >
                                        <div className="p-1 min-w-[150px]">
                                            <h3 className="font-bold text-sm text-gray-900 mb-1">{selectedVehicle.name}</h3>
                                            <p className="text-xs text-gray-600 mb-1">Plate: <b>{selectedVehicle.plate_number}</b></p>
                                            <p className="text-xs text-gray-600">Speed: <b>{selectedVehicle.last_speed} km/h</b></p>
                                            <p className="text-[10px] text-gray-400 mt-2">{new Date(selectedVehicle.last_dtime).toLocaleString()}</p>
                                        </div>
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="size-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400 animate-pulse">
                                        📍
                                    </div>
                                    <p className="text-gray-500 font-medium italic">Loading Maps...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="w-80 shrink-0 flex flex-col gap-4 overflow-hidden">
                        <div className="flex-1 rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-white/[0.05] shrink-0">
                                <h2 className="font-semibold text-gray-800 dark:text-white/90">Unit List</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{vehicles.length} units online</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {isLoading && vehicles.length === 0 && (
                                    <div className="text-center p-10 text-gray-400 text-sm">Loading fleet...</div>
                                )}
                                {vehicles.map((v, i) => (
                                    <div
                                        key={i}
                                        onClick={() => centerMapOnVehicle(v)}
                                        className={`p-3 rounded-xl cursor-pointer border transition-all text-left ${selectedVehicle?.id === v.id
                                            ? 'bg-brand-50 border-brand-200 dark:bg-brand-500/10'
                                            : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1 text-left">
                                            <span className="font-semibold text-gray-800 dark:text-white/90 text-sm">{v.name} ({v.plate_number})</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${Number(v.last_speed) > 0 ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
                                                }`}>
                                                {Number(v.last_speed) > 0 ? 'Moving' : 'Stopped'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1 text-left">
                                            <p className="flex items-center gap-1">💨 {v.last_speed} km/h</p>
                                            <p className="truncate">📍 {Number(v.last_lat).toFixed(4)}, {Number(v.last_lng).toFixed(4)}</p>
                                            <p className="text-[10px] text-gray-400">🕒 {new Date(v.last_dtime).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LiveTracking;
