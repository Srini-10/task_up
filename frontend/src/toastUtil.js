import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

// Utility function to show toast notifications with custom colors
export const showToast = (message, type = "info") => {
  const toastStyles = {
    success: {
      background: "#ffffff",
      color: "#083344",
      fontSize: "15px",
      fontWeight: "550",
    },
    error: {
      background: "#ffffff",
      color: "#083344",
      fontSize: "15px",
      fontWeight: "550",
    },
    warning: {
      background: "#ffffff",
      color: "#083344",
      fontSize: "15px",
      fontWeight: "550",
    },
    info: {
      background: "#ffffff",
      color: "#083344",
      fontSize: "15px",
      fontWeight: "550",
    },
  };

  const icons = {
    success: <FaCheckCircle size={24} />,
    error: <FaTimesCircle size={24} />,
    warning: <FaExclamationCircle size={24} />,
    info: <FaInfoCircle size={24} />,
  };

  const progressStyles = {
    success: { background: "#083344", height: "1.5px" },
    error: { background: "#083344", height: "1.5px" },
    warning: { background: "#083344", height: "1.5px" },
    info: { background: "#083344", height: "1.5px" },
  };

  switch (type) {
    case "success":
      toast.success(message, {
        style: toastStyles.success,
        progressStyle: progressStyles.success,
        icon: icons.success,
      });
      break;
    case "error":
      toast.error(message, {
        style: toastStyles.error,
        progressStyle: progressStyles.error,
        icon: icons.error,
      });
      break;
    case "warning":
      toast.warn(message, {
        style: toastStyles.warning,
        progressStyle: progressStyles.warning,
        icon: icons.warning,
      });
      break;
    case "info":
    default:
      toast.info(message, {
        style: toastStyles.info,
        progressStyle: progressStyles.info,
        icon: icons.info,
      });
      break;
  }
};
