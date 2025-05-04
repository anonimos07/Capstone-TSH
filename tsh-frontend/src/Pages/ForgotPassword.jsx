import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        if (!username) {
            setMessage('Please enter your username or email');
            setIsLoading(false);
            return;
        }

        try {
            // Call the backend API to initiate password reset
            const response = await axios.post('http://localhost:8080/api/password/forgot', { 
                emailOrUsername: username 
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
        <Card className="forgot-password-page flex flex-col items-center justify-center min-h-screen bg-white-100">
            <h1 className="text-3xl font-bold mb-6">Forgot Password</h1>
            
            {isSuccess ? (
                <div className="w-full max-w-md bg-green-50 p-6 rounded-lg shadow-md text-center">
                    <p className="text-green-700 mb-4">{message}</p>
                    <p className="text-gray-600">Check your email for password reset instructions.</p>
                    <p className="text-gray-600 mt-4">Redirecting to login page in a few seconds...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray p-6 rounded-lg shadow-md">
                    <div className="form-group mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username or Email
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username or email"
                            required
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    {message && (
                        <div className={`p-3 mb-4 rounded-md ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Sending Reset Link..." : "Submit"}
                    </Button>
                </form>
            )}
        </Card>
    );
};

export default ForgotPassword;