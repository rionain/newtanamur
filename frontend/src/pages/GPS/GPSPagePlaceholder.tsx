import React from "react";
import PageMeta from "../../components/common/PageMeta";

interface GPSPagePlaceholderProps {
    title: string;
}

const GPSPagePlaceholder: React.FC<GPSPagePlaceholderProps> = ({ title }) => {
    return (
        <>
            <PageMeta
                title={`Tanamur GPS | ${title}`}
                description="Real-time GPS tracking and fleet management solution."
            />
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-4">
                    {title}
                </h1>
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-500 italic">
                        This module is under construction...
                    </p>
                </div>
            </div>
        </>
    );
};

export default GPSPagePlaceholder;
