import React, { createContext, useContext, useState } from "react";

const DemoContext = createContext();

const DEMO_DONATIONS = [
  {
    _id: "demo-food-1",
    foodName: "Excess Catering Cooked Rice & Paneer Curry",
    quantity: 120,
    category: "cooked_meals",
    donorName: "Grand Hyatt Banquet Services",
    donorType: "Commercial Kitchen",
    address: "BKC Expressway, Bandra East, Mumbai",
    city: "Mumbai",
    latitude: 19.0657,
    longitude: 72.8687,
    expiryTime: new Date(Date.now() + 3 * 3600000).toISOString(),
    storageCondition: "hot_holding",
    temperatureChecked: true,
    isEmergency: true,
    priority: "emergency",
    priorityScore: 98,
    status: "Available",
    lifecycleState: "published",
    traceabilityId: "ECO-2026-981023",
    claimedBy: "",
    createdAt: new Date().toISOString()
  },
  {
    _id: "demo-food-2",
    foodName: "Fresh Bakery Surplus (Bread & Pastries)",
    quantity: 45,
    category: "bakery",
    donorName: "Bakers Basket Central",
    donorType: "Bakery / Cafe",
    address: "FC Road, Shivaji Nagar, Pune",
    city: "Pune",
    latitude: 18.5204,
    longitude: 73.8567,
    expiryTime: new Date(Date.now() + 12 * 3600000).toISOString(),
    storageCondition: "ambient",
    temperatureChecked: true,
    isEmergency: false,
    priority: "normal",
    priorityScore: 65,
    status: "Available",
    lifecycleState: "published",
    traceabilityId: "ECO-2026-441092",
    claimedBy: "",
    createdAt: new Date().toISOString()
  }
];

const DEMO_NGOS = [
  {
    _id: "demo-ngo-1",
    ngoName: "Robin Hood Army - BKC Chapter",
    contactPerson: "Rajesh Kumar",
    phone: "9820198201",
    city: "Mumbai",
    address: "Bandra East, Mumbai",
    latitude: 19.0600,
    longitude: 72.8650,
    capacity: 250,
    categoriesAccepted: ["cooked_meals", "bakery"],
    refrigerationAvailable: true,
    status: "approved",
    verificationStatus: "verified",
    rating: 4.9
  },
  {
    _id: "demo-ngo-2",
    ngoName: "Roti Bank Foundation",
    contactPerson: "Meera Deshmukh",
    phone: "9819283746",
    city: "Mumbai",
    address: "Dadar West, Mumbai",
    latitude: 19.0178,
    longitude: 72.8478,
    capacity: 500,
    categoriesAccepted: ["cooked_meals", "raw_vegetables", "dairy"],
    refrigerationAvailable: true,
    status: "approved",
    verificationStatus: "verified",
    rating: 4.8
  }
];

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoDonations, setDemoDonations] = useState(DEMO_DONATIONS);
  const [demoNgos, setDemoNgos] = useState(DEMO_NGOS);

  const toggleDemoMode = () => setIsDemoMode((prev) => !prev);

  return (
    <DemoContext.Provider value={{
      isDemoMode,
      toggleDemoMode,
      demoDonations,
      demoNgos
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);
