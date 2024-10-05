"use client"; // Ensures the component is client-side rendered

import { useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState } from 'react';


interface Incident {
  id: number;
  lat: number;
  lng: number;
  description: string;
  imageUrl: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 36.8065,
  lng: 10.1815, // Centered on Tunis, Tunisia
};

export default function TunisianTrafficTracker() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [newIncident, setNewIncident] = useState<Omit<Incident, "id">>({
    lat: 36.8065,
    lng: 10.1815,
    description: "",
    imageUrl: "",
  });
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your actual API key
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIncidentWithId = { ...newIncident, id: Date.now() };
    setIncidents([...incidents, newIncidentWithId]);
    setNewIncident({ lat: 36.8065, lng: 10.1815, description: "", imageUrl: "" });

    if (mapRef.current) {
      mapRef.current.panTo({ lat: newIncidentWithId.lat, lng: newIncidentWithId.lng });
      mapRef.current.setZoom(14);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewIncident({ ...newIncident, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-[#F0F4F8] min-h-screen font-['Noto_Sans_Arabic']">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#E63946] border-b-4 border-[#1D3557] pb-2">
        تتبع حوادث المرور في تونس
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden border-2 border-[#1D3557]">
          <CardHeader className="bg-[#1D3557] text-white">
            <CardTitle className="text-xl">إضافة حادث جديد</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="number"
                placeholder="خط العرض"
                value={newIncident.lat}
                onChange={(e) => setNewIncident({ ...newIncident, lat: parseFloat(e.target.value) })}
                required
                aria-label="Latitude"
                className="border-[#1D3557] focus:ring-[#457B9D]"
              />
              <Input
                type="number"
                placeholder="خط الطول"
                value={newIncident.lng}
                onChange={(e) => setNewIncident({ ...newIncident, lng: parseFloat(e.target.value) })}
                required
                aria-label="Longitude"
                className="border-[#1D3557] focus:ring-[#457B9D]"
              />
              <Textarea
                placeholder="وصف الحادث"
                value={newIncident.description}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                required
                aria-label="Incident Description"
                className="border-[#1D3557] focus:ring-[#457B9D]"
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
                aria-label="Upload Image"
                className="border-[#1D3557] focus:ring-[#457B9D]"
              />
              <Button type="submit" className="w-full bg-[#E63946] hover:bg-[#C1121F] text-white">
                إضافة الحادث
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-lg overflow-hidden border-2 border-[#1D3557]">
          <CardHeader className="bg-[#1D3557] text-white">
            <CardTitle className="text-xl">خريطة الحوادث</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoaded ? (
              <div style={{ width: "100%", height: "400px" }}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={7}
                  onLoad={onMapLoad}
                >
                  {incidents.map((incident) => (
                    <Marker key={incident.id} position={{ lat: incident.lat, lng: incident.lng }} />
                  ))}
                </GoogleMap>
              </div>
            ) : (
              <div className="text-center text-[#1D3557]">جاري تحميل الخريطة...</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden border-2 border-[#1D3557]">
        <CardHeader className="bg-[#1D3557] text-white">
          <CardTitle className="text-xl">الحوادث الأخيرة</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="bg-[#F1FAEE] shadow rounded-lg overflow-hidden border border-[#A8DADC]">
                <CardContent className="p-4">
                  <img
                    src={incident.imageUrl}
                    alt="Incident"
                    className="w-full h-32 object-cover mb-2 rounded-md"
                  />
                  <p className="text-sm text-[#1D3557] mb-1">{incident.description}</p>
                  <p className="text-xs text-[#457B9D]">
                    خط العرض: {incident.lat}, خط الطول: {incident.lng}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
