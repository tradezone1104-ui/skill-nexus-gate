import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="text-sm text-foreground/60 hover:text-foreground transition-colors py-2"
    >
      ← Back
    </button>
  );
};

export default BackButton;
