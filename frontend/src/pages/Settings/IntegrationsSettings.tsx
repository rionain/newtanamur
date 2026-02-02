import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

const IntegrationsSettings: React.FC = () => {
    const [settings, setSettings] = useState({
        googleMapsKey: "AIzaSy...",
        telegramBotToken: "",
        telegramChatId: "",
        smtpHost: "smtp.tanamur.id",
        smtpPort: "587",
        smtpUser: "notifications@tanamur.id",
        smtpPass: "********",
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Integration settings saved!");
    };

    return (
        <>
            <PageMeta title="Tanamur GPS | Integrations" description="Configure external APIs and services." />
            <div className="mx-auto w-full max-w-[900px]">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-6">Third-Party Integrations</h1>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Google Maps Section */}
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05] bg-gray-50/50">
                            <h3 className="font-bold text-gray-800">Map Services</h3>
                        </div>
                        <div className="p-6">
                            <Label>Google Maps API Key</Label>
                            <Input
                                type="password"
                                placeholder="Enter API Key"
                                value={settings.googleMapsKey}
                                onChange={(e) => setSettings({ ...settings, googleMapsKey: e.target.value })}
                                hint="Used for rendering maps and geocoding."
                            />
                        </div>
                    </div>

                    {/* Telegram Section */}
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05] bg-gray-50/50">
                            <h3 className="font-bold text-gray-800">Telegram Bot (Webhook)</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <Label>Bot Token</Label>
                                <Input
                                    type="text"
                                    placeholder="123456:ABC-DEF..."
                                    value={settings.telegramBotToken}
                                    onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Default Chat ID</Label>
                                <Input
                                    type="text"
                                    placeholder="-100123456789"
                                    value={settings.telegramChatId}
                                    onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SMTP Section */}
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05] bg-gray-50/50">
                            <h3 className="font-bold text-gray-800">Email Server (SMTP)</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label>SMTP Host</Label>
                                    <Input
                                        type="text"
                                        value={settings.smtpHost}
                                        onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>SMTP Port</Label>
                                    <Input
                                        type="text"
                                        value={settings.smtpPort}
                                        onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Username</Label>
                                    <Input
                                        type="text"
                                        value={settings.smtpUser}
                                        onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={settings.smtpPass}
                                        onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="px-6 py-3 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 shadow-md">
                            Save Integration Settings
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default IntegrationsSettings;
