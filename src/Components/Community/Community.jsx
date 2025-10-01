import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaComment, FaPlus, FaImage, FaRunning, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { auth, db, storage } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, addDoc, updateDoc, doc, increment, serverTimestamp, where, getDocs, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DashboardNav from '../DashboardNav/DashboardNav';
import './Community.css';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [rankedUsers, setRankedUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [newComment, setNewComment] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [postComments, setPostComments] = useState({});

  // Function to calculate user stats
  const calculateUserStats = async (userId) => {
    try {
      // Fetch user runs from bookings collection
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      let totalRuns = 0;
      let totalDistance = 0;
      
      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        // Filter by completed status
        if (booking.status === 'completed') {
          totalRuns++;
          totalDistance += booking.distance || 0;
        }
      });
      
      return { totalRuns, totalDistance };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return { totalRuns: 0, totalDistance: 0 };
    }
  };

  // Set up real-time listeners for posts and ranked users
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Set up real-time listener for posts
    const postsQuery = query(
      collection(db, 'communityPosts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = [];
      snapshot.forEach((doc) => {
        const postData = doc.data();
        // Ensure likedBy is always an array
        if (!Array.isArray(postData.likedBy)) {
          postData.likedBy = [];
        }
        postsData.push({
          id: doc.id,
          ...postData
        });
      });
      setPosts(postsData);
    }, (error) => {
      console.error('Error fetching posts:', error);
    });

    // Set up real-time listener for all users and calculate rankings
    const usersQuery = query(collection(db, 'users'));
    
    const unsubscribeUsers = onSnapshot(usersQuery, async (snapshot) => {
      const usersData = [];
      
      // Collect all users
      snapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Calculate stats for each user
      const usersWithStats = [];
      for (const user of usersData) {
        const stats = await calculateUserStats(user.id);
        usersWithStats.push({
          ...user,
          totalRuns: stats.totalRuns,
          totalDistance: stats.totalDistance
        });
      }
      
      // Sort users by total distance (descending), then by total runs (descending)
      usersWithStats.sort((a, b) => {
        if (b.totalDistance !== a.totalDistance) {
          return b.totalDistance - a.totalDistance;
        }
        return b.totalRuns - a.totalRuns;
      });
      
      setRankedUsers(usersWithStats);
    }, (error) => {
      console.error('Error fetching users:', error);
    });

    // Clean up listeners
    return () => {
      unsubscribeAuth();
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, []);

  // Set up real-time listeners for comments when posts are expanded
  useEffect(() => {
    const unsubscribeFunctions = [];
    
    // For each expanded post, set up a listener for its comments
    Object.keys(expandedComments).forEach(postId => {
      if (expandedComments[postId]) {
        const commentsQuery = query(
          collection(db, 'communityPosts', postId, 'comments'),
          orderBy('createdAt', 'asc'),
          limit(50)
        );
        
        const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
          const commentsData = [];
          snapshot.forEach((doc) => {
            commentsData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setPostComments(prev => ({
            ...prev,
            [postId]: commentsData
          }));
        }, (error) => {
          console.error(`Error fetching comments for post ${postId}:`, error);
        });
        
        unsubscribeFunctions.push(unsubscribe);
      }
    });
    
    // Clean up comment listeners
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [expandedComments]);

  const handleLike = async (postId, isLiked) => {
    if (!currentUser) {
      alert('Please sign in to like posts');
      return;
    }
    
    try {
      const postRef = doc(db, 'communityPosts', postId);
      if (isLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
      } else {
        // Like the post
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = (postId) => {
    // Toggle comment expansion
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = async (postId, commentText) => {
    if (!commentText.trim() || !currentUser) return;
    
    try {
      // Add comment to the post's comments subcollection
      const commentData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous User',
        userPhoto: currentUser.photoURL || '/redlogo.png',
        content: commentText,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'communityPosts', postId, 'comments'), commentData);
      
      // Update post's comment count
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        comments: increment(1)
      });
      
      // Clear the comment input
      setNewComment(prev => ({
        ...prev,
        [postId]: ''
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Function to delete a comment
  const handleDeleteComment = async (postId, commentId, commentUserId) => {
    // Check if the current user is the owner of the comment
    if (!currentUser || currentUser.uid !== commentUserId) {
      alert('You can only delete your own comments');
      return;
    }
    
    try {
      // Delete the comment document
      await deleteDoc(doc(db, 'communityPosts', postId, 'comments', commentId));
      
      // Decrement the post's comment count
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        comments: increment(-1)
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    if (newPostContent.trim() === '' || !currentUser) return;
    
    try {
      let imageUrl = null;
      
      // Upload image if provided
      if (newPostImage) {
        const imageRef = ref(storage, `communityPosts/${currentUser.uid}/${Date.now()}_${newPostImage.name}`);
        const snapshot = await uploadBytes(imageRef, newPostImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      // Create new post
      const newPost = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous User',
        userPhoto: currentUser.photoURL || '/redlogo.png',
        userLevel: 'Beginner', // This would come from user data in a real app
        content: newPostContent,
        image: imageUrl,
        likes: 0,
        comments: 0,
        // Removed shares field
        likedBy: [], // Initialize as empty array
        createdAt: serverTimestamp(),
        timestamp: new Date().toLocaleString()
      };
      
      await addDoc(collection(db, 'communityPosts'), newPost);
      
      setNewPostContent('');
      setNewPostImage(null);
      setShowNewPostForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleCommentChange = (postId, text) => {
    setNewComment(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  const handleCommentKeyPress = (e, postId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit(postId, newComment[postId] || '');
    }
  };

  // Format timestamp for comments
  const formatCommentTime = (timestamp) => {
    if (!timestamp) return '';
    
    // If it's a Firestore timestamp
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    }
    
    // If it's already a Date object or string
    return timestamp.toString();
  };

  // Safe check for likedBy array
  const isPostLikedByUser = (post, userId) => {
    if (!post.likedBy || !Array.isArray(post.likedBy)) {
      return false;
    }
    return post.likedBy.includes(userId);
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
                        <img src={post.userPhoto} alt={post.userName} className="user-avatar" />
                        <div>
                          <h3>{post.userName}</h3>
                          <span className="user-level">{post.userLevel} Runner</span>
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
                        className={`action-btn like-btn ${isPostLikedByUser(post, currentUser?.uid) ? 'liked' : ''}`}
                        onClick={() => handleLike(post.id, isPostLikedByUser(post, currentUser?.uid))}
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
                      {/* Removed share button */}
                    </div>
                    
                    {/* Comments section */}
                    {expandedComments[post.id] && (
                      <div className="comments-section">
                        {/* Add new comment */}
                        <div className="add-comment">
                          <img 
                            src={currentUser?.photoURL || '/redlogo.png'} 
                            alt="Your avatar" 
                            className="comment-avatar" 
                          />
                          <div className="comment-input-container">
                            <textarea
                              value={newComment[post.id] || ''}
                              onChange={(e) => handleCommentChange(post.id, e.target.value)}
                              onKeyPress={(e) => handleCommentKeyPress(e, post.id)}
                              placeholder="Write a comment..."
                              rows="1"
                              className="comment-input"
                            />
                            <button 
                              className="send-comment-btn"
                              onClick={() => handleCommentSubmit(post.id, newComment[post.id] || '')}
                            >
                              <FaPaperPlane />
                            </button>
                          </div>
                        </div>
                        
                        {/* Display comments */}
                        <div className="comments-list">
                          {postComments[post.id] && postComments[post.id].length > 0 ? (
                            postComments[post.id].map((comment) => (
                              <div key={comment.id} className="comment-item">
                                <img 
                                  src={comment.userPhoto} 
                                  alt={comment.userName} 
                                  className="comment-avatar" 
                                />
                                <div className="comment-content">
                                  <div className="comment-header">
                                    <span className="comment-author">{comment.userName}</span>
                                    <span className="comment-time">{formatCommentTime(comment.createdAt)}</span>
                                    {/* Delete button for comment owner */}
                                    {currentUser && currentUser.uid === comment.userId && (
                                      <button 
                                        className="delete-comment-btn"
                                        onClick={() => handleDeleteComment(post.id, comment.id, comment.userId)}
                                        title="Delete comment"
                                      >
                                        <FaTrash />
                                      </button>
                                    )}
                                  </div>
                                  <p className="comment-text">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="comment-placeholder">
                              <p>No comments yet. Be the first to comment!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Sidebar with Ranked Users */}
            <div className="community-sidebar">
              {/* Ranked Users List */}
              <motion.div 
                className="users-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="section-header">
                  <h2>Top Runners</h2>
                  <FaRunning className="section-icon" />
                </div>
                
                <div className="users-list">
                  {rankedUsers.map((user, index) => (
                    <div key={user.id} className="user-item">
                      <div className="user-rank">{index + 1}</div>
                      <div className="user-avatar-small">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} />
                        ) : (
                          <div className="default-avatar">{user.displayName?.charAt(0) || 'U'}</div>
                        )}
                      </div>
                      <div className="user-info">
                        <h4>{user.displayName || 'Anonymous User'}</h4>
                        <div className="user-stats">
                          <span>{user.totalDistance || 0} km</span>
                          <span>{user.totalRuns || 0} runs</span>
                        </div>
                      </div>
                    </div>
                  ))}
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