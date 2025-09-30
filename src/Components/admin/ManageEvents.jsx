import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import firebaseService from '../../services/firebaseService';
import ImageUploader from './ImageUploader';
import './ManageEvents.css';

const ManageEvents = () => {
    const [upcomingEvent, setUpcomingEvent] = useState({
        name: '',
        date: '',
        description: '',
        location: '',
        imageUrl: ''
    });
    const [upcomingImageFile, setUpcomingImageFile] = useState(null);

    const [pastEvent, setPastEvent] = useState({
        name: '',
        date: '',
        description: '',
        location: '',
        imageUrl: ''
    });
    const [pastImageFile, setPastImageFile] = useState(null);

    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingImageFile, setEditingImageFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const upcoming = await firebaseService.getUpcomingEvents();
        const past = await firebaseService.getPastEvents();
        setUpcomingEvents(upcoming);
        setPastEvents(past);
    };

    const handleUpcomingChange = (e) => {
        setUpcomingEvent({ ...upcomingEvent, [e.target.name]: e.target.value });
    };

    const handlePastChange = (e) => {
        setPastEvent({ ...pastEvent, [e.target.name]: e.target.value });
    };

    const handleUpcomingImageSelect = (image) => {
        if (image.file) {
            setUpcomingImageFile(image.file);
        } else if (image.url) {
            setUpcomingEvent({ ...upcomingEvent, imageUrl: image.url });
        }
    };

    const handlePastImageSelect = (image) => {
        if (image.file) {
            setPastImageFile(image.file);
        } else if (image.url) {
            setPastEvent({ ...pastEvent, imageUrl: image.url });
        }
    };
    
    const handleEditingImageSelect = (image) => {
        if (image.file) {
            setEditingImageFile(image.file);
        } else if (image.url) {
            setEditingEvent({ ...editingEvent, imageUrl: image.url });
        }
    };

    const handleUpcomingSubmit = async (e) => {
        e.preventDefault();
        if (!upcomingEvent.name || !upcomingEvent.date) {
            alert('Please fill out at least the name and date for the upcoming event.');
            return;
        }
        try {
            let finalImageUrl = upcomingEvent.imageUrl || '';
            if (upcomingImageFile) {
                finalImageUrl = await firebaseService.uploadImage(upcomingImageFile, 'events');
            }

            const eventData = { ...upcomingEvent, imageUrl: finalImageUrl };
            await addDoc(collection(db, 'upcomingEvents'), eventData);

            alert('🎉 Groovy! Upcoming event added successfully! 🕺');
            setUpcomingEvent({ name: '', date: '', description: '', location: '', imageUrl: '' });
            setUpcomingImageFile(null);
            fetchEvents();
        } catch (error) {
            console.error('Error adding upcoming event: ', error);
            alert('Failed to add upcoming event.');
        }
    };

    const handlePastSubmit = async (e) => {
        e.preventDefault();
        if (!pastEvent.name || !pastEvent.date) {
            alert('Please fill out at least the name and date for the past event.');
            return;
        }
        if (!pastImageFile && !pastEvent.imageUrl) {
            alert('Please provide an image URL or upload an image for the past event.');
            return;
        }

        try {
            let finalImageUrl = pastEvent.imageUrl;
            if (pastImageFile) {
                finalImageUrl = await firebaseService.uploadImage(pastImageFile, 'events');
            }

            const dataToUpload = { ...pastEvent, imageUrl: finalImageUrl };
            await addDoc(collection(db, 'pastEvents'), dataToUpload);

            alert('🚀 Awesome! Past event archived successfully! 📚');
            setPastEvent({ name: '', date: '', description: '', location: '', imageUrl: '' });
            setPastImageFile(null);
            fetchEvents();
        } catch (error) {
            console.error('Error adding past event: ', error);
            alert('Failed to add past event.');
        }
    };

    const handleDeleteUpcoming = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this upcoming event?')) {
            try {
                await firebaseService.deleteUpcomingEvent(eventId);
                alert('Upcoming event deleted successfully!');
                fetchEvents();
            } catch (error) {
                console.error('Error deleting upcoming event: ', error);
                alert('Failed to delete upcoming event.');
            }
        }
    };

    const handleDeletePast = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this past event?')) {
            try {
                await firebaseService.deletePastEvent(eventId);
                alert('Past event deleted successfully!');
                fetchEvents();
            } catch (error) {
                console.error('Error deleting past event: ', error);
                alert('Failed to delete past event.');
            }
        }
    };

    const handleEdit = (event, type) => {
        setEditingEvent({ ...event, type });
        setIsEditing(true);
        setEditingImageFile(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const { type, id, ...data } = editingEvent;
        
        try {
            let finalImageUrl = editingEvent.imageUrl;
            if (editingImageFile) {
                finalImageUrl = await firebaseService.uploadImage(editingImageFile, 'events');
            }

            const updatedData = { ...data, imageUrl: finalImageUrl };

            if (type === 'upcoming') {
                await firebaseService.updateUpcomingEvent(id, updatedData);
            } else {
                await firebaseService.updatePastEvent(id, updatedData);
            }
            alert('Event updated successfully!');
            setIsEditing(false);
            setEditingEvent(null);
            setEditingImageFile(null);
            fetchEvents();
        } catch (error) {
            console.error('Error updating event: ', error);
            alert('Failed to update event.');
        }
    };

    return (
        <div className="manage-events">
            <h2>Manage Events</h2>
            <div className="event-forms">
                <div className="form-container">
                    <h3>Add Upcoming Event</h3>
                    <form onSubmit={handleUpcomingSubmit}>
                        <input type="text" name="name" value={upcomingEvent.name} onChange={handleUpcomingChange} placeholder="Event Name" required />
                        <input type="date" name="date" value={upcomingEvent.date} onChange={handleUpcomingChange} required />
                        <textarea name="description" value={upcomingEvent.description} onChange={handleUpcomingChange} placeholder="Description"></textarea>
                        <input type="text" name="location" value={upcomingEvent.location} onChange={handleUpcomingChange} placeholder="Location" />
                        <ImageUploader onImageSelect={handleUpcomingImageSelect} />
                        <button type="submit">Add Upcoming Event</button>
                    </form>
                </div>
                <div className="form-container">
                    <h3>Add Past Event</h3>
                    <form onSubmit={handlePastSubmit}>
                        <input type="text" name="name" value={pastEvent.name} onChange={handlePastChange} placeholder="Event Name" required />
                        <input type="date" name="date" value={pastEvent.date} onChange={handlePastChange} required />
                        <textarea name="description" value={pastEvent.description} onChange={handlePastChange} placeholder="Description"></textarea>
                        <input type="text" name="location" value={pastEvent.location} onChange={handlePastChange} placeholder="Location" />
                        <ImageUploader onImageSelect={handlePastImageSelect} />
                        <button type="submit">Add Past Event</button>
                    </form>
                </div>
            </div>

            <div className="events-list">
                <h3>Upcoming Events</h3>
                <ul>
                    {upcomingEvents.map(event => (
                        event && <li key={event.id}>
                            {event.name} - {event.date}
                            {event.imageUrl && <img src={event.imageUrl} alt={event.name} style={{ width: '50px', height: '50px', objectFit: 'cover', marginLeft: '10px' }} />}
                            <button onClick={() => handleEdit(event, 'upcoming')}>Edit</button>
                            <button onClick={() => handleDeleteUpcoming(event.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="events-list">
                <h3>Past Events</h3>
                <ul>
                    {pastEvents.map(event => (
                        event && <li key={event.id}>
                            {event.name} - {event.date}
                            {event.imageUrl && <img src={event.imageUrl} alt={event.name} style={{ width: '50px', height: '50px', objectFit: 'cover', marginLeft: '10px' }} />}
                            <button onClick={() => handleEdit(event, 'past')}>Edit</button>
                            <button onClick={() => handleDeletePast(event.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>

            {isEditing && editingEvent && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Edit Event</h3>
                        <form onSubmit={handleUpdate}>
                            <input type="text" name="name" value={editingEvent.name} onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })} placeholder="Event Name" required />
                            <input type="date" name="date" value={editingEvent.date} onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })} required />
                            <textarea name="description" value={editingEvent.description} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} placeholder="Description"></textarea>
                            <input type="text" name="location" value={editingEvent.location} onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })} placeholder="Location" />
                            <label>Current Image:</label>
                            {editingEvent.imageUrl && <img src={editingEvent.imageUrl} alt="Current" style={{ width: '100px', height: 'auto', display: 'block', margin: '10px 0' }} />}
                            <ImageUploader onImageSelect={handleEditingImageSelect} />
                            <button type="submit">Update Event</button>
                            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageEvents;
