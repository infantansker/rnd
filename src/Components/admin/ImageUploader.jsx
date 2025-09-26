import React, { useState } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ onImageSelect }) => {
    const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setImageUrl(url);
        setPreview(url);
        onImageSelect({ url });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            onImageSelect({ file });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            onImageSelect({ file });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className="image-uploader">
            <div className="upload-tabs">
                <button
                    className={uploadType === 'url' ? 'active' : ''}
                    onClick={() => setUploadType('url')}
                >
                    Image URL
                </button>
                <button
                    className={uploadType === 'file' ? 'active' : ''}
                    onClick={() => setUploadType('file')}
                >
                    Upload File
                </button>
            </div>

            {uploadType === 'url' ? (
                <div className="upload-section">
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={handleUrlChange}
                        placeholder="Enter Image URL"
                    />
                </div>
            ) : (
                <div
                    className="upload-section drop-zone"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        id="file-upload"
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" className="file-label">
                        Drag & drop an image or click to select a file
                    </label>
                </div>
            )}

            {preview && (
                <div className="image-preview">
                    <img src={preview} alt="Preview" />
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
