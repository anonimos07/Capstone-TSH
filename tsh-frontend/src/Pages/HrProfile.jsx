import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { HrNav } from "../components/dashboard/HrNav";
import { HrUser } from "../components/dashboard/HrUser";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const HrProfile = () => {
  const [hr, setHr] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    contact: '',
    position: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileInputRef = React.useRef(null);

  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    const fetchHrData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        console.log("Token:", token);
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        const response = await fetch("http://localhost:8080/hr/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const responseClone = response.clone();
          let errorMessage = `Server error: ${response.status}`;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            try {
              const text = await responseClone.text();
              if (text) errorMessage += ` - ${text}`;
            } catch (textError) {
              console.error("Failed to read response body", textError);
            }
          }
          
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/unauthorized");
            return;
          } else if (response.status === 403) {
            navigate("/403");
            return; 
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("API Response:", data);
        setHr({
          username: data.username || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          role: data.role || "",
          contact: data.contact || "",
          position: data.position || ""
        });
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHrData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHr(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  const fullName = `${hr.firstName} ${hr.lastName}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <HrNav userType="hr" />
          </div>
          <HrUser userName={fullName} userEmail={hr.email} />
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>HR Profile</CardTitle>
              <div className="space-x-2">
                <Button variant="outline">Change Password</Button>
                <Button onClick={() => setIsEditMode(!isEditMode)}>
                  {isEditMode ? 'Save Profile' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-6">
                <div
                  className="w-20 h-20 rounded-full mr-4 flex items-center justify-center overflow-hidden bg-gray-300 cursor-pointer"
                  onClick={handleProfilePictureClick}
                >
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg
                      className="w-12 h-12 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4.002 4.002 0 11-8 0 4.002 4.002 0 018 0z" />
                    </svg>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{hr.firstName} {hr.lastName}</h2>
                  <p className="text-gray-600">{hr.position} <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded ml-2">{hr.role}</span></p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Username</label>
                      <p className="mt-1 w-full p-2 text-gray-900">{hr.username}</p>
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-500">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={hr.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1 w-full p-2 border rounded"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-500">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={hr.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1 w-full p-2 border rounded"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <input
                        type="text"
                        name="email"
                        value={hr.email}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1 w-full p-2 border rounded"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-500">Contact</label>
                      <input
                        type="text"
                        name="contact"
                        value={hr.contact}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="mt-1 w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">Last updated: {new Date().toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TechStaffHub. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-500">Developed by TechStaffHub</p>
        </div>
      </footer>
    </div>
  );
};

export default HrProfile;