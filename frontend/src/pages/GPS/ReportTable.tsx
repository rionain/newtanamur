import React from "react";
import PageMeta from "../../components/common/PageMeta";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

interface ReportTableProps {
    title: string;
    data: any[];
    headers: string[];
    columns: string[];
}

const ReportTable: React.FC<ReportTableProps> = ({ title, data, headers, columns }) => {
    const handleExportExcel = () => {
        exportToExcel(data, `${title.replace(/\s+/g, "_")}_Export`);
    };

    const handleExportPDF = () => {
        const pdfData = data.map(item => columns.map(col => item[col]));
        exportToPDF(headers, pdfData, `${title.replace(/\s+/g, "_")}_Export`, title);
    };

    return (
        <>
            <PageMeta
                title={`Tanamur GPS | ${title}`}
                description={`Detailed report for ${title}.`}
            />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                        {title}
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
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    {headers.map((header, idx) => (
                                        <TableCell key={idx} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {data.map((item, rowIdx) => (
                                    <TableRow key={rowIdx}>
                                        {columns.map((col, colIdx) => (
                                            <TableCell key={colIdx} className="px-5 py-4 text-start text-gray-800 dark:text-white/90">
                                                {item[col]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportTable;
