"use client";
import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md text-center">
      <h1 className="text-2xl font-bold text-orange-400 mb-6">
        Registration Complete!
      </h1>
      <p className="mb-6">
        Your payment has been processed successfully and you are now registered
        for the event. Your ticket has been created and you'll receive a
        confirmation email shortly.
      </p>

      <button
        onClick={() => router.push("/")}
        className="bg-orange-400 text-white p-2 rounded-3xl hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        Return to Events
      </button>
    </div>
  );
}
