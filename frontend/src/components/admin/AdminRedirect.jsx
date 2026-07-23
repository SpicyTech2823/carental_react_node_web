import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        navigate("/admin/dashboard", { replace: true });
      } catch (error) {
        console.error("Admin redirect check failed:", error);
        navigate("/admin/login", { replace: true });
      }
    };

    checkAdminAccess();
  }, [navigate]);

  // Show loading while checking
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
