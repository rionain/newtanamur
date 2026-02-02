import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { tracking } from "../../utils/apiClient";
import ReportTable from "./ReportTable";

const TravelLog: React.FC = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFleetLoading, setIsFleetLoading] = useState(true);

    const headers = ["Time", "Latitude", "Longitude", "Speed (km/h)", "Fuel (L)", "Status"];
    const columns = ["dtime", "latitude", "longitude", "speed", "fuel", "status"];

    useEffect(() => {
        const fetchFleet = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                if (!user.cid) return;
                const data = await tracking.getFleet(user.cid);
                setVehicles(data.data || []);
                if (data.data && data.data.length > 0) {
                    setSelectedVehicle(data.data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch fleet:", err);
            } finally {
                setIsFleetLoading(false);
            }
        };
        fetchFleet();
    }, []);

    const handleSearch = async () => {
        if (!selectedVehicle || !selectedDate) return;

        setIsLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await tracking.getHistory(user.cid, parseInt(selectedVehicle), selectedDate);

            if (res.status === "ok") {
                const mappedData = (res.data || []).map((pos: any) => ({
                    ...pos,
                    status: pos.speed > 0 ? "Moving" : "Stopped"
                }));
                setHistoryData(mappedData);
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PageMeta
                title="Tanamur GPS | Travel History"
                description="View historical vehicle movements and logs."
            />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                        Travel History Playback
                    </h1>
                </div>

                {/* Filter Bar */}
                <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Vehicle</label>
                            <select
                                value={selectedVehicle}
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                            >
                                {isFleetLoading ? <option>Loading fleet...</option> : null}
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="w-full px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : "🔍"}
                                Search Logs
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                {historyData.length > 0 ? (
                    <ReportTable title={`${selectedDate} Travel Log`} headers={headers} columns={columns} data={historyData} />
                ) : (
                    <div className="p-20 text-center border border-dashed border-gray-200 rounded-2xl dark:border-white/[0.05]">
                        <p className="text-gray-400">Select a vehicle and date to view travel logs.</p>
                        {isLoading && <p className="mt-2 text-brand-500 animate-pulse font-medium">Fetching historical data...</p>}
                    </div>
                )}
            </div>
        </>
    );
};

export default TravelLog;
