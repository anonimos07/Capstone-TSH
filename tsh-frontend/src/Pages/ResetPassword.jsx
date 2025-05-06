import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from 'axios';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState('');
    const [isValidToken, setIsValidToken] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const resetToken = queryParams.get('token');
        
        if (!resetToken) {
            setIsLoading(false);
            setMessage('Invalid reset link. Please request a new password reset.');
            return;
        }
        
        setToken(resetToken);
        
        const validateToken = async () => {
            try {
                await axios.get(`http://localhost:8080/api/password/validate-token?token=${resetToken}`);
                setIsValidToken(true);
            } catch (error) {
                setMessage(error.response?.data?.message || 'Invalid or expired token. Please request a new password reset.');
            } finally {
                setIsLoading(false);
            }
        };
        
        validateToken();
    }, [location]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            setMessage('Password must be at least 6 characters long');
            return;
        }
        
        setIsSubmitting(true);
        setMessage('');
        
        try {
            const response = await axios.post('http://localhost:8080/api/password/reset', {
                token,
                newPassword
            });
            
            setMessage(response.data.message || 'Password has been reset successfully');
            setIsSuccess(true);
            
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <Card className="reset-password-page flex flex-col items-center justify-center min-h-screen bg-white-100">
                <div className="text-center p-6">
                    <h1 className="text-xl font-semibold mb-4">Verifying your reset link...</h1>
                    <div className="animate-pulse">Processing</div>
                </div>
            </Card>
        );
    }
    
    return (
        <Card className="reset-password-page flex flex-col items-center justify-center min-h-screen bg-white-100">
            <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
            
            {!isValidToken ? (
                <div className="w-full max-w-md bg-red-50 p-6 rounded-lg shadow-md text-center">
                    <p className="text-red-700 mb-4">{message}</p>
                    <Button 
                        onClick={() => navigate('/forgot-password')}
                        className="mt-4"
                    >
                        Request New Reset Link
                    </Button>
                </div>
            ) : isSuccess ? (
                <div className="w-full max-w-md bg-green-50 p-6 rounded-lg shadow-md text-center">
                    <p className="text-green-700 mb-4">{message}</p>
                    <p className="text-gray-600">You will be redirected to the login page shortly...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray p-6 rounded-lg shadow-md">
                    <div className="form-group mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password"
                            required
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="form-group mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            required
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    {message && (
                        <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md">
                            {message}
                        </div>
                    )}
                    
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Resetting Password..." : "Reset Password"}
                    </Button>
                </form>
            )}
        </Card>
    );
};

export default ResetPassword;