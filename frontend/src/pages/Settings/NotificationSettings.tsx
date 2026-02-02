import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Checkbox from "../../components/form/input/Checkbox";

const NotificationSettings: React.FC = () => {
    const [channels, setChannels] = useState({
        browser: true,
        email: true,
        telegram: false,
        sms: false,
    });

    const [alerts, setAlerts] = useState({
        overspeed: true,
        engine: true,
        geofence: true,
        maintenance: false,
    });

    return (
        <>
            <PageMeta title="Tanamur GPS | Notifications" description="Configure alert channels." />
            <div className="mx-auto w-full max-w-[800px] space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Notification Settings</h1>

                <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] p-6 space-y-6">
                    <section>
                        <h3 className="font-bold text-gray-800 mb-4">Delivery Channels</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Checkbox label="Browser Push Notifications" checked={channels.browser} onChange={(val) => setChannels({ ...channels, browser: val })} />
                            <Checkbox label="Email Alerts" checked={channels.email} onChange={(val) => setChannels({ ...channels, email: val })} />
                            <Checkbox label="Telegram Integration" checked={channels.telegram} onChange={(val) => setChannels({ ...channels, telegram: val })} />
                            <Checkbox label="SMS Alerts" checked={channels.sms} onChange={(val) => setChannels({ ...channels, sms: val })} />
                        </div>
                    </section>

                    <hr className="border-gray-100 dark:border-white/[0.05]" />

                    <section>
                        <h3 className="font-bold text-gray-800 mb-4">Alert Preferences</h3>
                        <div className="space-y-3">
                            <Checkbox label="Notify on Overspeed" checked={alerts.overspeed} onChange={(val) => setAlerts({ ...alerts, overspeed: val })} />
                            <Checkbox label="Notify on Engine ON/OFF" checked={alerts.engine} onChange={(val) => setAlerts({ ...alerts, engine: val })} />
                            <Checkbox label="Notify on Geofence Breach" checked={alerts.geofence} onChange={(val) => setAlerts({ ...alerts, geofence: val })} />
                            <Checkbox label="Notify on Maintenance Due" checked={alerts.maintenance} onChange={(val) => setAlerts({ ...alerts, maintenance: val })} />
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotificationSettings;
