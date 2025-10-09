import React from 'react'
import './ProfileSide.css'
import LogoBrand from '../LogoBrand/LogoBrand';
import ProfileCard from '../ProfileCard/ProfileCard'
import FollowersCard from '../FollowersCard/FollowersCard'

const ProfileSide = () => {
  return (
    <div className='ProfileSide'>
      <LogoBrand />
      <ProfileCard location="homepage" />
      <FollowersCard />
    </div>
  )
}

export default ProfileSide

