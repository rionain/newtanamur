import React from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";

const UserManagement: React.FC = () => {
    const users = [
        { id: 1, name: "Admin Tanamur", email: "admin@tanamur.id", role: "Super Admin", status: "Active" },
        { id: 2, name: "Fleet Manager", email: "manager@tanamur.id", role: "Manager", status: "Active" },
        { id: 3, name: "Staff Account", email: "staff@tanamur.id", role: "Operator", status: "Inactive" },
    ];

    return (
        <>
            <PageMeta title="Tanamur GPS | User Management" description="Manage system access and roles." />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">User Management</h1>
                    <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">Invite User</button>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell isHeader>Name</TableCell>
                                <TableCell isHeader>Email</TableCell>
                                <TableCell isHeader>Role</TableCell>
                                <TableCell isHeader>Status</TableCell>
                                <TableCell isHeader>Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium text-gray-800 dark:text-white">{u.name}</TableCell>
                                    <TableCell className="text-gray-500">{u.email}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs semibold text-gray-700 dark:text-gray-300">
                                            {u.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge color={u.status === "Active" ? "success" : "light"}>{u.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <button className="text-brand-500 hover:underline text-sm font-medium">Edit</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
};

export default UserManagement;
