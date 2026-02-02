import React from "react";
import ReportTable from "./ReportTable";

const POI: React.FC = () => {
    const headers = ["ID", "Name", "Category", "Address", "Coordinates", "Radius"];
    const columns = ["id", "name", "category", "address", "coords", "radius"];
    const data = [
        { id: "P-01", name: "Central Mall", category: "Shopping", address: "Jakarta Pusat", coords: "-6.19, 106.82", radius: "100m" },
        { id: "P-02", name: "Gas Station 04", category: "Utility", address: "Bekasi Timur", coords: "-6.24, 107.01", radius: "50m" },
    ];

    return <ReportTable title="Points of Interest (POI)" headers={headers} columns={columns} data={data} />;
};

export default POI;
