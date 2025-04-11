import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {Card } from "@/components/ui/card";

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        setIsLoading(true);
        e.preventDefault();
        console.log('Username submitted:', username);

        if (!username) {
            alert('Please enter your username');
            setIsLoading(false);
            return;
        }
    };

    

    return (
        <Card className="forgot-password-page flex flex-col items-center justify-center min-h-screen bg-white-100">
    <h1 className="text-3xl font-bold mb-6">Forgot Password</h1>
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray p-6 rounded-lg shadow-md">
        <div className="form-group mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
            </label>
            <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting" : "submit"}
        </Button>
    </form>
</Card>
    );
};

export default ForgotPassword;