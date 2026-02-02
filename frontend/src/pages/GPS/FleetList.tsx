import React from "react";
import PageMeta from "../../components/common/PageMeta";
import { tracking } from "../../utils/apiClient";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import { Link } from "react-router";


const FleetList: React.FC = () => {
    const [fleetData, setFleetData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFleet = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                if (!user.cid) return;
                const data = await tracking.getFleet(user.cid);
                setFleetData(data.data || []);
            } catch (err) {
                console.error("Failed to fetch fleet:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFleet();
    }, []);

    const handleExportExcel = () => {
        exportToExcel(fleetData, "Tanamur_Fleet_List");
    };

    const handleExportPDF = () => {
        const headers = ["ID", "Name", "Plate", "Status", "Fuel", "Last Update"];
        const data = fleetData.map(v => [v.id, v.name, v.plate_number, v.last_speed > 0 ? "Moving" : "Stopped", `${v.old_fuel} L`, v.last_dtime]);
        exportToPDF(headers, data, "Tanamur_Fleet_List", "Fleet Management - Vehicle List");
    };

    return (
        <>
            <PageMeta
                title="Tanamur GPS | Fleet List"
                description="Monitor and manage your fleet of vehicles."
            />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                        Fleet List
                    </h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportExcel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
                        >
                            Export Excel
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
                        >
                            Export PDF
                        </button>
                        <Link
                            to="/vehicles/add"
                            className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
                        >
                            Add New Vehicle
                        </Link>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        {isLoading ? (
                            <div className="p-10 text-center text-gray-400 animate-pulse">Loading fleet data...</div>
                        ) : (
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Vehicle Name
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Plate Number
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Code
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Status
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Fuel Level
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Last Update
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {fleetData.map((vehicle) => (
                                        <TableRow key={vehicle.id}>
                                            <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                                {vehicle.name}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                                                {vehicle.plate_number}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 text-xs">
                                                {vehicle.device_kode}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start">
                                                <Badge
                                                    size="sm"
                                                    color={vehicle.last_speed > 0 ? "success" : "warning"}
                                                >
                                                    {vehicle.last_speed > 0 ? "Moving" : "Stopped"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        {vehicle.old_fuel} L
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                                                {new Date(vehicle.last_dtime).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FleetList;
