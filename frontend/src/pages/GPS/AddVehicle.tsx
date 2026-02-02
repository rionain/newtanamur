import React, { useState, useEffect } from "react";
import { vehicles } from "../../utils/apiClient";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Checkbox from "../../components/form/input/Checkbox";

const AddVehicle: React.FC = () => {
    const [formData, setFormData] = useState({
        // Identitas
        kodeArmada: "",
        tipeKendaraan: "",
        warna: "",
        namaPengemudi: "",
        nomorPlat: "",
        tugasRute: "",
        // Bahan Bakar
        kapasitasTangki: "",
        fuelSensorMin: "",
        fuelSensorMax: "",
        tempSensorMin: "",
        tempSensorMax: "",
        warningFuelPercent: "",
        warningTempDegree: "",
        // Alerts
        alerts: {
            sos: { sms: false, email: false },
            overspeed: { sms: false, email: false },
            engineOn: { sms: false, email: false },
            engineOff: { sms: false, email: false },
            gpsLost: { sms: false, email: false },
            gsmLost: { sms: false, email: false },
            geofence: { sms: false, email: false },
        }
    });

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("Sesi berakhir, silakan login kembali.");
            return;
        }

        const payload = {
            name: formData.kodeArmada,
            plate: formData.nomorPlat,
            kode: formData.kodeArmada, // Using as device code too for now
            f_v1: formData.fuelSensorMin,
            f_l1: 0, // default
            f_v2: formData.fuelSensorMax,
            f_l2: formData.kapasitasTangki
        };

        try {
            const res = await vehicles.add(user.cid, payload);
            if (res.status === "ok") {
                alert("Data Armada Berhasil Direkam!");
                setFormData({
                    kodeArmada: "",
                    tipeKendaraan: "",
                    warna: "",
                    namaPengemudi: "",
                    nomorPlat: "",
                    tugasRute: "",
                    kapasitasTangki: "",
                    fuelSensorMin: "",
                    fuelSensorMax: "",
                    tempSensorMin: "",
                    tempSensorMax: "",
                    warningFuelPercent: "",
                    warningTempDegree: "",
                    alerts: {
                        sos: { sms: false, email: false },
                        overspeed: { sms: false, email: false },
                        engineOn: { sms: false, email: false },
                        engineOff: { sms: false, email: false },
                        gpsLost: { sms: false, email: false },
                        gsmLost: { sms: false, email: false },
                        geofence: { sms: false, email: false },
                    }
                });
            } else {
                alert("Gagal merekam data: " + (res.message || "Unknown error"));
            }
        } catch (err) {
            alert("Gagal menghubungi server.");
        }
    };

    const vehicleTypes = [
        { value: "truck", label: "Truck" },
        { value: "car", label: "Car" },
        { value: "motorcycle", label: "Motorcycle" },
        { value: "bus", label: "Bus" },
    ];

    const handleAlertChange = (key: keyof typeof formData.alerts, type: 'sms' | 'email', val: boolean) => {
        setFormData(prev => ({
            ...prev,
            alerts: {
                ...prev.alerts,
                [key]: {
                    ...prev.alerts[key],
                    [type]: val
                }
            }
        }));
    };

    const alertRows = [
        { key: 'sos', label: 'Tombol SOS Ditekan', emailType: 'na' },
        { key: 'overspeed', label: 'Kecepatan Berlebih', emailType: 'input' },
        { key: 'engineOn', label: 'Mesin Dinyalakan', emailType: 'na' },
        { key: 'engineOff', label: 'Mesin Dimatikan', emailType: 'na' },
        { key: 'gpsLost', label: 'GPS Gagal/Hilang', emailType: 'na' },
        { key: 'gsmLost', label: 'Sinyal GSM Hilang', emailType: 'na' },
        { key: 'geofence', label: 'Keluar dari Zona/Geofence', emailType: 'na' },
    ];

    return (
        <>
            <PageMeta
                title="Tanamur GPS | Registrasi Armada"
                description="Pendaftaran armada kendaraan baru."
            />
            <div className="mx-auto w-full max-w-[900px]">
                <form onSubmit={handleSubmit} className="space-y-8 pb-10">

                    {/* Section 1: Identitas dan Tugas Armada */}
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
                            <h3 className="font-bold text-gray-800 dark:text-white/90 text-lg border-l-4 border-brand-500 pl-3">
                                Identitas dan Tugas Armada
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-6 items-center">
                                <Label className="md:mb-0">Kode Armada</Label>
                                <div className="md:col-span-2">
                                    <Input
                                        type="text"
                                        placeholder="Masukkan kode armada"
                                        value={formData.kodeArmada}
                                        onChange={(e) => setFormData({ ...formData, kodeArmada: e.target.value })}
                                    />
                                </div>

                                <Label className="md:mb-0">Tipe Kendaraan</Label>
                                <div className="md:col-span-2">
                                    <Select
                                        options={vehicleTypes}
                                        placeholder="-- Pilih Tipe --"
                                        onChange={(val) => setFormData({ ...formData, tipeKendaraan: val as string })}
                                    />
                                </div>

                                <Label className="md:mb-0">Warna</Label>
                                <div className="md:col-span-2">
                                    <Input
                                        type="text"
                                        placeholder="Warna kendaraan"
                                        value={formData.warna}
                                        onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                                    />
                                </div>

                                <Label className="md:mb-0">Nama Pengemudi</Label>
                                <div className="md:col-span-2">
                                    <Input
                                        type="text"
                                        placeholder="Nama pengemudi"
                                        value={formData.namaPengemudi}
                                        onChange={(e) => setFormData({ ...formData, namaPengemudi: e.target.value })}
                                    />
                                </div>

                                <Label className="md:mb-0">Nomor Plat</Label>
                                <div className="md:col-span-2">
                                    <Input
                                        type="text"
                                        placeholder="B 1234 XYZ"
                                        value={formData.nomorPlat}
                                        onChange={(e) => setFormData({ ...formData, nomorPlat: e.target.value })}
                                    />
                                </div>

                                <Label className="md:mb-0">Tugas/Rute</Label>
                                <div className="md:col-span-2">
                                    <Input
                                        type="text"
                                        placeholder="Area/rute tugas"
                                        value={formData.tugasRute}
                                        onChange={(e) => setFormData({ ...formData, tugasRute: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Bahan Bakar & Temperatur */}
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
                            <h3 className="font-bold text-gray-800 dark:text-white/90 text-lg border-l-4 border-brand-500 pl-3">
                                Bahan Bakar & Temperatur
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-6 items-center">
                                <Label className="md:mb-0">Kapasitas Tangki (Liter)</Label>
                                <div className="md:col-span-2">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={formData.kapasitasTangki}
                                        onChange={(e) => setFormData({ ...formData, kapasitasTangki: e.target.value })}
                                    />
                                </div>

                                <Label className="md:mb-0">Kalibrasi Sensor Bahan Bakar</Label>
                                <div className="md:col-span-2 flex gap-4">
                                    <Input
                                        type="text"
                                        placeholder="Min"
                                        className="w-full"
                                        value={formData.fuelSensorMin}
                                        onChange={(e) => setFormData({ ...formData, fuelSensorMin: e.target.value })}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Max"
                                        className="w-full"
                                        value={formData.fuelSensorMax}
                                        onChange={(e) => setFormData({ ...formData, fuelSensorMax: e.target.value })}
                                    />
                                </div>

                                <Label className="md:mb-0">Kalibrasi Sensor Temperatur</Label>
                                <div className="md:col-span-2 flex gap-4">
                                    <Input
                                        type="text"
                                        placeholder="Min °C"
                                        className="w-full"
                                        value={formData.tempSensorMin}
                                        onChange={(e) => setFormData({ ...formData, tempSensorMin: e.target.value })}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Max °C"
                                        className="w-full"
                                        value={formData.tempSensorMax}
                                        onChange={(e) => setFormData({ ...formData, tempSensorMax: e.target.value })}
                                    />
                                </div>

                                <Label className="md:mb-0">Peringatan Bahan Bakar</Label>
                                <div className="md:col-span-2">
                                    <Input
                                        type="text"
                                        placeholder="Peringatan saat < % bahan bakar"
                                        value={formData.warningFuelPercent}
                                        onChange={(e) => setFormData({ ...formData, warningFuelPercent: e.target.value })}
                                    />
                                </div>

                                <Label className="md:mb-0">Peringatan Temperatur</Label>
                                <div className="md:col-span-2">
                                    <Input
                                        type="text"
                                        placeholder="Peringatan saat > °C"
                                        value={formData.warningTempDegree}
                                        onChange={(e) => setFormData({ ...formData, warningTempDegree: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Pesan Otomatis (SMS/Email) */}
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
                            <h3 className="font-bold text-gray-800 dark:text-white/90 text-lg border-l-4 border-brand-500 pl-3">
                                Pesan Otomatis (SMS/Email)
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-brand-500 text-white">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-sm">Jenis Peringatan</th>
                                        <th className="px-6 py-3 font-semibold text-sm text-center">SMS</th>
                                        <th className="px-6 py-3 font-semibold text-sm text-center">Email</th>
                                        <th className="px-6 py-3 font-semibold text-sm text-center">Pengaturan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                                    {alertRows.map((row) => (
                                        <tr key={row.key}>
                                            <td className="px-6 py-4 font-bold text-gray-800 dark:text-white/90 text-sm">
                                                {row.label}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <Checkbox
                                                        label="Aktif"
                                                        checked={(formData.alerts as any)[row.key].sms}
                                                        onChange={(val) => handleAlertChange(row.key as any, 'sms', val)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {row.emailType === 'input' ? (
                                                        <Input
                                                            type="text"
                                                            className="w-16 h-8 text-center"
                                                            placeholder="Km/h"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-400 text-xs italic">
                                                            N/A
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button type="button" className="text-gray-400 hover:text-brand-500 transition-colors">
                                                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-start">
                        <button
                            type="submit"
                            className="px-8 py-3 text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors font-bold flex items-center gap-2 shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                            </svg>
                            Rekam Data
                        </button>
                    </div>

                </form>
            </div>
        </>
    );
};

export default AddVehicle;
