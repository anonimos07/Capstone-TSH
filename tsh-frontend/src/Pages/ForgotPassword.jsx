import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import forgotpassbg from "@/assets/forgotpassbg.jpg"

const ForgotPassword = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        if (!emailOrUsername) {
            setMessage('Please enter your username or email');
            setIsLoading(false);
            return;
        }

        try {
            // Call the backend API to initiate password reset
            const response = await axios.post('http://localhost:8080/api/password/forgot', { 
                emailOrUsername: emailOrUsername 
            });
            
            setIsSuccess(true);
            setMessage(response.data.message || 'Password reset email has been sent');
            
            // You can redirect after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 5000);
            
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="flex min-h-screen items-center justify-center w-full"
            style={{
                backgroundImage: `url(${forgotpassbg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 0, // Ensure background is behind content
            }}
        >
            <Card className="forgot-password-page flex flex-col items-center justify-center bg-white/90 p-20 rounded-lg shadow-md relative z-10 backdrop-blur-m">
            <div className="flex items-center gap-4 mb-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#8b1e3f]/10">
                    <Building2 className="h-8 w-8 text-[#8b1e3f]" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800">TechStaffHub</h1>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Forgot Password</h1>
            
            {isSuccess ? (
                <div className="w-full max-w-md bg-green-50 p-6 rounded-lg shadow-md text-center">
                    <p className="text-green-700 mb-4">{message}</p>
                    <p className="text-gray-600">Check your email for password reset instructions.</p>
                    <p className="text-gray-600 mt-4">Redirecting to login page in a few seconds...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="w-full max-w-md space-y-8">
                    <div className="form-group">
                        <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 mb-2">
                            Username or Email
                        </label>
                        <input
                            type="text"
                            id="emailOrUsername"
                            name="emailOrUsername"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            placeholder="Enter your username or email"
                            required
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="mb-6 text-sm text-gray-600 text-center">
                        <p>Works for both Employee and HR accounts.</p>
                    </div>
                    
                    {message && (
                        <div className={`p-3 mb-6 rounded-md ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}
                    
                    <Button
                        type="submit" className="w-full bg-[#8b1e3f] text-white py-2 rounded-md cursor-pointer hover:shadow-md transition-shadow" disabled={isLoading}>
                        {isLoading ? "Sending Reset Link..." : "Submit"}
                    </Button>
                    <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-500">© {new Date().getFullYear()} TechStaffHub. All rights reserved.</p>
                    </div>
                </form>
            )}
        </Card>
        </div>
    );
};

export default ForgotPassword;