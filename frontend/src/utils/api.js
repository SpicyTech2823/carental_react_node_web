const baseUrl = import.meta.env.VITE_API_URL || "/api";

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  const data =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : null;

  if (!response.ok) {
    const message = data?.error || response.statusText || "Unknown error";
    throw new Error(message);
  }

  return data;
};

export const getToken = () => localStorage.getItem("authToken");
export const setToken = (token) => localStorage.setItem("authToken", token);
export const clearToken = () => localStorage.removeItem("authToken");

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const register = (payload) =>
  fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(handleResponse)
    .then((data) => {
      if (data?.token) {
        setToken(data.token);
      }
      return data;
    });

export const login = (payload) =>
  fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(handleResponse)
    .then((data) => {
      if (data?.token) {
        setToken(data.token);
      }
      return data;
    });

export const getProfile = () =>
  fetch(`${baseUrl}/auth/profile`, {
    method: "GET",
    headers: { ...authHeaders() },
  }).then(handleResponse);

export const resetPassword = (payload) =>
  fetch(`${baseUrl}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const getCars = () =>
  fetch(`${baseUrl}/cars`, { method: "GET" }).then(handleResponse);

export const createBooking = (payload) =>
  fetch(`${baseUrl}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const getFeedback = (featured = false) =>
  fetch(`${baseUrl}/feedback${featured ? "?featured=true" : ""}`, {
    method: "GET",
  }).then(handleResponse);

export const getCarsSimple = () => getCars();

export const submitFeedback = (payload) =>
  fetch(`${baseUrl}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const createCar = (payload) =>
  fetch(`${baseUrl}/cars`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const updateCar = (id, payload) =>
  fetch(`${baseUrl}/cars/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const deleteCar = (id) =>
  fetch(`${baseUrl}/cars/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  }).then(handleResponse);

export const getBookings = () =>
  fetch(`${baseUrl}/bookings`, {
    method: "GET",
    headers: { ...authHeaders() },
  }).then(handleResponse);

export const confirmBooking = (id, isPaid) =>
  fetch(`${baseUrl}/bookings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ is_paid: isPaid }),
  }).then(handleResponse);

export const deleteBooking = (id) =>
  fetch(`${baseUrl}/bookings/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  }).then(handleResponse);

export const toggleFeedbackFeatured = (id, isFeatured) =>
  fetch(`${baseUrl}/feedback/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ is_featured: isFeatured }),
  }).then(handleResponse);

export const deleteFeedback = (id) =>
  fetch(`${baseUrl}/feedback/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  }).then(handleResponse);
