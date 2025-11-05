import React from "react";
import Jobs from "../../components/Jobs/jobs.jsx";

function JobsPage({ user, isLoggedIn, setShowLogin }) {
  return (
    <div>
      <Jobs
        user={user}
        isLoggedIn={isLoggedIn}
        setShowLogin={setShowLogin}
      />
    </div>
  );
}

export default JobsPage;
