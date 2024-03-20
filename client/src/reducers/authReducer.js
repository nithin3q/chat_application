const authReducer = (
  state = {
    authData: null,
    loading: false,
    error: false,
    updateLoading: false,
  },
  action
) => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: false };
    case "AUTH_SUCCESS":
      localStorage.setItem("profile", JSON.stringify({ ...action?.data }));

      return { ...state, authData: action.data, loading: false, error: false };

    case "AUTH_FAIL":
      return { ...state, loading: false, error: true };

      case "LOG_OUT":
      localStorage.clear();
      // Clear site data (if needed)
      // You might want to clear other data or perform additional actions here
      // Example: sessionStorage.clear();

      // Navigate to a blank page before closing the tab
      window.location.href = "http://localhost:3000/";
      
      // Close the tab
      window.close();
      return {
        ...state,
        authData: null,
        loading: false,
        error: false,
        updateLoading: false,
      };

  
    default:
      return state;
  }
};

export default authReducer;
