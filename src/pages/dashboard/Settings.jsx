import React from "react";
import AdminInfoSection  from "../../components/settings/AdminInfoSection";
import PromoBannerSection from "../../components/settings/PromoBannerSection";
import HoursSection      from "../../components/settings/HoursSection";

const Settings = () => (
  <div className="space-y-5 max-w-[1600px] mx-auto px-2 md:px-4 mt-2 pb-10">
    <AdminInfoSection />
    <PromoBannerSection />
    <HoursSection />
  </div>
);

export default Settings;