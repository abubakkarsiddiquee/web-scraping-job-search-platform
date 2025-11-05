import React from 'react';
import Profile from '../../components/Profiles/Profile.jsx';
import Footer from "../../components/Footer/footer.jsx";

function ProfilePage({ user, profilePicture, setProfilePicture, onSignOut }) {
  return (
    <> 
     <Profile user={user} profilePicture={profilePicture} setProfilePicture={setProfilePicture} onSignOut={onSignOut} />
   
    </>
  
  );
}

export default ProfilePage;
