import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaHeart, FaComment, FaShare, FaTrophy, FaCalendarAlt, FaPlus, FaImage } from 'react-icons/fa';
import DashboardNav from '../DashboardNav/DashboardNav';
import './Community.css';

const Community = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        avatar: '/redlogo.png',
        level: 'Advanced'
      },
      content: 'Just completed my first 10K run with the R&D community! The energy was incredible and the support from fellow runners made all the difference. Can\'t wait for next week\'s session! 🏃‍♀️💪',
      image: '/event8.jpg',
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: '2 hours ago',
      liked: false,
      type: 'achievement'
    },
    {
      id: 2,
      user: {
        name: 'Mike Chen',
        avatar: '/redlogo.png',
        level: 'Intermediate'
      },
      content: 'Looking for running buddies for tomorrow\'s early morning session. Anyone interested in a 5K run around C3 Cafe area? Let\'s motivate each other!',
      likes: 12,
      comments: 15,
      shares: 2,
      timestamp: '4 hours ago',
      liked: false,
      type: 'invitation'
    },
    {
      id: 3,
      user: {
        name: 'Priya Patel',
        avatar: '/redlogo.png',
        level: 'Beginner'
      },
      content: 'Today\'s mindful running session was exactly what I needed. The breathing techniques and meditation before the run really helped me stay focused. Thank you R&D for introducing me to this holistic approach!',
      image: '/event7.jpg',
      likes: 31,
      comments: 12,
      shares: 7,
      timestamp: '6 hours ago',
      liked: false,
      type: 'experience'
    }
  ]);

  const [topRunners] = useState([
    { name: 'Alex Kumar', runs: 45, distance: 180.5, level: 'Elite' },
    { name: 'Maria Santos', runs: 42, distance: 168.2, level: 'Advanced' },
    { name: 'David Kim', runs: 38, distance: 152.8, level: 'Advanced' },
    { name: 'Lisa Wang', runs: 35, distance: 140.3, level: 'Intermediate' },
    { name: 'Raj Patel', runs: 32, distance: 128.7, level: 'Intermediate' }
  ]);

  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleComment = (postId) => {
    console.log('Comment on post:', postId);
    // In a real app, this would open a comment modal or section
  };

  const handleShare = (postId) => {
    console.log('Share post:', postId);
    // In a real app, this would trigger share functionality
  };

  const handleNewPostSubmit = (e) => {
    e.preventDefault();
    if (newPostContent.trim() === '') return;
    
    const newPost = {
      id: posts.length + 1,
      user: {
        name: 'Current User',
        avatar: '/redlogo.png',
        level: 'Beginner'
      },
      content: newPostContent,
      image: newPostImage,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: 'Just now',
      liked: false,
      type: 'post'
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostImage(null);
    setShowNewPostForm(false);
  };

  return (
    <div className="community">
      <DashboardNav />
      <div className="community-main">
        <div className="community-content">
          <div className="community-grid">
            {/* Community Feed */}
            <motion.div 
              className="feed-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="section-header">
                <h2>Community Feed</h2>
                <button 
                  className="new-post-btn"
                  onClick={() => setShowNewPostForm(!showNewPostForm)}
                >
                  <FaPlus />
                  New Post
                </button>
              </div>
              
              {/* New Post Form */}
              {showNewPostForm && (
                <motion.div 
                  className="new-post-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleNewPostSubmit}>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share your running experience, ask questions, or post updates..."
                      rows="4"
                    />
                    <div className="form-actions">
                      <label className="image-upload-label">
                        <FaImage />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewPostImage(e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <div className="form-buttons">
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => setShowNewPostForm(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                          Post
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
              
              <div className="posts-container">
                {posts.map((post) => (
                  <motion.div 
                    key={post.id} 
                    className="post-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="post-header">
                      <div className="user-info">
                        <img src={post.user.avatar} alt={post.user.name} className="user-avatar" />
                        <div>
                          <h3>{post.user.name}</h3>
                          <span className="user-level">{post.user.level} Runner</span>
                        </div>
                      </div>
                      <span className="post-timestamp">{post.timestamp}</span>
                    </div>
                    
                    <div className="post-content">
                      <p>{post.content}</p>
                      {post.image && (
                        <img src={post.image} alt="Post" className="post-image" />
                      )}
                    </div>
                    
                    <div className="post-actions">
                      <button 
                        className={`action-btn like-btn ${post.liked ? 'liked' : ''}`}
                        onClick={() => handleLike(post.id)}
                      >
                        <FaHeart />
                        {post.likes}
                      </button>
                      <button 
                        className="action-btn comment-btn"
                        onClick={() => handleComment(post.id)}
                      >
                        <FaComment />
                        {post.comments}
                      </button>
                      <button 
                        className="action-btn share-btn"
                        onClick={() => handleShare(post.id)}
                      >
                        <FaShare />
                        {post.shares}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Sidebar with Leaderboard and Events */}
            <div className="community-sidebar">
              {/* Leaderboard */}
              <motion.div 
                className="leaderboard-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="section-header">
                  <h2>Top Runners</h2>
                  <FaTrophy className="section-icon" />
                </div>
                
                <div className="leaderboard">
                  {topRunners.map((runner, index) => (
                    <div key={index} className="leaderboard-item">
                      <div className="rank">{index + 1}</div>
                      <div className="runner-info">
                        <h4>{runner.name}</h4>
                        <span className="runner-level">{runner.level}</span>
                      </div>
                      <div className="runner-stats">
                        <span>{runner.runs} runs</span>
                        <span>{runner.distance}km</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Community Events */}
              <motion.div 
                className="events-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="section-header">
                  <h2>Upcoming Events</h2>
                  <FaCalendarAlt className="section-icon" />
                </div>
                
                <div className="community-events">
                  <div className="event-card">
                    <div className="event-header">
                      <h4>Weekly Group Run</h4>
                      <span className="event-date">Tomorrow, 6:00 AM</span>
                    </div>
                    <p>Join us for our weekly community run at C3 Cafe</p>
                    <div className="event-participants">
                      <FaUsers />
                      <span>25 participants</span>
                    </div>
                    <button className="join-event-btn">Join Event</button>
                  </div>
                  
                  <div className="event-card">
                    <div className="event-header">
                      <h4>Mindful Running Workshop</h4>
                      <span className="event-date">Saturday, 7:00 AM</span>
                    </div>
                    <p>Learn breathing techniques and meditation for better running</p>
                    <div className="event-participants">
                      <FaUsers />
                      <span>12 participants</span>
                    </div>
                    <button className="join-event-btn">Join Event</button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;