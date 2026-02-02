import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import GPSPagePlaceholder from "./pages/GPS/GPSPagePlaceholder";
import FleetList from "./pages/GPS/FleetList";
import AddVehicle from "./pages/GPS/AddVehicle";
import DailySummary from "./pages/GPS/DailySummary";
import FuelReport from "./pages/GPS/FuelReport";
import AlertLog from "./pages/GPS/AlertLog";
import RefuelLog from "./pages/GPS/RefuelLog";
import LiveTracking from "./pages/GPS/LiveTracking";
import TravelLog from "./pages/GPS/TravelLog";
import FuelEfficiency from "./pages/GPS/FuelEfficiency";
import Geofences from "./pages/GPS/Geofences";
import GeofenceEditor from "./pages/GPS/GeofenceEditor";
import TripReport from "./pages/GPS/TripReport";
import StopReport from "./pages/GPS/StopReport";
import FuelHistory from "./pages/GPS/FuelHistory";
import POI from "./pages/GPS/POI";
import CompanySettings from "./pages/Settings/CompanySettings";
import UserManagement from "./pages/Settings/UserManagement";
import IntegrationsSettings from "./pages/Settings/IntegrationsSettings";
import NotificationSettings from "./pages/Settings/NotificationSettings";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />

            {/* GPS Modules */}
            <Route path="/tracking" element={<LiveTracking />} />
            <Route path="/vehicles" element={<FleetList />} />
            <Route path="/vehicles/add" element={<AddVehicle />} />

            <Route path="/fuel/log" element={<RefuelLog />} />
            <Route path="/fuel/efficiency" element={<FuelEfficiency />} />
            <Route path="/fuel/reports" element={<FuelReport />} />

            <Route path="/history/travel" element={<TravelLog />} />
            <Route path="/history/trips" element={<TripReport />} />
            <Route path="/history/stops" element={<StopReport />} />
            <Route path="/history/fuel" element={<FuelHistory />} />

            <Route path="/geofences" element={<Geofences />} />
            <Route path="/geofences/edit" element={<GeofenceEditor />} />
            <Route path="/poi" element={<POI />} />

            <Route path="/reports/daily" element={<DailySummary />} />
            <Route path="/reports/fuel" element={<FuelReport />} />
            <Route path="/reports/alerts" element={<AlertLog />} />

            <Route path="/settings/company" element={<CompanySettings />} />
            <Route path="/settings/users" element={<UserManagement />} />
            <Route path="/settings/integrations" element={<IntegrationsSettings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/settings/vehicle-defaults" element={<GPSPagePlaceholder title="Vehicle Defaults" />} />
            <Route path="/settings/map" element={<GPSPagePlaceholder title="Map Preferences" />} />
            <Route path="/settings/reports" element={<GPSPagePlaceholder title="Report Settings" />} />
            <Route path="/settings/system" element={<GPSPagePlaceholder title="System Settings" />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
