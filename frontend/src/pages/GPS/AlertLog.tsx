import React from "react";
import ReportTable from "./ReportTable";

const AlertLog: React.FC = () => {
    const headers = ["Time", "Vehicle", "Alert Type", "Level", "Location", "Status"];
    const columns = ["time", "vehicle", "type", "level", "location", "status"];
    const data = [
        { time: "2026-02-01 14:20:05", vehicle: "B 1234 ABC", type: "Over Speed", level: "Medium", location: "Jl. Sudirman", status: "Active" },
        { time: "2026-02-01 13:45:12", vehicle: "B 5678 DEF", type: "Geofence Exit", level: "High", location: "Area Jakarta Timur", status: "Closed" },
        { time: "2026-02-01 10:15:33", vehicle: "B 9012 GHI", type: "Power Cut", level: "Critical", location: "Unknown", status: "Active" },
    ];

    return <ReportTable title="Alert & Notification Log" headers={headers} columns={columns} data={data} />;
};

export default AlertLog;
