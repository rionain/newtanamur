import React from "react";
import ReportTable from "./ReportTable";
import { Link } from "react-router";

const Geofences: React.FC = () => {
    const headers = ["ID", "Name", "Type", "Area", "Active Alerts", "Status"];
    const columns = ["id", "name", "type", "area", "alerts", "status"];
    const data = [
        { id: "G-01", name: "Warehouse HQ", type: "Circular", area: "500m radius", alerts: "Enter/Exit", status: "Enabled" },
        { id: "G-02", name: "Client Site A", type: "Polygon", area: "Industrial Zone", alerts: "Exit Only", status: "Enabled" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Link
                    to="/geofences/edit"
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-brand-500/20"
                >
                    🗺️ Open Map Editor
                </Link>
            </div>
            <ReportTable title="Geofence Management" headers={headers} columns={columns} data={data} />
        </div>
    );
};

export default Geofences;
