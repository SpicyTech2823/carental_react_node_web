import React, { useState, useEffect } from "react";
import {
  Check,
  CreditCard,
  Calendar,
  User,
  Mail,
  Phone,
  QrCode,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getCars, createBooking } from "../utils/api";

const Car = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Wait for auth to finish loading before redirecting
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [user, loading, navigate, location]);

  // Car categories for filtering
  const categories = ["All cars", "Business", "Family", "Adventure", "Wedding"];

  // State management for car selection and filtering
  const [cars, setCars] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All cars");
  const [selectedCar, setSelectedCar] = useState(null);

  // Booking process state (multi-step wizard)
  const [bookingStep, setBookingStep] = useState(1); // 1: Select car, 2: Booking form, 3: Payment, 4: Invoice
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    pickupDate: "",
    returnDate: "",
    days: 1,
  });

  // Payment and booking completion state
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPaid, setIsPaid] = useState(false);
  const [bookingId] = useState(() => Date.now().toString().slice(-8));
  const [invoiceId] = useState(() => Date.now().toString().slice(-8));

  // Data fetching
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const { cars: apiCars } = await getCars();
        setCars(apiCars || []);
      } catch (error) {
        console.error("Error fetching cars:", error);
      }
    };
    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Filter cars based on selected category
  const filteredCars =
    selectedCategory === "All cars"
      ? cars
      : cars.filter((car) => car.category.includes(selectedCategory));

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedCar) return 0;
    return selectedCar.price * bookingDetails.days;
  };

  // Handle booking form submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingStep(3); // Move to payment step
  };

  // Handle payment
  const handlePayment = async () => {
    if (!selectedCar) return;

    const totalPrice = calculateTotal();

    try {
      await createBooking({
        car_id: selectedCar.id,
        customer_name: bookingDetails.name,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        pickup_date: bookingDetails.pickupDate,
        return_date: bookingDetails.returnDate,
        days: bookingDetails.days,
        total_price: totalPrice,
        payment_method: paymentMethod,
        is_paid: true,
      });
      setIsPaid(true);
      setBookingStep(4);
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Error saving booking. Please try again.");
      return;
    }

    setIsPaid(true);
    setBookingStep(4);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-30 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-red-800">
            Available Car
          </h1>
          <p className="text-gray-600 mt-2">Choose your perfect ride</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {["Select Car", "Booking Details", "Payment", "Invoice"].map(
              (step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${
                    bookingStep > index + 1
                      ? "bg-green-500 text-white"
                      : bookingStep === index + 1
                        ? "bg-red-800 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                  >
                    {bookingStep > index + 1 ? <Check size={20} /> : index + 1}
                  </div>
                  <span
                    className={`mt-2 text-sm ${bookingStep === index + 1 ? "font-semibold text-red-800" : "text-gray-600"}`}
                  >
                    {step}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Categories and Car List */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? "bg-red-800 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Car Grid */}
            {bookingStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCars.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {car.name}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {car.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-800">
                            ${car.price}
                            <span className="text-sm text-gray-500">/day</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {car.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCar(car);
                          setBookingStep(2);
                        }}
                        className="mt-6 w-full bg-red-800 text-white py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
                      >
                        Select & Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Booking Form */}
            {bookingStep === 2 && selectedCar && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="text-red-800 hover:text-red-900 mr-4"
                  >
                    ← Back to Cars
                  </button>
                  <h2 className="text-2xl font-bold">Booking Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <img
                      src={selectedCar.image}
                      alt={selectedCar.name}
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCar.name}</h3>
                    <p className="text-gray-600 mt-2">
                      {selectedCar.description}
                    </p>
                    <div className="mt-4">
                      <div className="text-3xl font-bold text-red-800">
                        ${selectedCar.price}
                        <span className="text-lg text-gray-500">/day</span>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline-block mr-2" size={16} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800"
                        value={bookingDetails.name}
                        onChange={(e) =>
                          setBookingDetails({
                            ...bookingDetails,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline-block mr-2" size={16} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-900"
                        value={bookingDetails.email}
                        onChange={(e) =>
                          setBookingDetails({
                            ...bookingDetails,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="inline-block mr-2" size={16} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={bookingDetails.phone}
                        onChange={(e) =>
                          setBookingDetails({
                            ...bookingDetails,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline-block mr-2" size={16} />
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-900"
                        value={bookingDetails.pickupDate}
                        onChange={(e) =>
                          setBookingDetails({
                            ...bookingDetails,
                            pickupDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline-block mr-2" size={16} />
                        Return Date
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={bookingDetails.returnDate}
                        onChange={(e) => {
                          const returnDate = e.target.value;
                          const days =
                            Math.ceil(
                              (new Date(returnDate) -
                                new Date(bookingDetails.pickupDate)) /
                                (1000 * 60 * 60 * 24),
                            ) || 1;
                          setBookingDetails({
                            ...bookingDetails,
                            returnDate,
                            days,
                          });
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rental Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={bookingDetails.days}
                        onChange={(e) =>
                          setBookingDetails({
                            ...bookingDetails,
                            days: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-8 w-full bg-red-800 text-white py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
                  >
                    Proceed to Payment
                  </button>
                </form>
              </div>
            )}

            {/* Payment Step */}
            {bookingStep === 3 && selectedCar && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="text-red-800 hover:text-red-900 mr-4"
                  >
                    ← Back to Booking
                  </button>
                  <h2 className="text-2xl font-bold">Payment</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Choose Payment Method
                    </h3>

                    <div className="space-y-4">
                      {["card", "paypal", "bank"].map((method) => (
                        <label
                          key={method}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                            paymentMethod === method
                              ? "border-red-800 bg-red-50"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === method}
                            onChange={() => setPaymentMethod(method)}
                            className="mr-3"
                          />
                          <CreditCard className="mr-3" size={20} />
                          <span className="capitalize">
                            {method === "card" ? "Credit/Debit Card" : method}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Payment Form */}
                    {paymentMethod === "card" && (
                      <div className="mt-6 space-y-4">
                        <input
                          type="text"
                          placeholder="Card Number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Cardholder Name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">
                        Order Summary
                      </h3>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Car Rental</span>
                          <span>{selectedCar.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Daily Rate</span>
                          <span>${selectedCar.price}/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rental Period</span>
                          <span>{bookingDetails.days} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span>
                            ${selectedCar.price * bookingDetails.days}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-3">
                          <span className="font-semibold">Total Amount</span>
                          <span className="text-2xl font-bold text-red-800">
                            ${calculateTotal()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handlePayment}
                        className="mt-6 w-full bg-red-800 text-white py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
                      >
                        Confirm Payment ${calculateTotal()}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice with QR Code */}
            {bookingStep === 4 && isPaid && selectedCar && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center mb-8">
                  <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                    <Check className="text-green-600" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Payment Successful!
                  </h2>
                  <p className="text-gray-600">
                    Your booking has been confirmed
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Booking Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking ID:</span>
                          <span className="font-medium">BK-{bookingId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Car:</span>
                          <span>{selectedCar.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer:</span>
                          <span>{bookingDetails.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rental Period:</span>
                          <span>
                            {bookingDetails.pickupDate} to{" "}
                            {bookingDetails.returnDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Days:</span>
                          <span>{bookingDetails.days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="capitalize">{paymentMethod}</span>
                        </div>
                        <div className="flex justify-between border-t pt-3 mt-3">
                          <span className="font-semibold">Total Paid:</span>
                          <span className="text-xl font-bold text-green-600">
                            ${calculateTotal()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="w-full bg-red-800 text-white py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
                    >
                      Download Invoice
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4">
                      <QrCode size={80} className="text-gray-400" />
                    </div>
                    <div className="bg-gray-100 p-6 rounded-lg w-full max-w-xs">
                      <div className="text-center">
                        <h4 className="font-semibold mb-2">Scan for Invoice</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Show this QR code at pickup
                        </p>
                        <div className="bg-white p-4 rounded">
                          {/* In a real app, you would generate an actual QR code */}
                          <div className="text-xs font-mono whitespace-pre">
                            [QR Code for Invoice Data]
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                          Invoice ID: INV-{invoiceId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold mb-4">Booking Summary</h3>

              {selectedCar ? (
                <>
                  <div className="flex items-center mb-4">
                    <img
                      src={selectedCar.image}
                      alt={selectedCar.name}
                      className="w-16 h-16 rounded-lg object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold">{selectedCar.name}</h4>
                      <p className="text-sm text-gray-600">
                        ${selectedCar.price} × {bookingDetails.days} days
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${selectedCar.price * bookingDetails.days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span>
                        $
                        {(
                          selectedCar.price *
                          bookingDetails.days *
                          0.1
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-red-800">
                        ${calculateTotal()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm text-gray-600">
                      <Check className="inline-block mr-2" size={16} />
                      Free cancellation up to 24 hours before pickup
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <Check className="inline-block mr-2" size={16} />
                      Unlimited mileage included
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select a car to see booking summary
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Car;
