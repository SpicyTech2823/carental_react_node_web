import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getCars,
  getBookings,
  getFeedback,
  createCar,
  updateCar,
  deleteCar,
  confirmBooking,
  deleteBooking,
  toggleFeedbackFeatured,
  deleteFeedback,
} from "../../utils/api";
import {
  Edit,
  Trash2,
  Plus,
  Calendar,
  MessageSquare,
  Star,
  Eye,
  Check,
  X,
  Car,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // State management for different data types
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // UI state management
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("cars");

  // Car management state
  const [editingCar, setEditingCar] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Modal state for viewing details
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Form state for car editing
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    features: "",
  });

  // Admin verification function
  const verifyAdminAccess = useCallback(async () => {
    try {
      if (!user) {
        navigate("/admin/login");
        return false;
      }
      if (user.role !== "admin") {
        navigate("/not-authorized");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Admin verification failed:", error);
      await signOut();
      navigate("/not-authorized");
      return false;
    }
  }, [navigate, signOut, user]);

  // Data fetching functions
  const fetchCars = async () => {
    try {
      const { cars: apiCars } = await getCars();
      setCars(apiCars || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { bookings: apiBookings } = await getBookings();
      setBookings(apiBookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const { feedback: apiFeedback } = await getFeedback();
      setFeedback(apiFeedback || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  // Booking action handlers
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await confirmBooking(bookingId, true);
      alert("Booking confirmed successfully!");
      fetchBookings();
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Error confirming booking. Please try again.");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await deleteBooking(bookingId);
      alert("Booking canceled successfully!");
      fetchBookings();
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert("Error canceling booking. Please try again.");
    }
  };

  // Feedback action handlers
  const handleViewFeedback = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setShowFeedbackModal(true);
  };

  const handleToggleFeatureFeedback = async (feedbackId, currentFeatured) => {
    try {
      await toggleFeedbackFeatured(feedbackId, !currentFeatured);
      alert(
        `Feedback ${!currentFeatured ? "featured" : "unfeatured"} successfully!`,
      );
      fetchFeedback();
    } catch (error) {
      console.error("Error updating feedback:", error);
      alert("Error updating feedback. Please try again.");
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      await deleteFeedback(feedbackId);
      alert("Feedback deleted successfully!");
      fetchFeedback();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Error deleting feedback. Please try again.");
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      setAdminCheckLoading(true);
      const authorized = await verifyAdminAccess();
      setIsAuthorized(authorized);
      setAdminCheckLoading(false);

      if (authorized) {
        fetchCars();
        fetchBookings();
        fetchFeedback();
      }
    };

    checkAdminAccess();
  }, [navigate, signOut, verifyAdminAccess]);

  // Car management handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    const carData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      category: formData.category.split(",").map((c) => c.trim()),
      features: formData.features.split(",").map((f) => f.trim()),
    };

    try {
      if (editingCar) {
        await updateCar(editingCar.id, carData);
        fetchCars();
        setEditingCar(null);
      } else {
        await createCar(carData);
        fetchCars();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error saving car:", error);
    }

    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      features: "",
    });
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      description: car.description,
      price: car.price.toString(),
      image: car.image,
      category: car.category.join(", "),
      features: car.features.join(", "),
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await deleteCar(id);
        fetchCars();
      } catch (error) {
        console.error("Error deleting car:", error);
      }
    }
  };

  const handleCancel = () => {
    setEditingCar(null);
    setShowAddForm(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      features: "",
    });
  };

  if (adminCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Main dashboard UI
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-red-800">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage your car rental application</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("cars")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "cars"
                    ? "border-red-800 text-red-800"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Car className="inline-block w-4 h-4 mr-2" />
                Cars
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "bookings"
                    ? "border-red-800 text-red-800"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Calendar className="inline-block w-4 h-4 mr-2" />
                Bookings
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "feedback"
                    ? "border-red-800 text-red-800"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <MessageSquare className="inline-block w-4 h-4 mr-2" />
                Feedback
              </button>
            </nav>
          </div>
        </div>

        {/* Cars Tab */}
        {activeTab === "cars" && (
          <>
            <div className="mb-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Add New Car
              </button>
            </div>

            {(showAddForm || editingCar) && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4">
                  {editingCar ? "Edit Car" : "Add New Car"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price per day
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Features (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.features}
                      onChange={(e) =>
                        setFormData({ ...formData, features: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      {editingCar ? "Update" : "Add"} Car
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-bold">{car.name}</h3>
                    <p className="text-gray-600 text-sm">{car.description}</p>
                    <p className="text-red-800 font-bold mt-2">
                      ${car.price}/day
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(car)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(car.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Bookings Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Car</th>
                      <th className="px-4 py-2 text-left">Dates</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-t">
                        <td className="px-4 py-2">
                          <div>
                            <p className="font-medium">
                              {booking.customer_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div>
                            <span>Car ID: {booking.car_id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div>
                            <p>
                              From:{" "}
                              {new Date(
                                booking.pickup_date,
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              To:{" "}
                              {new Date(
                                booking.return_date,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              booking.is_paid
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.is_paid ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-medium">
                          ${booking.total_price}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewBooking(booking)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleConfirmBooking(booking.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Confirm Booking"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel Booking"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Feedback Management</h2>
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{item.user_name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.user_email}
                        </p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < item.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewFeedback(item)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleFeatureFeedback(
                              item.id,
                              item.is_featured,
                            )
                          }
                          className={`${
                            item.is_featured
                              ? "text-yellow-600"
                              : "text-gray-400"
                          } hover:text-yellow-600`}
                          title={item.is_featured ? "Unfeature" : "Feature"}
                        >
                          <Star
                            size={16}
                            className={item.is_featured ? "fill-current" : ""}
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700">{item.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Booking Details</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-medium">Customer:</label>
                <p>{selectedBooking.customer_name}</p>
              </div>
              <div>
                <label className="font-medium">Email:</label>
                <p>{selectedBooking.email}</p>
              </div>
              <div>
                <label className="font-medium">Phone:</label>
                <p>{selectedBooking.phone}</p>
              </div>
              <div>
                <label className="font-medium">Car ID:</label>
                <p>{selectedBooking.car_id}</p>
              </div>
              <div>
                <label className="font-medium">Pickup Date:</label>
                <p>
                  {new Date(selectedBooking.pickup_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="font-medium">Return Date:</label>
                <p>
                  {new Date(selectedBooking.return_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="font-medium">Days:</label>
                <p>{selectedBooking.days}</p>
              </div>
              <div>
                <label className="font-medium">Total Price:</label>
                <p>${selectedBooking.total_price}</p>
              </div>
              <div>
                <label className="font-medium">Payment Method:</label>
                <p>{selectedBooking.payment_method}</p>
              </div>
              <div>
                <label className="font-medium">Status:</label>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedBooking.is_paid
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedBooking.is_paid ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Details Modal */}
      {showFeedbackModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Feedback Details</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-medium">User:</label>
                <p>{selectedFeedback.user_name}</p>
              </div>
              <div>
                <label className="font-medium">Email:</label>
                <p>{selectedFeedback.user_email || "Not provided"}</p>
              </div>
              <div>
                <label className="font-medium">Rating:</label>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < selectedFeedback.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="ml-2">({selectedFeedback.rating}/5)</span>
                </div>
              </div>
              <div>
                <label className="font-medium">Comment:</label>
                <p className="mt-1 p-3 bg-gray-50 rounded">
                  {selectedFeedback.comment}
                </p>
              </div>
              <div>
                <label className="font-medium">Car ID:</label>
                <p>{selectedFeedback.car_id || "General feedback"}</p>
              </div>
              <div>
                <label className="font-medium">Featured:</label>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedFeedback.is_featured
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedFeedback.is_featured ? "Featured" : "Not Featured"}
                </span>
              </div>
              <div>
                <label className="font-medium">Date:</label>
                <p>
                  {new Date(selectedFeedback.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
