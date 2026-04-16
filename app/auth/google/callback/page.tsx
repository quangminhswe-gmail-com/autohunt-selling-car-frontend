"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing in with Google...");

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("authChange"));
      setMessage("Google login successful. Redirecting...");
      setTimeout(() => router.push("/profile"), 1000);
      return;
    }

    setMessage("Google login failed. No token was returned.");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Google Login</h1>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
