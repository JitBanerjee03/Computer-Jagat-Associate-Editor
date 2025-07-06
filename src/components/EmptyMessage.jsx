import { Link } from "react-router-dom";
import './styles/EmptyMessage.css'
const EmptyMessage = ({ message = "No journals assigned yet", showAction = true }) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-content">
        <div className="empty-state-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6l3 6h12l3-6" />
            <path d="M3 6l3-6h12l3 6" />
            <path d="M6 6v12" />
            <path d="M18 6v12" />
          </svg>
        </div>
        <h3 className="empty-state-title">Nothing to display</h3>
        <p className="empty-state-message">{message}</p>
      </div>
    </div>
  );
};

export default EmptyMessage;