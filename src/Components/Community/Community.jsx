import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaComment, FaPlus, FaImage, FaRunning, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { auth, db, storage } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, addDoc, updateDoc, doc, increment, serverTimestamp, where, getDocs, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DashboardNav from '../DashboardNav/DashboardNav';
import ConfirmDialog from './ConfirmDialog';
import Notification from '../Notification/Notification';
import { parseMentions, processMentionsForStorage, sendMentionNotifications } from './mentionUtils';
import './Community.css';
import './Mention.css';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [mentionSuggestions, setMentionSuggestions] = useState([]); // Added for mention suggestions
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false); // Added for mention suggestions
  const [mentionTriggerIndex, setMentionTriggerIndex] = useState(-1); // Added for mention suggestions
  const [activeMentionIndex, setActiveMentionIndex] = useState(0); // Added for mention suggestions

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
      // Process mentions in the comment content
      const { processedText, mentionUserIds } = processMentionsForStorage(commentText, rankedUsers);
      
      // Add comment to the post's comments subcollection
      const commentDoc = await addDoc(collection(db, 'communityPosts', postId, 'comments'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous User',
        userPhoto: currentUser.photoURL || '/redlogo.png',
        content: processedText,
        mentionUserIds: mentionUserIds, // Add mention user IDs
        createdAt: serverTimestamp()
      });
      
      // Send notifications to mentioned users
      await sendMentionNotifications(commentText, rankedUsers, currentUser, 'comment', postId, commentDoc.id);
      
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

  // Function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // Function to close notifications
  const closeNotification = () => {
    setNotification(null);
  };

  // Function to delete a comment
  const handleDeleteComment = async (postId, commentId, commentUserId) => {
    // Check if the current user is the owner of the comment
    if (!currentUser || currentUser.uid !== commentUserId) {
      showNotification('You can only delete your own comments', 'error');
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
      showNotification('Failed to delete comment. Please try again.', 'error');
    }
  };

  // Function to delete a post
  const handleDeletePost = async (postId, postUserId) => {
    // Check if the current user is the owner of the post
    if (!currentUser || currentUser.uid !== postUserId) {
      showNotification('You can only delete your own posts', 'error');
      return;
    }
    
    // Show confirmation dialog
    setShowDeleteConfirm({
      postId,
      message: 'Are you sure you want to delete this post? This action cannot be undone.'
    });
  };

  // Function to confirm post deletion
  const confirmDeletePost = async () => {
    if (!showDeleteConfirm) return;
    
    const { postId } = showDeleteConfirm;
    
    try {
      // Delete the post document
      await deleteDoc(doc(db, 'communityPosts', postId));
      // Close the confirmation dialog
      setShowDeleteConfirm(null);
      // Show success notification
      showNotification('Post deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting post:', error);
      // Close the confirmation dialog
      setShowDeleteConfirm(null);
      // Show error notification
      showNotification('Failed to delete post. Please try again.', 'error');
    }
  };

  // Function to cancel post deletion
  const cancelDeletePost = () => {
    setShowDeleteConfirm(null);
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
      
      // Process mentions in the post content
      const { processedText, mentionUserIds } = processMentionsForStorage(newPostContent, rankedUsers);
      
      // Create new post
      const newPost = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous User',
        userPhoto: currentUser.photoURL || '/redlogo.png',
        userLevel: 'Beginner', // This would come from user data in a real app
        content: processedText,
        image: imageUrl,
        likes: 0,
        comments: 0,
        // Removed shares field
        likedBy: [], // Initialize as empty array
        mentionUserIds: mentionUserIds, // Add mention user IDs
        createdAt: serverTimestamp(),
        timestamp: new Date().toLocaleString()
      };
      
      // Add the post to Firestore
      const postDoc = await addDoc(collection(db, 'communityPosts'), newPost);
      
      // Send notifications to mentioned users
      await sendMentionNotifications(newPostContent, rankedUsers, currentUser, 'post', postDoc.id);
      
      setNewPostContent('');
      setNewPostImage(null);
      setShowNewPostForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Function to handle mention suggestions in post input
  const handlePostContentChange = (e) => {
    const value = e.target.value;
    setNewPostContent(value);
    
    // Check for mention trigger (@)
    const textBeforeCursor = value.substring(0, e.target.selectionStart);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1 && (lastAtIndex === 0 || /\s/.test(textBeforeCursor[lastAtIndex - 1]))) {
      const query = textBeforeCursor.substring(lastAtIndex + 1);
      if (query.length > 0) {
        const filteredUsers = rankedUsers.filter(user => 
          user.displayName && user.displayName.toLowerCase().startsWith(query.toLowerCase())
        );
        setMentionSuggestions(filteredUsers.slice(0, 5)); // Show max 5 suggestions
        setShowMentionSuggestions(true);
        setMentionTriggerIndex(lastAtIndex);
        setActiveMentionIndex(0);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  // Function to handle mention suggestions in comment input
  const handleCommentChangeWithMentions = (postId, text) => {
    setNewComment(prev => ({
      ...prev,
      [postId]: text
    }));
    
    // Check for mention trigger (@)
    const textBeforeCursor = text;
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1 && (lastAtIndex === 0 || /\s/.test(textBeforeCursor[lastAtIndex - 1]))) {
      const query = textBeforeCursor.substring(lastAtIndex + 1);
      if (query.length > 0) {
        const filteredUsers = rankedUsers.filter(user => 
          user.displayName && user.displayName.toLowerCase().startsWith(query.toLowerCase())
        );
        setMentionSuggestions(filteredUsers.slice(0, 5)); // Show max 5 suggestions
        setShowMentionSuggestions(true);
        setMentionTriggerIndex(lastAtIndex);
        setActiveMentionIndex(0);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  // Function to select a mention from suggestions
  const selectMention = (username, inputType, postId = null) => {
    if (inputType === 'post') {
      const beforeMention = newPostContent.substring(0, mentionTriggerIndex);
      const afterMention = newPostContent.substring(mentionTriggerIndex + 1 + (newPostContent.substring(mentionTriggerIndex + 1).indexOf(' ') !== -1 ? 
        newPostContent.substring(mentionTriggerIndex + 1).indexOf(' ') : newPostContent.length));
      
      const newText = beforeMention + '@' + username + ' ' + afterMention;
      setNewPostContent(newText);
    } else if (inputType === 'comment' && postId) {
      const commentText = newComment[postId] || '';
      const beforeMention = commentText.substring(0, mentionTriggerIndex);
      const afterMention = commentText.substring(mentionTriggerIndex + 1 + (commentText.substring(mentionTriggerIndex + 1).indexOf(' ') !== -1 ? 
        commentText.substring(mentionTriggerIndex + 1).indexOf(' ') : commentText.length));
      
      const newText = beforeMention + '@' + username + ' ' + afterMention;
      setNewComment(prev => ({
        ...prev,
        [postId]: newText
      }));
    }
    
    setShowMentionSuggestions(false);
    setMentionSuggestions([]);
  };

  // Function to handle key events for mention suggestions
  const handleMentionKeyDown = (e, inputType, postId = null) => {
    if (!showMentionSuggestions) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveMentionIndex(prev => Math.min(prev + 1, mentionSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveMentionIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (mentionSuggestions.length > 0) {
        selectMention(mentionSuggestions[activeMentionIndex].displayName, inputType, postId);
      }
    } else if (e.key === 'Escape') {
      setShowMentionSuggestions(false);
      setMentionSuggestions([]);
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
      {/* Add Notification component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      {/* Add ConfirmDialog component */}
      {showDeleteConfirm && (
        <ConfirmDialog
          message={showDeleteConfirm.message}
          onConfirm={confirmDeletePost}
          onCancel={cancelDeletePost}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
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
                      onChange={handlePostContentChange}
                      onKeyDown={(e) => handleMentionKeyDown(e, 'post')}
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
                      <div className="post-header-actions">
                        <span className="post-timestamp">{post.timestamp}</span>
                        {/* Delete button for post owner */}
                        {currentUser && currentUser.uid === post.userId && (
                          <button 
                            className="delete-post-btn"
                            onClick={() => handleDeletePost(post.id, post.userId)}
                            title="Delete post"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="post-content">
                      <p>{parseMentions(post.content, rankedUsers)}</p>
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
                              onChange={(e) => handleCommentChangeWithMentions(post.id, e.target.value)}
                              onKeyDown={(e) => handleMentionKeyDown(e, 'comment', post.id)}
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
                          {/* Mention suggestions */}
                          {showMentionSuggestions && mentionSuggestions.length > 0 && (
                            <div className="mention-suggestions">
                              {mentionSuggestions.map((user, index) => (
                                <div 
                                  key={user.id}
                                  className={`mention-suggestion ${index === activeMentionIndex ? 'active' : ''}`}
                                  onClick={() => selectMention(user.displayName, 'comment', post.id)}
                                >
                                  <img src={user.photoURL || '/redlogo.png'} alt={user.displayName} className="mention-avatar" />
                                  <span>{user.displayName}</span>
                                </div>
                              ))}
                            </div>
                          )}
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
                                  <p className="comment-text">{parseMentions(comment.content, rankedUsers)}</p>
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