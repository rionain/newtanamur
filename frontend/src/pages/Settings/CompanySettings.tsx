import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

const CompanySettings: React.FC = () => {
    const [formData, setFormData] = useState({
        companyName: "Tanamur Persada",
        email: "info@tanamur.id",
        phone: "+62 21 1234 5678",
        address: "Jakarta, Indonesia",
        timezone: "UTC+7",
        currency: "IDR",
    });

    return (
        <>
            <PageMeta title="Tanamur GPS | Company Settings" description="Manage company information." />
            <div className="mx-auto w-full max-w-[800px]">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-6">Company Settings</h1>
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6 shadow-sm">
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Company Name</Label>
                                <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                            </div>
                            <div>
                                <Label>Official Email</Label>
                                <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <Label>Phone Number</Label>
                                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <Label>Timezone</Label>
                                <Select
                                    options={[{ value: "UTC+7", label: "WIB (UTC+7)" }, { value: "UTC+8", label: "WITA (UTC+8)" }]}
                                    defaultValue={formData.timezone}
                                    onChange={(val) => setFormData({ ...formData, timezone: val })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Address</Label>
                            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="button" className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                                Update Company Info
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CompanySettings;
