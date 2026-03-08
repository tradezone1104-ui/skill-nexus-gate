import { useLocation, useNavigate } from "react-router-dom";

const BackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on homepage
  if (location.pathname === "/") return null;

  return (
    <div className="container mx-auto px-4">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-foreground/60 hover:text-foreground transition-colors pt-3 pb-1"
      >
        ← Back
      </button>
    </div>
  );
};

export default BackButton;
