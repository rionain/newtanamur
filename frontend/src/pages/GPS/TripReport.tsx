import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { tracking } from "../../utils/apiClient";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { exportToExcel } from "../../utils/exportUtils";

const TripReport: React.FC = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedMid, setSelectedMid] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tripData, setTripData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchFleet = async () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (!user.cid) return;
            const res = await tracking.getFleet(user.cid);
            if (res.status === "ok") {
                setVehicles(res.data);
                if (res.data.length > 0) setSelectedMid(res.data[0].id);
            }
        };
        fetchFleet();
    }, []);

    const fetchTrips = async () => {
        if (!selectedMid || !selectedDate) return;
        setIsLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await tracking.getTrips(user.cid, selectedMid, selectedDate);
            if (res.status === "ok") {
                setTripData(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch trips:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, [selectedMid, selectedDate]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <PageMeta title="Tanamur GPS | Trip Summary" description="View logical driving trips for your vehicles." />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Trip Summary Report</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={selectedMid}
                            onChange={(e) => setSelectedMid(Number(e.target.value))}
                            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>)}
                        </select>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <button
                            onClick={() => exportToExcel(tripData, "Trip_Summary")}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
                        >
                            Excel
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-start">Start Time</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start">End Time</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start">Duration</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start">Distance (km)</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start">Avg Speed</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start">Max Speed</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-10 animate-pulse text-gray-400">Loading trips...</TableCell></TableRow>
                                ) : (
                                    tripData.map((trip, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                                {new Date(trip.start_time).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500">
                                                {new Date(trip.end_time).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500">
                                                {formatDuration(trip.duration_sec)}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white font-semibold">
                                                {trip.distance_km}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500">
                                                {trip.avg_speed} km/h
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-red-500 font-medium">
                                                {trip.max_speed} km/h
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!isLoading && tripData.length === 0 && (
                                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-400">No driving trips found for this date.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TripReport;
