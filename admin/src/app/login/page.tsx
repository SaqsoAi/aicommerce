"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") + "/api" ||
  "http://localhost:5000/api";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const response = await axios.post(`${API}/auth/login`, data, {
        headers: { "Content-Type": "application/json" },
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-xl w-[420px]">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Login</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input {...register("email")} placeholder="Email" className="w-full border rounded-xl p-4" />
          <input type="password" {...register("password")} placeholder="Password" className="w-full border rounded-xl p-4" />

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl disabled:opacity-60">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
