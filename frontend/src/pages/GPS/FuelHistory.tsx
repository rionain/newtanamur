import React, { useState, useEffect } from "react";
import ReportTable from "./ReportTable";
import { tracking } from "../../utils/apiClient";

const FuelHistory: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                if (!user.cid) return;
                const data = await tracking.getFuelHistory(user.cid);
                setLogs(data.data || []);
            } catch (err) {
                console.error("Failed to fetch fuel history:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const headers = ["Date", "Vehicle", "Plate", "Event"];
    const columns = ["created_at", "vehicle_name", "plate_number", "message"];

    if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-400">Loading fuel report...</div>;

    return <ReportTable title="Fuel Level History" headers={headers} columns={columns} data={logs} />;
};

export default FuelHistory;
