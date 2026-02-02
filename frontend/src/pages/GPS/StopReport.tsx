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

const StopReport: React.FC = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedMid, setSelectedMid] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [stopData, setStopData] = useState<any[]>([]);
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

    const fetchStops = async () => {
        if (!selectedMid || !selectedDate) return;
        setIsLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await tracking.getStops(user.cid, selectedMid, selectedDate);
            if (res.status === "ok") {
                setStopData(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch stops:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStops();
    }, [selectedMid, selectedDate]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <>
            <PageMeta title="Tanamur GPS | Stop Summary" description="View parking events for your fleet." />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Stop Summary Report</h1>
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
                            onClick={() => exportToExcel(stopData, "Stop_Summary")}
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
                                    <TableCell isHeader className="px-5 py-3 text-start">Location</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10 animate-pulse text-gray-400">Loading stops...</TableCell></TableRow>
                                ) : (
                                    stopData.map((stop, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                                {new Date(stop.start_time).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500">
                                                {new Date(stop.end_time).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-orange-500 font-semibold">
                                                {formatDuration(stop.duration_sec)}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-xs text-blue-500 underline">
                                                <a href={`https://www.google.com/maps?q=${stop.latitude},${stop.longitude}`} target="_blank" rel="noopener noreferrer">
                                                    {stop.latitude}, {stop.longitude} 🗺️
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!isLoading && stopData.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-400">No significant stops (parking) found for this date.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StopReport;
