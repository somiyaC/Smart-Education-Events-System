"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function Payment() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventId = searchParams.get("eventId");
  const price = searchParams.get("price");
  const eventName = searchParams.get("eventName");

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiryDate: "",
    cvv: "",
    billingName: "",
    billingEmail: "",
    billingAddress: "",
  });

  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    finalPrice: number;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails({
      ...paymentDetails,
      [name]: value,
    });
  };

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
    // Clear any previously applied discount when the user changes the promo code
    if (appliedDiscount && e.target.value !== appliedDiscount.code) {
      setAppliedDiscount(null);
    }
    setPromoError("");
  };

  const verifyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setIsVerifyingPromo(true);
    setPromoError("");

    try {
      const response = await fetch(`http://localhost:8000/discounts/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
          code: promoCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Invalid promo code");
      }

      const discount = await response.json();

      // Calculate the discounted price
      const originalPrice = parseFloat(price || "0");
      let finalPrice = originalPrice;

      if (discount.discount_type === "percentage") {
        finalPrice = originalPrice * (1 - discount.discount_value / 100);
      } else if (discount.discount_type === "fixed_amount") {
        finalPrice = Math.max(0, originalPrice - discount.discount_value);
      }

      finalPrice = Math.round(finalPrice * 100) / 100; // Round to 2 decimal places

      setAppliedDiscount({
        code: discount.code,
        discountType: discount.discount_type,
        discountValue: discount.discount_value,
        finalPrice,
      });
    } catch (error) {
      console.error("Error verifying promo code:", error);
      setPromoError(
        error instanceof Error ? error.message : "Invalid promo code"
      );
      setAppliedDiscount(null);
    } finally {
      setIsVerifyingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    try {
      const userId = localStorage.getItem("user_id");
      const finalPrice = appliedDiscount
        ? appliedDiscount.finalPrice
        : parseFloat(price || "0");

      // First process the payment (simulated for now)
      // In a real app, you would call your payment API here
      const paymentResponse = await fetch(
        "http://localhost:8000/payments/process",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: finalPrice,
            currency: "USD",
            status: "completed",
            user_id: userId,
            event_id: eventId,
            payment_method: "CREDIT_CARD",
            payment_provider: "stripe",
            billing_name: paymentDetails.billingName,
            billing_email: paymentDetails.billingEmail,
            billing_address: {
              line1: paymentDetails.billingAddress,
            },
            last_four: paymentDetails.cardNumber.slice(-4),
            discount_code: appliedDiscount ? promoCode : null,
          }),
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Payment processing failed");
      }

      // After successful payment, register the user for the event
      const signupResponse = await fetch(
        "http://localhost:8000/events/event_signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            event_id: eventId,
          }),
        }
      );

      const signupData = await signupResponse.json();

      if (signupData.status === false) {
        throw new Error("Failed to register for event");
      }

      // Create a ticket for the user
      const ticketResponse = await fetch("http://localhost:8000/tickets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
          price: finalPrice,
          status: "paid",
          attendee_id: userId,
          discount_code: appliedDiscount ? promoCode : null,
        }),
      });

      if (!ticketResponse.ok) {
        throw new Error("Failed to create ticket");
      }

      // If a discount was used, increment its usage count
      if (appliedDiscount) {
        await fetch(`http://localhost:8000/discounts/use`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: promoCode,
            event_id: eventId,
          }),
        });
      }

      // Redirect to success page
      router.push("/payment-success");
    } catch (error) {
      console.error("Error during payment process:", error);
      setError("Payment or registration failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Calculate display price based on discount
  const displayPrice = appliedDiscount
    ? appliedDiscount.finalPrice
    : parseFloat(price || "0");
  const originalPrice = parseFloat(price || "0");
  const hasDiscount = appliedDiscount !== null;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-orange-400 mb-6">
        Payment for {eventName}
      </h1>

      <div className="mb-6">
        {hasDiscount ? (
          <div>
            <p className="text-gray-500 line-through">
              Original Price: ${originalPrice.toFixed(2)}
            </p>
            <p className="text-green-600 font-semibold">
              Discounted Price: ${displayPrice.toFixed(2)}
              {appliedDiscount.discountType === "percentage"
                ? ` (${appliedDiscount.discountValue}% off)`
                : ` ($${appliedDiscount.discountValue.toFixed(2)} off)`}
            </p>
            <p className="text-sm text-green-600">
              Promo code applied: {appliedDiscount.code}
            </p>
          </div>
        ) : (
          <p className="font-bold">Ticket Price ${originalPrice.toFixed(2)}</p>
        )}
      </div>

      {/* Promo Code Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-medium mb-2">Have a promo code?</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter code"
            className="flex-1 border border-orange-300 rounded-md p-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
            value={promoCode}
            onChange={handlePromoCodeChange}
          />
          <button
            type="button"
            onClick={verifyPromoCode}
            disabled={isVerifyingPromo || !promoCode.trim()}
            className="bg-orange-300 text-white px-4 py-2 rounded-md cursor-pointer active:bg-orange-400"
          >
            {isVerifyingPromo ? "Verifying..." : "Apply"}
          </button>
        </div>
        {promoError && (
          <p className="text-red-500 text-sm mt-1">{promoError}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Card Number
          </label>
          <input
            type="text"
            name="cardNumber"
            pattern="[0-9]{16}"
            maxLength={16}
            required
            placeholder="1234 5678 9012 3456"
            className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
            value={paymentDetails.cardNumber}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name on Card
          </label>
          <input
            type="text"
            name="nameOnCard"
            required
            placeholder="John Doe"
            className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
            value={paymentDetails.nameOnCard}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              type="text"
              name="expiryDate"
              required
              placeholder="MM/YY"
              pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
              className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
              value={paymentDetails.expiryDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CVV
            </label>
            <input
              type="text"
              name="cvv"
              required
              placeholder="123"
              pattern="[0-9]{3,4}"
              maxLength={4}
              className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
              value={paymentDetails.cvv}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Billing Name
          </label>
          <input
            type="text"
            name="billingName"
            required
            placeholder="John Doe"
            className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
            value={paymentDetails.billingName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Billing Email
          </label>
          <input
            type="email"
            name="billingEmail"
            required
            placeholder="john@example.com"
            className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
            value={paymentDetails.billingEmail}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Billing Address
          </label>
          <input
            type="text"
            name="billingAddress"
            required
            placeholder="123 Main St, City, Country"
            className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
            value={paymentDetails.billingAddress}
            onChange={handleInputChange}
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-orange-400 text-white p-2 rounded-3xl cursor-pointer active:bg-orange-500"
        >
          {isProcessing ? "Processing..." : `Pay $${displayPrice.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
