import React from "react";
import ReportTable from "./ReportTable";

const DailySummary: React.FC = () => {
    const headers = ["Date", "Vehicle", "Trip Count", "Distance (km)", "Engine ON", "Top Speed"];
    const columns = ["date", "vehicle", "trips", "distance", "duration", "speed"];
    const data = [
        { date: "2026-02-01", vehicle: "B 1234 ABC", trips: 12, distance: 145.2, duration: "05:45:12", speed: "85 km/h" },
        { date: "2026-02-01", vehicle: "B 5678 DEF", trips: 8, distance: 92.5, duration: "03:12:45", speed: "72 km/h" },
        { date: "2026-01-31", vehicle: "B 1234 ABC", trips: 15, distance: 180.7, duration: "07:20:00", speed: "92 km/h" },
    ];

    return <ReportTable title="Daily Summary Report" headers={headers} columns={columns} data={data} />;
};

export default DailySummary;
