import React, { useEffect, useState } from "react";
import { GroupIcon, BoxIconLine, AlertIcon } from "../../icons";
import { dashboard } from "../../utils/apiClient";

const GpsFleetMetrics: React.FC = () => {
    const [metrics, setMetrics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                if (!user.cid) return;

                const data = await dashboard.getMetrics(user.cid);
                setMetrics(data.data);
            } catch (err) {
                console.error("Failed to fetch metrics:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-400">Loading metrics...</div>;
    if (!metrics) return null;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {/* Total Vehicles */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-blue-900/20">
                    <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
                </div>
                <div className="mt-5">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fleet</span>
                    <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">{metrics.total}</h4>
                    <p className="text-xs mt-2 text-gray-400">{metrics.active} active now</p>
                </div>
            </div>

            {/* Moving Status */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-xl dark:bg-green-900/20">
                    <BoxIconLine className="text-green-600 size-6 dark:text-green-400" />
                </div>
                <div className="mt-5">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Units Moving</span>
                    <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">{metrics.moving}</h4>
                    <p className="text-xs mt-2 text-success-600 font-medium">Turbo Speed Active</p>
                </div>
            </div>

            {/* Offline Status */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-xl dark:bg-gray-800">
                    <GroupIcon className="text-gray-400 size-6" />
                </div>
                <div className="mt-5">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Offline/Parked</span>
                    <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">{metrics.offline}</h4>
                    <p className="text-xs mt-2 text-gray-400">No signals &gt; 1 hour</p>
                </div>
            </div>

            {/* Active Alerts */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-xl dark:bg-red-900/20">
                    <AlertIcon className="text-red-600 size-6 dark:text-red-400" />
                </div>
                <div className="mt-5">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Anomalies (24h)</span>
                    <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">{metrics.alerts}</h4>
                    <p className="text-xs mt-2 text-error-600 font-medium">{metrics.alerts > 0 ? 'Immediate action required' : 'System healthy'}</p>
                </div>
            </div>
        </div>
    );
};

export default GpsFleetMetrics;
