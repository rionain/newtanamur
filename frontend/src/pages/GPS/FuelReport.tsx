import React from "react";
import ReportTable from "./ReportTable";

const FuelReport: React.FC = () => {
    const headers = ["Vehicle", "Total Fuel (L)", "Cost", "Efficiency (km/L)", "Consumption Rate"];
    const columns = ["vehicle", "fuel", "cost", "efficiency", "rate"];
    const data = [
        { vehicle: "B 1234 ABC", fuel: 450.5, cost: "$580.00", efficiency: "8.5", rate: "12L/100km" },
        { vehicle: "B 5678 DEF", fuel: 320.2, cost: "$412.00", efficiency: "9.2", rate: "10L/100km" },
    ];

    return <ReportTable title="Fuel Consumption Report" headers={headers} columns={columns} data={data} />;
};

export default FuelReport;
