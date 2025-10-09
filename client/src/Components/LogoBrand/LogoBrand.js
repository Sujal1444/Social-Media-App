import React from 'react'
import './LogoBrand.css'
import Logo from '../../Img/logo.png';
import { Link } from 'react-router-dom';

const LogoBrand = () => {
  return (
    <div className='LogoBrand'>
      <Link to='../home' className='logo-container'>
        <img src={Logo} alt="Social Media Logo" />
        <span className='sm-initials'>SocialMedia</span>
      </Link>
    </div>
  )
}

export default LogoBrand