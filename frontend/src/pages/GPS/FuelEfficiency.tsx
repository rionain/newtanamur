import React from "react";
import ReportTable from "./ReportTable";

const FuelEfficiency: React.FC = () => {
    const headers = ["Vehicle", "Total Distance", "Total Fuel", "Avg Efficiency", "Score"];
    const columns = ["vehicle", "distance", "fuel", "efficiency", "score"];
    const data = [
        { vehicle: "B 1234 ABC", distance: "2500 km", fuel: "300 L", efficiency: "8.33 km/L", score: "High" },
        { vehicle: "B 5678 DEF", distance: "1800 km", fuel: "210 L", efficiency: "8.57 km/L", score: "Excellent" },
    ];

    return <ReportTable title="Fuel Efficiency Analytics" headers={headers} columns={columns} data={data} />;
};

export default FuelEfficiency;
