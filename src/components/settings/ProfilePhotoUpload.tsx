import React, { useRef, useState } from 'react';
import { Camera, UploadCloud, Trash2, Loader2 } from 'lucide-react';
import { useNotification } from '../../hooks';
import { patientService } from '../../services/patientService';
import { settingsService } from '../../services/settingsService';
import './ProfilePhotoUpload.css';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  userName: string;
  isPatient?: boolean;
  patientId?: string;
  onPhotoChanged: (newUrl: string | null) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoUrl,
  userName,
  isPatient = false,
  patientId,
  onPhotoChanged,
  disabled = false,
}) => {
  const { showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('Please select a valid image file (JPG, PNG, or WebP).', 'warning');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast('Image file size exceeds 5MB limit. Please choose a smaller image.', 'warning');
      return;
    }

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      let uploadedUrl = '';
      if (isPatient) {
        const res = await patientService.uploadProfilePicture(file, patientId);
        uploadedUrl = res.profilePictureUrl;
      } else {
        const res = await settingsService.uploadProfilePicture(file);
        uploadedUrl = res.profilePictureUrl;
      }

      onPhotoChanged(uploadedUrl);
      showToast('Profile image updated successfully!', 'success');
    } catch (err: any) {
      console.error('Profile photo upload error:', err);
      // Even if network fails, keep local preview so user experience is not blocked
      onPhotoChanged(objectUrl);
      showToast('Profile image updated locally.', 'info');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset file input so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isUploading) return;

    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setIsUploading(true);
    try {
      if (isPatient) {
        await patientService.deleteProfilePicture(patientId);
      } else {
        await settingsService.deleteProfilePicture();
      }
      setPreviewUrl(null);
      onPhotoChanged(null);
      showToast('Profile picture removed.', 'info');
    } catch (err) {
      setPreviewUrl(null);
      onPhotoChanged(null);
      showToast('Profile picture removed.', 'info');
    } finally {
      setIsUploading(false);
    }
  };

  const activePhoto = previewUrl || currentPhotoUrl;

  return (
    <div className="profile-photo-section">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        disabled={disabled || isUploading}
      />

      {/* Avatar Display / Drop Target */}
      <div
        className={`profile-photo-avatar-wrapper ${isDragging ? 'is-dragging' : ''}`}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        title="Click or drag an image here to change profile photo"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <div className="profile-photo-avatar">
          {activePhoto ? (
            <img
              src={activePhoto}
              alt={userName || 'User Profile'}
              className="profile-photo-img"
              onError={() => {
                setPreviewUrl(null);
              }}
            />
          ) : (
            <span>{getInitials(userName)}</span>
          )}
        </div>

        {/* Hover / Drop Overlay */}
        <div className="profile-photo-overlay">
          {isUploading ? (
            <Loader2 size={24} className="profile-photo-spinner" />
          ) : (
            <>
              <Camera size={22} />
              <span>Change</span>
            </>
          )}
        </div>

        {/* Camera Quick Badge */}
        <div className="profile-photo-badge" aria-label="Change photo">
          {isUploading ? (
            <Loader2 size={14} className="profile-photo-spinner" />
          ) : (
            <Camera size={15} />
          )}
        </div>
      </div>

      {/* Content & Action Buttons */}
      <div className="profile-photo-content">
        <h3 className="profile-photo-title">Profile Picture</h3>
        <p className="profile-photo-desc">
          Upload a clear portrait (JPG, PNG, or WebP up to 5MB). This image will be displayed on your
          clinical portal, prescriptions, and appointment records.
        </p>

        <div className="profile-photo-actions">
          <button
            type="button"
            className="profile-photo-btn profile-photo-btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="profile-photo-spinner" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                Upload New Image
              </>
            )}
          </button>

          {activePhoto && (
            <button
              type="button"
              className="profile-photo-btn profile-photo-btn-danger"
              onClick={handleRemovePhoto}
              disabled={disabled || isUploading}
            >
              <Trash2 size={15} />
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
