import React from "react";
import ReportTable from "./ReportTable";

const RefuelLog: React.FC = () => {
    const headers = ["Date", "Vehicle", "Fuel Type", "Quantity (L)", "Cost", "Station"];
    const columns = ["date", "vehicle", "type", "qty", "cost", "station"];
    const data = [
        { date: "2026-02-01", vehicle: "B 1234 ABC", type: "Diesel", qty: 45.5, cost: "$58.50", station: "Shell Gatot Subroto" },
        { date: "2026-01-30", vehicle: "B 5678 DEF", type: "Pertamax", qty: 32.0, cost: "$41.20", station: "Pertamina Kuningan" },
    ];

    return <ReportTable title="Vehicle Refuel Log" headers={headers} columns={columns} data={data} />;
};

export default RefuelLog;
