import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

import JobsPage from "./pages/Job-Page/JobPage.jsx";
import Navbar from "./components/Navbars/navbar.jsx";
import LoginPopUp from "./components/LoginPopUp/LoginPopUp.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import HomePage from "./components/Home/home.jsx";
import Footer from "./components/Footer/footer.jsx";

// ✅ Import your CompanyList component instead of CompaniesPage
import CompanyList from "./components/Company/companyList.jsx";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState("user2.png");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedLoginStatus = localStorage.getItem("isLoggedIn");

    if (storedEmail && storedLoginStatus === "true") {
      setUser({ email: storedEmail });
      setProfilePicture(localStorage.getItem("profilePicture") || "user2.png");
    }
  }, []);

  const handleLoginSuccess = (userInfo) => {
    setUser(userInfo);
    setProfilePicture(userInfo.profile_picture || "user2.png");
    setShowLogin(false);

    localStorage.setItem("userEmail", userInfo.email);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("profilePicture", userInfo.profile_picture || "user2.png");
  };

  return (
    <>
      {showLogin && (
        <LoginPopUp
          setShowLogin={setShowLogin}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      <BrowserRouter>
        <AppRoutes
          user={user}
          profilePicture={profilePicture}
          setProfilePicture={setProfilePicture}
          setShowLogin={setShowLogin}
          setUser={setUser}
        />
      </BrowserRouter>
    </>
  );
}

function AppRoutes({ user, profilePicture, setProfilePicture, setShowLogin, setUser }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    setUser(null);
    setProfilePicture("user2.png");

    localStorage.removeItem("userEmail");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("profilePicture");

    navigate("/home");
  };

  return (
    <>
      <Navbar
        setShowLogin={setShowLogin}
        user={user}
        profilePicture={profilePicture}
      />

      <div className="main-content">
        <Routes>
          <Route path="/home" element={<HomePage user={user} setShowLogin={setShowLogin} />} />
          <Route path="/jobs" element={<JobsPage user={user} isLoggedIn={!!user} setShowLogin={setShowLogin} />} />
          <Route
            path="/profile"
            element={
              <ProfilePage
                user={user}
                profilePicture={profilePicture}
                setProfilePicture={setProfilePicture}
                onSignOut={handleSignOut}
              />
            }
          />

          {/* ✅ Updated to use CompanyList */}
          <Route path="/companies" element={<CompanyList />} />
        </Routes>
      </div>

      <Footer />
    </>
  );
}

export default App;
