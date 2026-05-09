import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Share2, Copy, Eye, EyeOff, Upload, Trash2, Download, Type, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotepadEditor = ({ notepadId, onNavigate }) => {
  const { user } = useAuth();
  const [notepad, setNotepad] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fontFamily, setFontFamily] = useState('font-mono');
  const [fontSize, setFontSize] = useState('text-sm');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadNotepad();
  }, [notepadId]);

  const loadNotepad = () => {
    // Check if it's a guest notepad first
    const guestNotepad = localStorage.getItem('guestNotepad');
    if (guestNotepad && !user) {
      const guest = JSON.parse(guestNotepad);
      setNotepad(guest);
      setTitle(guest.title);
      setContent(guest.content);
      setIsPublic(guest.isPublic);
      setImages(guest.images || []);
      setFontFamily(guest.fontFamily || 'font-mono');
      setFontSize(guest.fontSize || 'text-sm');
      return;
    }

    const allNotepads = JSON.parse(localStorage.getItem('notepads') || '[]');
    const found = allNotepads.find(n => n.id === parseInt(notepadId));
    
    if (found) {
      setNotepad(found);
      setTitle(found.title);
      setContent(found.content);
      setIsPublic(found.isPublic);
      setImages(found.images || []);
      setFontFamily(found.fontFamily || 'font-mono');
      setFontSize(found.fontSize || 'text-sm');
    }
  };

  const saveNotepad = async () => {
    if (!user) {
      alert('Please login to save changes');
      return;
    }

    setIsSaving(true);
    
    const allNotepads = JSON.parse(localStorage.getItem('notepads') || '[]');
    
    if (notepad) {
      // Update existing notepad
      const updatedNotepads = allNotepads.map(n => 
        n.id === notepad.id 
          ? { ...n, title, content, isPublic, images, fontFamily, fontSize, updatedAt: new Date().toISOString() }
          : n
      );
      localStorage.setItem('notepads', JSON.stringify(updatedNotepads));
    }
    
    setLastSaved(new Date());
    setIsSaving(false);
    
    // Show success message
    setTimeout(() => setLastSaved(null), 3000);
  };

  const copyShareCode = () => {
    if (notepad && notepad.code) {
      navigator.clipboard.writeText(notepad.code);
      alert('Share code copied to clipboard!');
    }
  };

  const togglePublic = async () => {
    if (!user) {
      alert('Please login to change visibility');
      return;
    }
    
    const newPublicState = !isPublic;
    setIsPublic(newPublicState);
    
    const allNotepads = JSON.parse(localStorage.getItem('notepads') || '[]');
    const updatedNotepads = allNotepads.map(n => 
      n.id === notepad.id 
        ? { ...n, isPublic: newPublicState }
        : n
    );
    localStorage.setItem('notepads', JSON.stringify(updatedNotepads));
  };

  const handleImageUpload = (e) => {
    if (!user) {
      alert('Please login to upload images');
      return;
    }

    const files = Array.from(e.target.files);
    setUploading(true);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = {
          id: Date.now() + Math.random(),
          src: event.target.result,
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString()
        };
        setImages(prev => [...prev, imageData]);
      };
      reader.readAsDataURL(file);
    });

    setUploading(false);
    e.target.value = '';
  };

  const deleteImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const downloadImage = (image) => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = image.name || 'image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!notepad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">Notepad not found</p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto flex-wrap">
            <button
              onClick={() => user ? onNavigate('dashboard') : onNavigate('home')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            <div className="flex items-center space-x-2 min-w-0">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg sm:text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 min-w-0 truncate"
                placeholder="Untitled Notepad"
                disabled={!user}
              />
              {notepad.code && (
                <span className="text-xs sm:text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                  {notepad.code}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto flex-wrap justify-end">
            {lastSaved && (
              <span className="text-xs sm:text-sm text-green-600 whitespace-nowrap">
                Saved at {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            {user && (
              <>
                <button
                  onClick={togglePublic}
                  className={`flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    isPublic 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isPublic ? 'Public' : 'Private'}</span>
                </button>

                {isPublic && (
                  <button
                    onClick={copyShareCode}
                    className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                )}

                <button
                  onClick={saveNotepad}
                  disabled={isSaving}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                
                {/* Font Controls */}
                {user && (
                  <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                    <Type className="h-4 w-4 text-gray-600" />
                    
                    {/* Font Family Dropdown */}
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="font-mono">Mono</option>
                      <option value="font-sans">Sans</option>
                      <option value="font-serif">Serif</option>
                    </select>
                    
                    {/* Font Size Dropdown */}
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text-xs">XS</option>
                      <option value="text-sm">Small</option>
                      <option value="text-base">Medium</option>
                      <option value="text-lg">Large</option>
                      <option value="text-xl">XL</option>
                    </select>
                  </div>
                )}
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={user ? "Start writing your notes..." : "You can view this notepad but need to login to edit it."}
                className={`w-full h-64 sm:h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${fontFamily} ${fontSize} leading-relaxed`}
                disabled={!user}
              />
              
              {!user && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm sm:text-base text-yellow-800">
                    You are viewing this notepad as a guest. 
                    <button
                      onClick={() => onNavigate('login')}
                      className="ml-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      Login
                    </button>
                    {' '}or{' '}
                    <button
                      onClick={() => onNavigate('signup')}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Sign up
                    </button>
                    {' '}to create your own copy and make changes.
                  </p>
                </div>
              )}
            </div>

            {/* Photos Section */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Photos</h2>
              
              {/* Upload Area - Only for logged-in users */}
              {user && (
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-gray-700">Upload Photos</p>
                      <p className="text-xs text-gray-500">Click or drag to upload</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Guest Upload Notice */}
              {!user && images.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-yellow-800">
                    <button
                      onClick={() => onNavigate('login')}
                      className="text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      Login
                    </button>
                    {' '}to upload photos
                  </p>
                </div>
              )}

              {/* Image Gallery */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {images.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-8">
                    {user ? 'No photos yet. Upload some to get started!' : 'No photos attached'}
                  </p>
                ) : (
                  images.map(image => (
                    <div key={image.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative cursor-pointer group" onClick={() => setSelectedImage(image)}>
                        <img
                          src={image.src}
                          alt={image.name}
                          className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                          {!user && (
                            <div className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view
                            </div>
                          )}
                          {user && (
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadImage(image);
                                }}
                                className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteImage(image.id);
                                }}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-900 truncate">{image.name}</p>
                        <p className="text-xs text-gray-500">{(image.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {images.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <span className="font-semibold">{images.length}</span> photo{images.length !== 1 ? 's' : ''} attached
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-96 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image Container */}
            <div className="flex items-center justify-center h-full">
              <img
                src={selectedImage.src}
                alt={selectedImage.name}
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            </div>

            {/* Image Details */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <h3 className="font-semibold text-gray-900">{selectedImage.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Size: {(selectedImage.size / 1024).toFixed(1)} KB • 
                Uploaded: {new Date(selectedImage.uploadedAt).toLocaleDateString()}
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => downloadImage(selectedImage)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                {user && (
                  <button
                    onClick={() => {
                      deleteImage(selectedImage.id);
                      setSelectedImage(null);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotepadEditor;