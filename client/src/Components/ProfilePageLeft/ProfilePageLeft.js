import React from 'react';
import './ProfilePageLeft.css';
import LogoBrand from '../LogoBrand/LogoBrand';
import InfoCard from '../InfoCard/InfoCard';
import FollowersCard from '../FollowersCard/FollowersCard';

const ProfilePageLeft = () => {
  return (
    <div className='ProfilePageLeft'>
       <LogoBrand />
       <InfoCard />
       <FollowersCard />
    </div>
  )
}

export default ProfilePageLeft
