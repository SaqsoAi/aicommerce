"use client";

import { useState } from "react";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export default function SizePredictor() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState("");

  const predict = async () => {
    try {
      const res = await fetch(
        `${API}/ai-size/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            height: Number(height),
            weight: Number(weight),
          }),
        }
      );

      const data =
        await res.json();

      if (data?.success) {
        setResult(
          data.data.recommendedSize
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-6 rounded-xl border p-4">
      <h3 className="mb-3 text-lg font-semibold">
        AI Size Predictor
      </h3>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="number"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) =>
            setHeight(e.target.value)
          }
          className="rounded-lg border p-2"
        />

        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) =>
            setWeight(e.target.value)
          }
          className="rounded-lg border p-2"
        />
      </div>

      <button
        onClick={predict}
        className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
      >
        Predict Size
      </button>

      {result && (
        <div className="mt-4 rounded-lg bg-green-100 p-3 font-bold">
          Recommended Size: {result}
        </div>
      )}
    </div>
  );
}
