import React from 'react';
import './QuickActionsCard.css';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const QuickActionsCard = () => {
  const { user } = useSelector((state) => state.authReducer.authData);

  const quickActions = [
    {
      icon: '✏️',
      title: 'Create Post',
      description: 'Share your thoughts',
      action: 'create-post'
    },
    {
      icon: '👤',
      title: 'View Profile',
      description: 'Check your profile',
      action: 'profile'
    },
    {
      icon: '👥',
      title: 'Find Friends',
      description: 'Discover new people',
      action: 'find-friends'
    },
    {
      icon: '📊',
      title: 'Activity',
      description: 'Your recent activity',
      action: 'activity'
    },
    {
      icon: '⚙️',
      title: 'Settings',
      description: 'Account settings',
      action: 'settings'
    }
  ];

  const handleActionClick = (action) => {
    switch (action) {
      case 'create-post':
        // Trigger post creation modal
        const shareButton = document.querySelector('.rg-button');
        if (shareButton) shareButton.click();
        break;
      case 'profile':
        window.location.href = `/profile/${user._id}`;
        break;
      case 'find-friends':
        // Scroll to followers card or implement friend discovery
        const followersCard = document.querySelector('.FollowersCard');
        if (followersCard) followersCard.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'activity':
        // Could implement activity page later
        alert('Activity page coming soon!');
        break;
      case 'settings':
        alert('Settings page coming soon!');
        break;
      default:
        break;
    }
  };

  return (
    <div className='QuickActionsCard'>
      <h3>Quick Actions</h3>
      
      <div className="actions-grid">
        {quickActions.map((action, index) => (
          <div 
            key={index} 
            className="action-item"
            onClick={() => handleActionClick(action.action)}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-content">
              <span className="action-title">{action.title}</span>
              <span className="action-description">{action.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-number">{user.followers?.length || 0}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">{user.following?.length || 0}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsCard;