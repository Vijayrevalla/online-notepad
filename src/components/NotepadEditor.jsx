import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  ArrowLeft, 
  Share2, 
  Copy, 
  Eye, 
  EyeOff, 
  Upload, 
  Trash2, 
  Download, 
  Type, 
  X, 
  Sun, 
  Moon,
  FileText,
  FolderOpen,
  Printer,
  Undo,
  Redo,
  Scissors,
  Clipboard,
  CheckSquare,
  Search,
  SpellCheck,
  BarChart2,
  Maximize2,
  Minimize2,
  Calendar,
  Image as ImageIcon,
  HelpCircle,
  Clock,
  Sparkles,
  Wand2,
  Settings,
  Globe,
  RefreshCw,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const NotepadEditor = ({ notepadId, onNavigate }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  
  const [notepad, setNotepad] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Advanced Editor States
  const [activeMenu, setActiveMenu] = useState(null); // 'file' | 'edit' | 'insert' | 'view' | 'help' | null
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchIndices, setMatchIndices] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [spellcheckEnabled, setSpellcheckEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPhotosSidebar, setShowPhotosSidebar] = useState(true);
  
  // Custom Select states
  const [fontFamilyDropdownOpen, setFontFamilyDropdownOpen] = useState(false);
  const [fontSizeDropdownOpen, setFontSizeDropdownOpen] = useState(false);

  // Font styling states (Bold, Italic, Underline)
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Ref-based History stack for robust Undo/Redo
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isProgrammaticChange = useRef(false);
  const debounceTimer = useRef(null);

  // AI Assist States
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const [showAiKeyModal, setShowAiKeyModal] = useState(false);
  const [aiKey, setAiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [tempAiKey, setTempAiKey] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Modal states
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const fontOptions = [
    { name: 'Andale Mono', css: 'Andale Mono, monospace' },
    { name: 'Arial', css: 'Arial, sans-serif' },
    { name: 'Arial Black', css: 'Arial Black, sans-serif' },
    { name: 'Book Antiqua', css: 'Book Antiqua, serif' },
    { name: 'Comic Sans MS', css: 'Comic Sans MS, cursive' },
    { name: 'Courier New', css: 'Courier New, monospace' },
    { name: 'Georgia', css: 'Georgia, serif' },
    { name: 'Helvetica', css: 'Helvetica, sans-serif' },
    { name: 'Impact', css: 'Impact, Charcoal, sans-serif' },
    { name: 'Symbol', css: 'Symbol, sans-serif' },
    { name: 'Tahoma', css: 'Tahoma, sans-serif' },
    { name: 'Terminal', css: 'Terminal, monospace' },
    { name: 'Times New Roman', css: 'Times New Roman, serif' },
    { name: 'Trebuchet MS', css: 'Trebuchet MS, sans-serif' },
    { name: 'Verdana', css: 'Verdana, sans-serif' }
  ];

  const fontSizes = ['10pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '30pt', '36pt', '48pt'];

  const [selectedFont, setSelectedFont] = useState(fontOptions[6]); // Default: Georgia
  const [selectedFontSize, setSelectedFontSize] = useState('14pt'); // Default: 14pt

  // Helper: map old font family database values to fontOptions
  const mapFontFamily = (value) => {
    if (!value) return fontOptions[6];
    
    let fontName = '';
    if (typeof value === 'object' && value.name) {
      fontName = value.name;
    } else if (typeof value === 'string') {
      fontName = value;
    } else {
      return fontOptions[6];
    }
    
    if (fontName === 'font-mono' || fontName.toLowerCase().includes('mono')) return fontOptions[5]; // Courier New
    if (fontName === 'font-sans' || fontName.toLowerCase().includes('sans')) return fontOptions[1]; // Arial
    if (fontName === 'font-serif' || fontName.toLowerCase().includes('serif')) return fontOptions[12]; // Times New Roman
    
    const found = fontOptions.find(f => f.name.toLowerCase() === fontName.toLowerCase() || f.css.toLowerCase().includes(fontName.toLowerCase()));
    return found || fontOptions[6];
  };

  // Helper: map old font size database values to standard pt sizes
  const mapFontSize = (value) => {
    if (!value) return '14pt';
    
    let sizeStr = '';
    if (typeof value === 'object' && value.size) {
      sizeStr = value.size;
    } else if (typeof value === 'string') {
      sizeStr = value;
    } else {
      return '14pt';
    }
    
    if (sizeStr === 'text-xs') return '10pt';
    if (sizeStr === 'text-sm') return '12pt';
    if (sizeStr === 'text-base') return '14pt';
    if (sizeStr === 'text-lg') return '18pt';
    if (sizeStr === 'text-xl') return '20pt';
    if (sizeStr === 'text-2xl') return '24pt';
    
    if (sizeStr.includes('pt') || sizeStr.includes('px')) return sizeStr;
    return '14pt';
  };

  // Click outside to close custom select panels and dropdown menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-bar-wrapper')) {
        setActiveMenu(null);
      }
      if (!event.target.closest('.font-family-select-wrapper')) {
        setFontFamilyDropdownOpen(false);
      }
      if (!event.target.closest('.font-size-select-wrapper')) {
        setFontSizeDropdownOpen(false);
      }
      if (!event.target.closest('.ai-assist-select-wrapper')) {
        setAiDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadNotepad();
  }, [notepadId, user]);

  // Sync ref history when notepad finishes loading
  useEffect(() => {
    if (notepad) {
      historyRef.current = [{ content: notepad.content || '', title: notepad.title || '' }];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [notepadId, notepad === null]);

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
      
      setSelectedFont(mapFontFamily(guest.fontFamily));
      setSelectedFontSize(mapFontSize(guest.fontSize));
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
      
      setSelectedFont(mapFontFamily(found.fontFamily));
      setSelectedFontSize(mapFontSize(found.fontSize));
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
      const updatedNotepads = allNotepads.map(n => 
        n.id === notepad.id 
          ? { 
              ...n, 
              title, 
              content, 
              isPublic, 
              images, 
              fontFamily: selectedFont.name, 
              fontSize: selectedFontSize, 
              updatedAt: new Date().toISOString() 
            }
          : n
      );
      localStorage.setItem('notepads', JSON.stringify(updatedNotepads));
    }
    
    setLastSaved(new Date());
    setIsSaving(false);
    
    setTimeout(() => setLastSaved(null), 3000);
  };

  const generateUniqueCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
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

  // Undo / Redo mechanics using refs
  const pushToHistory = (newContent, newTitle) => {
    if (isProgrammaticChange.current) return;
    
    const hist = historyRef.current;
    const index = historyIndexRef.current;
    
    // Slice off any redo states
    const sliced = hist.slice(0, index + 1);
    
    // Don't push duplicates of the active top state
    const lastState = sliced[sliced.length - 1];
    if (lastState && lastState.content === newContent && lastState.title === newTitle) {
      return;
    }
    
    sliced.push({ content: newContent, title: newTitle });
    historyRef.current = sliced;
    historyIndexRef.current = sliced.length - 1;
    
    setCanUndo(sliced.length > 1);
    setCanRedo(false);
  };

  const handleUndo = () => {
    const hist = historyRef.current;
    const index = historyIndexRef.current;
    
    if (index > 0) {
      isProgrammaticChange.current = true;
      const prevIndex = index - 1;
      historyIndexRef.current = prevIndex;
      
      const state = hist[prevIndex];
      setContent(state.content);
      setTitle(state.title);
      
      setCanUndo(prevIndex > 0);
      setCanRedo(true);
      
      setTimeout(() => { isProgrammaticChange.current = false; }, 50);
    }
  };

  const handleRedo = () => {
    const hist = historyRef.current;
    const index = historyIndexRef.current;
    
    if (index < hist.length - 1) {
      isProgrammaticChange.current = true;
      const nextIndex = index + 1;
      historyIndexRef.current = nextIndex;
      
      const state = hist[nextIndex];
      setContent(state.content);
      setTitle(state.title);
      
      setCanUndo(true);
      setCanRedo(nextIndex < hist.length - 1);
      
      setTimeout(() => { isProgrammaticChange.current = false; }, 50);
    }
  };

  const updateContent = (newVal) => {
    setContent(newVal);
    if (isProgrammaticChange.current) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      pushToHistory(newVal, title);
    }, 400);
  };

  const updateTitle = (newVal) => {
    setTitle(newVal);
    if (isProgrammaticChange.current) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      pushToHistory(content, newVal);
    }, 400);
  };

  // Clipboard commands
  const handleCut = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = content.substring(start, end);
      if (!selected) return;
      navigator.clipboard.writeText(selected);
      const newContent = content.substring(0, start) + content.substring(end);
      updateContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start);
      }, 50);
    }
  };

  const handleCopy = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = content.substring(start, end);
      if (!selected) return;
      navigator.clipboard.writeText(selected);
    }
  };

  const handlePaste = async () => {
    const textarea = textareaRef.current;
    if (textarea) {
      try {
        const text = await navigator.clipboard.readText();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + text + content.substring(end);
        updateContent(newContent);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + text.length, start + text.length);
        }, 50);
      } catch (err) {
        alert('Clipboard access blocked by browser. Please use Ctrl+V shortcut.');
      }
    }
  };

  const handleSelectAll = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.select();
    }
  };

  // Find & Replace
  const performFind = (query = findText, dir = 'next') => {
    if (!query) {
      setMatchIndices([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const indices = [];
    let idx = content.toLowerCase().indexOf(query.toLowerCase());
    while (idx !== -1) {
      indices.push(idx);
      idx = content.toLowerCase().indexOf(query.toLowerCase(), idx + 1);
    }

    setMatchIndices(indices);

    if (indices.length === 0) {
      setCurrentMatchIndex(-1);
      return;
    }

    let nextMatchIndex = 0;
    if (currentMatchIndex !== -1) {
      if (dir === 'next') {
        nextMatchIndex = (currentMatchIndex + 1) % indices.length;
      } else {
        nextMatchIndex = (currentMatchIndex - 1 + indices.length) % indices.length;
      }
    }

    setCurrentMatchIndex(nextMatchIndex);
    highlightMatch(indices[nextMatchIndex], query.length);
  };

  const highlightMatch = (startIndex, length) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(startIndex, startIndex + length);
      
      const lines = content.substring(0, startIndex).split('\n');
      const lineNum = lines.length;
      const lineHeight = parseInt(selectedFontSize) || 16;
      textarea.scrollTop = (lineNum - 3) * lineHeight;
    }
  };

  const handleReplace = () => {
    if (currentMatchIndex === -1 || matchIndices.length === 0) return;
    const startIndex = matchIndices[currentMatchIndex];
    const matchLength = findText.length;
    
    const before = content.substring(0, startIndex);
    const after = content.substring(startIndex + matchLength);
    const newContent = before + replaceText + after;
    
    updateContent(newContent);
    
    setTimeout(() => {
      performFind(findText);
    }, 100);
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const escapedQuery = findText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'gi');
    const newContent = content.replace(regex, replaceText);
    updateContent(newContent);
    setMatchIndices([]);
    setCurrentMatchIndex(-1);
    alert('All occurrences replaced.');
  };

  // Insert Operations
  const handleInsertDivider = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const dividerText = "\n--------------------------------------------------\n";
      const newContent = content.substring(0, start) + dividerText + content.substring(end);
      updateContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + dividerText.length, start + dividerText.length);
      }, 50);
    }
  };

  const handleInsertDateTime = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const timestamp = ` [${new Date().toLocaleString()}] `;
      const newContent = content.substring(0, start) + timestamp + content.substring(end);
      updateContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + timestamp.length, start + timestamp.length);
      }, 50);
    }
  };

  // File Operations (Local files loading from system)
  const handleNewDocument = () => {
    if (!user) {
      alert('Please login to create a new notepad');
      return;
    }
    const docTitle = prompt('Enter a title for the new document:', 'Untitled Notepad');
    if (docTitle === null) return;
    
    const allNotepads = JSON.parse(localStorage.getItem('notepads') || '[]');
    const newNotepad = {
      id: allNotepads.length + 1,
      title: docTitle.trim() || 'Untitled Notepad',
      content: '',
      code: generateUniqueCode(),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      isPublic: false
    };

    allNotepads.push(newNotepad);
    localStorage.setItem('notepads', JSON.stringify(allNotepads));
    onNavigate('notepad', newNotepad.id);
    setActiveMenu(null);
  };

  const handleSystemFileOpen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileText = event.target.result;
      const isJson = file.name.endsWith('.json');
      
      if (isJson) {
        try {
          const parsed = JSON.parse(fileText);
          if (parsed && typeof parsed === 'object') {
            setContent(parsed.content || '');
            setTitle(parsed.title || file.name.replace(/\.[^/.]+$/, ""));
            if (parsed.images) setImages(parsed.images);
            if (parsed.fontFamily) setSelectedFont(mapFontFamily(parsed.fontFamily));
            if (parsed.fontSize) setSelectedFontSize(mapFontSize(parsed.fontSize));
            
            pushToHistory(parsed.content || '', parsed.title || file.name.replace(/\.[^/.]+$/, ""));
            alert(`Loaded document "${parsed.title || file.name}"`);
            return;
          }
        } catch (err) {
          // fallback to text if JSON parsing fails
        }
      }
      
      setContent(fileText);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
      setTitle(cleanTitle);
      pushToHistory(fileText, cleanTitle);
      alert(`Loaded file "${file.name}" as text`);
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file picker
  };

  const saveAiKey = () => {
    if (!tempAiKey.trim()) {
      addToast('Please enter a valid API key', 'error');
      return;
    }
    localStorage.setItem('gemini_api_key', tempAiKey.trim());
    setAiKey(tempAiKey.trim());
    setTempAiKey('');
    setShowAiKeyModal(false);
    addToast('Gemini API key configured successfully! 🚀', 'success');
  };

  const useDemoMode = () => {
    localStorage.setItem('gemini_api_key', 'demo');
    setAiKey('demo');
    setTempAiKey('');
    setShowAiKeyModal(false);
    addToast('Running in AI Demo Mode. Real API calls are simulated.', 'info');
  };

  const clearAiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setAiKey('');
    setTempAiKey('');
    setShowAiKeyModal(false);
    addToast('AI Configuration cleared.', 'info');
  };

  const triggerAiEnhance = async (operation, targetLanguage = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;
    const textToEnhance = hasSelection ? content.substring(start, end) : content;

    if (!textToEnhance.trim()) {
      addToast('No text found to enhance!', 'error');
      return;
    }

    const keyToUse = aiKey || localStorage.getItem('gemini_api_key');
    if (!keyToUse) {
      setShowAiKeyModal(true);
      return;
    }

    try {
      setIsAiLoading(true);
      setAiDropdownOpen(false);

      let resultText = '';

      if (keyToUse === 'demo') {
        // Simulated / Demo mode
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (operation === 'improve') {
          resultText = `${textToEnhance} (enhanced and made much clearer)`;
        } else if (operation === 'grammar') {
          resultText = `${textToEnhance} (spelling & grammar checked)`;
        } else if (operation === 'professional') {
          resultText = `Professional rewrite: ${textToEnhance}`;
        } else if (operation === 'casual') {
          resultText = `Casual rewrite: ${textToEnhance}`;
        } else if (operation === 'summarize') {
          resultText = `SUMMARY:\n- Main concept: ${textToEnhance.substring(0, 100)}...`;
        } else if (operation === 'action') {
          resultText = `ACTION ITEMS:\n- [ ] Review: ${textToEnhance.substring(0, 100)}\n- [ ] Task completed`;
        } else if (operation === 'translate') {
          resultText = `[Translated to ${targetLanguage}]: ${textToEnhance}`;
        }
      } else {
        // Real Gemini API Call
        let systemPrompt = '';
        if (operation === 'improve') {
          systemPrompt = 'Improve the writing of the following text, making it clear, engaging, and polished. Do not add any introductory remarks, explanations, notes, or markdown formatting backticks. Return ONLY the polished text itself.';
        } else if (operation === 'grammar') {
          systemPrompt = 'Correct any spelling, punctuation, and grammatical errors in the following text. Do not add any explanation or notes. Return ONLY the corrected text.';
        } else if (operation === 'professional') {
          systemPrompt = 'Rewrite the following text in a professional, clear, and business-appropriate tone. Do not add any explanation or notes. Return ONLY the rewritten text.';
        } else if (operation === 'casual') {
          systemPrompt = 'Rewrite the following text in a friendly, casual, and conversational tone. Do not add any explanation or notes. Return ONLY the rewritten text.';
        } else if (operation === 'summarize') {
          systemPrompt = 'Provide a concise summary of the following text. Do not add any explanation or notes. Return ONLY the summary itself.';
        } else if (operation === 'action') {
          systemPrompt = 'Extract key action items and takeaways from the following text. Format them as a clean markdown task list (e.g. - [ ] task). Do not add any introductory remarks, notes, or explanations. Return ONLY the list.';
        } else if (operation === 'translate') {
          systemPrompt = `Translate the following text into ${targetLanguage}. Do not add any introductory remarks, notes, or explanations. Return ONLY the translated text.`;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${keyToUse}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nText:\n${textToEnhance}`
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Invalid response from AI model');
        }
        resultText = data.candidates[0].content.parts[0].text.trim();
      }

      let newContent = '';
      if (hasSelection) {
        newContent = content.substring(0, start) + resultText + content.substring(end);
      } else {
        newContent = resultText;
      }

      setContent(newContent);
      pushToHistory(newContent, title);
      addToast('Text enhanced successfully! ✨', 'success');

      // Keep selection or focus
      setTimeout(() => {
        textarea.focus();
        if (hasSelection) {
          textarea.setSelectionRange(start, start + resultText.length);
        } else {
          textarea.setSelectionRange(newContent.length, newContent.length);
        }
      }, 50);

    } catch (err) {
      console.error(err);
      addToast(`AI Error: ${err.message}`, 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    const photosMarkup = images.map(img => `
      <div style="margin-top: 25px; page-break-inside: avoid; text-align: center;">
        <img src="${img.src}" alt="${img.name}" style="max-width: 100%; max-height: 420px; border-radius: 6px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />
        <div style="font-size: 11px; color: #64748b; margin-top: 6px; font-family: sans-serif;">${img.name} (${(img.size / 1024).toFixed(1)} KB)</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${title || 'Untitled Notepad'}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #1e293b; background: #fff; }
            h1 { font-size: 26px; border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-top: 0; margin-bottom: 8px; font-weight: bold; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 30px; }
            .content { 
              font-family: ${selectedFont.css}; 
              font-size: ${selectedFontSize}; 
              font-weight: ${isBold ? 'bold' : 'normal'}; 
              font-style: ${isItalic ? 'italic' : 'normal'}; 
              text-decoration: ${isUnderline ? 'underline' : 'none'}; 
              white-space: pre-wrap; 
              word-break: break-word; 
              background: #f8fafc; 
              padding: 20px; 
              border: 1px solid #e2e8f0; 
              border-radius: 8px;
              page-break-inside: auto;
            }
            .photos-title {
              font-size: 18px; 
              font-weight: bold;
              margin-top: 40px; 
              border-bottom: 1px solid #cbd5e1; 
              padding-bottom: 8px;
              color: #334155;
            }
            @media print {
              .content {
                background: transparent !important;
                border: none !important;
                padding: 0 !important;
              }
              body {
                padding: 20px !important;
              }
            }
          </style>
        </head>
        <body>
          <h1>${title || 'Untitled Notepad'}</h1>
          <div class="meta">Created: ${new Date(notepad.createdAt).toLocaleString()} | Code: ${notepad.code || 'N/A'}</div>
          
          <div id="print-content" class="content"></div>
          
          ${images.length > 0 ? `
            <h2 class="photos-title">Attached Photos</h2>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${photosMarkup}
            </div>
          ` : ''}
        </body>
      </html>
    `);
    
    printWindow.document.getElementById('print-content').textContent = content || 'Empty document';
    printWindow.document.close();
    
    const printDoc = printWindow.document;
    const imagesToLoad = printDoc.querySelectorAll('img');
    
    const triggerPrint = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };

    if (imagesToLoad.length > 0) {
      let loadedCount = 0;
      imagesToLoad.forEach(img => {
        if (img.complete) {
          loadedCount++;
          if (loadedCount === imagesToLoad.length) {
            triggerPrint();
          }
        } else {
          img.onload = () => {
            loadedCount++;
            if (loadedCount === imagesToLoad.length) {
              triggerPrint();
            }
          };
          img.onerror = () => {
            loadedCount++;
            if (loadedCount === imagesToLoad.length) {
              triggerPrint();
            }
          };
        }
      });
    } else {
      triggerPrint();
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      if (cmdOrCtrl) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            if (user) saveNotepad();
            break;
          case 'p':
            e.preventDefault();
            handlePrint();
            break;
          case 'z':
            e.preventDefault();
            if (user) {
              if (e.shiftKey) {
                handleRedo();
              } else {
                handleUndo();
              }
            }
            break;
          case 'y':
            e.preventDefault();
            if (user) handleRedo();
            break;
          case 'f':
            e.preventDefault();
            if (user) setShowFindReplace(prev => !prev);
            break;
          case 'o':
            e.preventDefault();
            if (user && fileInputRef.current) fileInputRef.current.click();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, title, notepad, user, selectedFont, selectedFontSize, isBold, isItalic, isUnderline, canUndo, canRedo]);

  // Statistics calculation
  const getStats = () => {
    const chars = content.length;
    const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
    const lines = content === '' ? 0 : content.split('\n').length;
    return { chars, words, lines };
  };

  // Photo handlers
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center">
          <p className="text-gray-550 dark:text-slate-400">Notepad not found</p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const editorStats = getStats();

  return (
    <div className={`bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200 select-none ${
      isFullscreen ? 'fixed inset-0 z-50 flex flex-col w-screen h-screen' : 'min-h-screen'
    }`}>
      
      {/* Hidden native file picker for local system opens */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleSystemFileOpen} 
        accept=".txt,.json" 
        className="hidden" 
      />

      {/* 1. Document Metadata Header Row (High-contrast revamp) */}
      {!isFullscreen && (
        <div className="bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-slate-800 transition-colors duration-200 flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto flex-wrap">
            <button
              onClick={() => user ? onNavigate('dashboard') : onNavigate('home')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-955 dark:hover:text-white transition-all cursor-pointer font-medium text-xs shadow-sm focus:outline-none"
              title="Return to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-2 min-w-0 flex-1 sm:flex-initial">
              <input
                type="text"
                value={title}
                onChange={(e) => updateTitle(e.target.value)}
                className="text-sm font-semibold bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white flex-1 sm:w-60 sm:flex-none truncate"
                placeholder="Untitled Notepad"
                disabled={!user}
              />
              {notepad.code && (
                <span className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-gray-200 dark:bg-slate-800 border dark:border-slate-700 px-2 py-1 rounded whitespace-nowrap">
                  {notepad.code}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto flex-wrap justify-end">
            {lastSaved && (
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold whitespace-nowrap mr-2 animate-pulse">
                Saved at {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            {user && (
              <>
                <button
                  onClick={togglePublic}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors shadow-sm ${
                    isPublic 
                      ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:border-green-900/50' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 dark:border-slate-700'
                  }`}
                >
                  {isPublic ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{isPublic ? 'Public' : 'Private'}</span>
                </button>

                {isPublic && (
                  <button
                    onClick={copyShareCode}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:border-blue-900/50 transition-colors text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share</span>
                  </button>
                )}

                <button
                  onClick={saveNotepad}
                  disabled={isSaving}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors border border-blue-700 disabled:opacity-50 text-xs font-semibold cursor-pointer shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-500 dark:text-amber-400 transition-all duration-350 hover:scale-105 flex items-center justify-center cursor-pointer focus:outline-none shadow-sm"
              aria-label="Toggle Theme"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Centered Brand Bar (High contrast) */}
      <div className="bg-slate-100 dark:bg-slate-955 text-gray-800 dark:text-slate-205 border-b border-gray-250 dark:border-slate-850 h-9 flex items-center justify-center font-bold text-xs uppercase tracking-widest transition-colors duration-200 select-none shadow-inner">
        Online Notepad
      </div>

      {/* 3. Dropdown Menu Bar (File, Edit, Insert, View, Help) wrapped in menu-bar-wrapper */}
      {user && (
        <div className="bg-white dark:bg-slate-900 px-4 py-1.5 flex items-center text-xs font-semibold border-b border-gray-200 dark:border-slate-850 transition-colors select-none">
          <div className="menu-bar-wrapper flex items-center space-x-1 relative">
          
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-850 dark:text-slate-200 transition-colors cursor-pointer focus:outline-none ${
                activeMenu === 'file' ? 'bg-gray-100 dark:bg-slate-800' : ''
              }`}
            >
              File ▾
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 mt-1 z-40 bg-white dark:bg-slate-800 border border-gray-255 dark:border-slate-700 rounded-lg shadow-xl py-1.5 w-60 text-sm text-gray-800 dark:text-slate-200">
                <button
                  onClick={() => { handleNewDocument(); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <FileText className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>New document</span>
                  </span>
                </button>
                <button
                  onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <FolderOpen className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Open...</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ctrl+O</span>
                </button>
                <button
                  onClick={() => { saveNotepad(); setActiveMenu(null); }}
                  disabled={!user}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center space-x-2.5">
                    <Save className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Save</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ctrl+S</span>
                </button>
                <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>
                <button
                  onClick={() => { handlePrint(); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <Printer className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Print</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ctrl+P</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              className={`px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-855 dark:text-slate-200 transition-colors cursor-pointer focus:outline-none ${
                activeMenu === 'edit' ? 'bg-gray-100 dark:bg-slate-800' : ''
              }`}
            >
              Edit ▾
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute left-0 mt-1 z-40 bg-white dark:bg-slate-800 border border-gray-255 dark:border-slate-700 rounded-lg shadow-xl py-1.5 w-60 text-sm text-gray-800 dark:text-slate-200">
                <button
                  onClick={() => { handleUndo(); setActiveMenu(null); }}
                  disabled={!canUndo}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium disabled:opacity-40"
                >
                  <span className="flex items-center space-x-2.5">
                    <Undo className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Undo</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ctrl+Z</span>
                </button>
                <button
                  onClick={() => { handleRedo(); setActiveMenu(null); }}
                  disabled={!canRedo}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium disabled:opacity-40"
                >
                  <span className="flex items-center space-x-2.5">
                    <Redo className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Redo</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ctrl+Y</span>
                </button>
                <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>
                <button
                  onClick={() => { handleCut(); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <Scissors className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Cut</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ctrl+X</span>
                </button>
                <button
                  onClick={() => { handleCopy(); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <Clipboard className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Copy</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ctrl+C</span>
                </button>
                <button
                  onClick={() => { handlePaste(); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <Clipboard className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Paste</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ctrl+V</span>
                </button>
                <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>
                <button
                  onClick={() => { handleSelectAll(); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <CheckSquare className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Select all</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ctrl+A</span>
                </button>
                <button
                  onClick={() => { setShowFindReplace(prev => !prev); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <Search className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Find and replace</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ctrl+F</span>
                </button>
              </div>
            )}
          </div>

          {/* Insert Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'insert' ? null : 'insert')}
              className={`px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-855 dark:text-slate-200 transition-colors cursor-pointer focus:outline-none ${
                activeMenu === 'insert' ? 'bg-gray-100 dark:bg-slate-800' : ''
              }`}
            >
              Insert ▾
            </button>
            {activeMenu === 'insert' && (
              <div className="absolute left-0 mt-1 z-40 bg-white dark:bg-slate-800 border border-gray-255 dark:border-slate-700 rounded-lg shadow-xl py-1.5 w-60 text-sm text-gray-800 dark:text-slate-200">
                {user && (
                  <label className="w-full flex items-center space-x-2.5 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium">
                    <ImageIcon className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Insert Image...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => { handleImageUpload(e); setActiveMenu(null); }}
                      className="hidden"
                    />
                  </label>
                )}
                <button
                  onClick={() => { handleInsertDivider(); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Insert Divider Line</span>
                  </span>
                </button>
                <button
                  onClick={() => { handleInsertDateTime(); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Date & Time</span>
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              className={`px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-855 dark:text-slate-200 transition-colors cursor-pointer focus:outline-none ${
                activeMenu === 'view' ? 'bg-gray-100 dark:bg-slate-800' : ''
              }`}
            >
              View ▾
            </button>
            {activeMenu === 'view' && (
              <div className="absolute left-0 mt-1 z-40 bg-white dark:bg-slate-800 border border-gray-255 dark:border-slate-700 rounded-lg shadow-xl py-1.5 w-60 text-sm text-gray-800 dark:text-slate-200">
                <button
                  onClick={() => { setShowPhotosSidebar(prev => !prev); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <ImageIcon className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>{showPhotosSidebar ? 'Hide Photos Sidebar' : 'Show Photos Sidebar'}</span>
                  </span>
                </button>
                <button
                  onClick={() => { setIsFullscreen(prev => !prev); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <Maximize2 className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>{isFullscreen ? 'Exit Full Screen' : 'Toggle Full Screen'}</span>
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
              className={`px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-855 dark:text-slate-200 transition-colors cursor-pointer focus:outline-none ${
                activeMenu === 'help' ? 'bg-gray-100 dark:bg-slate-800' : ''
              }`}
            >
              Help ▾
            </button>
            {activeMenu === 'help' && (
              <div className="absolute left-0 mt-1 z-40 bg-white dark:bg-slate-800 border border-gray-255 dark:border-slate-700 rounded-lg shadow-xl py-1.5 w-60 text-sm text-gray-800 dark:text-slate-200">
                <button
                  onClick={() => { setShowShortcutsModal(true); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <HelpCircle className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>Keyboard Shortcuts</span>
                  </span>
                </button>
                <button
                  onClick={() => { setShowAboutModal(true); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-705 transition-colors cursor-pointer text-left font-medium"
                >
                  <span className="flex items-center space-x-2.5">
                    <FileText className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                    <span>About Online Notepad</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* 4. Toolbar Row (Revamped colors & high contrast icons) */}
      {user && (
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex flex-wrap items-center gap-1.5 border-b border-gray-255 dark:border-slate-855 transition-colors select-none">
        
        {/* Document operations */}
        <button
          onClick={handleNewDocument}
          className="p-2 rounded hover:bg-gray-250 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
          title="New Document"
        >
          <FileText className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }}
          className="p-2 rounded hover:bg-gray-250 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
          title="Open Local File (Ctrl+O)"
        >
          <FolderOpen className="h-4 w-4" />
        </button>

        <button
          onClick={saveNotepad}
          disabled={!user}
          className="p-2 rounded hover:bg-gray-250 dark:hover:bg-slate-700 text-gray-750 dark:text-slate-200 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Save Document (Ctrl+S)"
        >
          <Save className="h-4 w-4" />
        </button>

        <button
          onClick={handlePrint}
          className="p-2 rounded hover:bg-gray-250 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
          title="Print Note (Ctrl+P)"
        >
          <Printer className="h-4 w-4" />
        </button>

        {/* Separator */}
        <div className="h-5 border-r border-gray-300 dark:border-slate-700 mx-1.5" />

        {/* Clipboard operations */}
        <button
          onClick={handleCut}
          className="p-2 rounded hover:bg-gray-250 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
          title="Cut Selection (Ctrl+X)"
        >
          <Scissors className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleCopy}
          className="p-2 rounded hover:bg-gray-250 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
          title="Copy Selection (Ctrl+C)"
        >
          <Copy className="h-4 w-4" />
        </button>

        <button
          onClick={handlePaste}
          className="p-2 rounded hover:bg-gray-250 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
          title="Paste from Clipboard (Ctrl+V)"
        >
          <Clipboard className="h-4 w-4" />
        </button>

        {/* Separator */}
        <div className="h-5 border-r border-gray-300 dark:border-slate-700 mx-1.5" />

        {/* History operations */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="p-2 rounded hover:bg-gray-250 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo Change (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="p-2 rounded hover:bg-gray-250 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Redo Change (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </button>

        {/* Separator */}
        <div className="h-5 border-r border-gray-300 dark:border-slate-700 mx-1.5" />

        {/* Search operations */}
        <button
          onClick={() => setShowFindReplace(!showFindReplace)}
          className={`p-2 rounded hover:bg-gray-250 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
            showFindReplace ? 'bg-blue-150 text-blue-800 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-200'
          }`}
          title="Find and Replace (Ctrl+F)"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Separator */}
        <div className="h-5 border-r border-gray-300 dark:border-slate-700 mx-1.5" />

        {/* Font Family Custom Selection Dropdown (wrapped in font-family-select-wrapper) */}
        <div className="relative font-family-select-wrapper select-none">
          <button
            onClick={() => {
              setFontFamilyDropdownOpen(!fontFamilyDropdownOpen);
              setFontSizeDropdownOpen(false);
            }}
            className="px-3.5 py-1.5 border border-gray-350 dark:border-slate-650 rounded-lg text-xs bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 flex items-center justify-between w-36 hover:border-gray-400 dark:hover:border-slate-500 cursor-pointer focus:outline-none"
          >
            <span className="truncate" style={{ fontFamily: selectedFont.css }}>{selectedFont.name}</span>
            <span className="ml-2 text-[10px] text-gray-400">▼</span>
          </button>
          
          {fontFamilyDropdownOpen && (
            <div className="absolute left-0 mt-1 z-45 w-48 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-255 dark:border-slate-700 rounded-lg shadow-lg py-1 select-none">
              {fontOptions.map(font => (
                <button
                  key={font.name}
                  onClick={() => {
                    setSelectedFont(font);
                    setFontFamilyDropdownOpen(false);
                  }}
                  style={{ fontFamily: font.css }}
                  className={`w-full px-4 py-2 text-left text-xs cursor-pointer transition-colors ${
                    selectedFont.name === font.name 
                      ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white' 
                      : 'text-gray-900 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Sizes Custom Selection Dropdown (wrapped in font-size-select-wrapper) */}
        <div className="relative font-size-select-wrapper select-none">
          <button
            onClick={() => {
              setFontSizeDropdownOpen(!fontSizeDropdownOpen);
              setFontFamilyDropdownOpen(false);
            }}
            className="px-3.5 py-1.5 border border-gray-355 dark:border-slate-655 rounded-lg text-xs bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 flex items-center justify-between w-20 hover:border-gray-400 dark:hover:border-slate-500 cursor-pointer focus:outline-none"
          >
            <span>{selectedFontSize}</span>
            <span className="ml-2 text-[10px] text-gray-400">▼</span>
          </button>
          
          {fontSizeDropdownOpen && (
            <div className="absolute left-0 mt-1 z-45 w-20 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-255 dark:border-slate-700 rounded-lg shadow-lg py-1 select-none font-mono">
              {fontSizes.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedFontSize(size);
                    setFontSizeDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-xs cursor-pointer transition-colors ${
                    selectedFontSize === size 
                      ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white' 
                      : 'text-gray-900 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Styles: Bold, Italic, Underline */}
        <div className="flex items-center space-x-1 pl-1">
          <button
            onClick={() => setIsBold(!isBold)}
            className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 ${
              isBold ? 'bg-blue-200 text-blue-900 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'
            }`}
            title="Bold Style"
          >
            B
          </button>
          <button
            onClick={() => setIsItalic(!isItalic)}
            className={`w-8 h-8 rounded text-xs italic font-serif transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 ${
              isItalic ? 'bg-blue-200 text-blue-900 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'
            }`}
            title="Italic Style"
          >
            I
          </button>
          <button
            onClick={() => setIsUnderline(!isUnderline)}
            className={`w-8 h-8 rounded text-xs underline transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 ${
              isUnderline ? 'bg-blue-200 text-blue-900 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'
            }`}
            title="Underline Style"
          >
            U
          </button>
        </div>

        {/* Separator */}
        <div className="h-5 border-r border-gray-300 dark:border-slate-700 mx-1.5" />

        {/* AI Assist Wrapper */}
        <div className="relative ai-assist-select-wrapper select-none flex items-center">
          <button
            onClick={() => {
              const keyToUse = aiKey || localStorage.getItem('gemini_api_key');
              if (!keyToUse) {
                setShowAiKeyModal(true);
              } else {
                setAiDropdownOpen(!aiDropdownOpen);
              }
            }}
            disabled={isAiLoading}
            className={`p-2 rounded hover:bg-gray-255 dark:hover:bg-slate-700 cursor-pointer transition-colors flex items-center space-x-1 ${
              aiDropdownOpen ? 'bg-blue-150 text-blue-800 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-200'
            }`}
            title="AI Assist - Enhance your text"
          >
            {isAiLoading ? (
              <RefreshCw className="h-4.5 w-4.5 animate-spin text-blue-600 dark:text-blue-400" />
            ) : (
              <Sparkles className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
            )}
            <span className="text-xs font-semibold hidden sm:inline">AI Assist</span>
          </button>
          
          <button
            onClick={() => setShowAiKeyModal(true)}
            className="p-1.5 rounded hover:bg-gray-255 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-650 transition-colors"
            title="Configure AI Key"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>

          {aiDropdownOpen && (
            <div className="absolute left-0 mt-8 z-45 w-56 bg-white dark:bg-slate-800 border border-gray-255 dark:border-slate-700 rounded-lg shadow-lg py-1.5 select-none text-xs text-gray-800 dark:text-slate-200">
              <div className="px-3 py-1 text-[10px] text-gray-400 uppercase tracking-wider font-semibold border-b dark:border-slate-700 mb-1">
                AI Actions
              </div>
              <button
                onClick={() => triggerAiEnhance('improve')}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer font-medium"
              >
                <span>✨</span>
                <span>Improve Writing</span>
              </button>
              <button
                onClick={() => triggerAiEnhance('grammar')}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer font-medium"
              >
                <span>✍️</span>
                <span>Fix Grammar & Spelling</span>
              </button>
              <button
                onClick={() => triggerAiEnhance('professional')}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer font-medium"
              >
                <span>💼</span>
                <span>Make Professional</span>
              </button>
              <button
                onClick={() => triggerAiEnhance('casual')}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer font-medium"
              >
                <span>☕</span>
                <span>Make Casual</span>
              </button>
              <button
                onClick={() => triggerAiEnhance('summarize')}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer font-medium"
              >
                <span>📊</span>
                <span>Summarize</span>
              </button>
              <button
                onClick={() => triggerAiEnhance('action')}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center space-x-2 cursor-pointer font-medium"
              >
                <span>📋</span>
                <span>Extract Action Items</span>
              </button>
              
              <div className="border-t dark:border-slate-700 my-1"></div>
              
              <div className="px-3 py-1 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                Translate to
              </div>
              <div className="grid grid-cols-2 gap-1 px-2 py-1">
                {['Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Hindi'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => triggerAiEnhance('translate', lang)}
                    className="px-2 py-1 text-center bg-gray-50 hover:bg-blue-50 dark:bg-slate-750 dark:hover:bg-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {lang}
                  </button>
                ))}
              </div>
              
              {aiKey === 'demo' && (
                <>
                  <div className="border-t dark:border-slate-700 my-1"></div>
                  <div className="px-3 py-1 text-[9px] text-amber-500 font-semibold uppercase animate-pulse">
                    Running in Demo Mode
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-5 border-r border-gray-300 dark:border-slate-700 mx-1.5" />

        {/* Fullscreen control */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded hover:bg-gray-255 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
      )}

      {/* Find & Replace Panel */}
      {showFindReplace && (
        <div className="bg-slate-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 px-4 sm:px-6 py-2.5 transition-colors duration-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-450 uppercase w-12 flex-shrink-0">Find:</span>
            <input
              type="text"
              placeholder="Search query..."
              value={findText}
              onChange={(e) => { setFindText(e.target.value); performFind(e.target.value); }}
              className="px-3 py-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs w-full sm:w-44"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-455 uppercase w-12 flex-shrink-0">Replace:</span>
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs w-full sm:w-44"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => performFind(findText, 'next')}
              className="px-3 py-1 bg-slate-600 text-white rounded-lg hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-650 transition-colors text-xs font-semibold cursor-pointer border border-transparent"
            >
              Find Next
            </button>
            <button
              onClick={handleReplace}
              disabled={currentMatchIndex === -1}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-transparent"
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={!findText}
              className="px-3 py-1 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-transparent"
            >
              Replace All
            </button>
            {matchIndices.length > 0 && (
              <span className="text-xs font-mono text-gray-550 dark:text-slate-350 px-1">
                {currentMatchIndex + 1} of {matchIndices.length} matches
              </span>
            )}
            <button
              onClick={() => { setShowFindReplace(false); setMatchIndices([]); setCurrentMatchIndex(-1); }}
              className="p-1 text-gray-550 hover:text-gray-705 dark:text-slate-350 dark:hover:text-white transition-colors cursor-pointer ml-1"
              title="Close search panel"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`p-4 sm:p-6 pb-8 ${isFullscreen ? 'flex-1 overflow-hidden' : ''}`}>
        <div className={`max-w-7xl mx-auto h-full ${isFullscreen ? 'flex flex-col gap-4' : ''}`}>
          <div className={`grid grid-cols-1 ${isFullscreen ? 'h-full flex-1 overflow-hidden' : (showPhotosSidebar ? 'lg:grid-cols-3' : 'lg:grid-cols-1')} gap-6`}>
            
            {/* Text Editor TextArea Canvas */}
            <div className={`lg:col-span-2 ${isFullscreen ? 'flex flex-col h-full overflow-hidden' : ''}`}>
              <div className="flex items-center justify-between mb-3 flex-shrink-0 select-none">
                <h2 className="text-xs font-semibold text-gray-550 dark:text-slate-400 uppercase tracking-wider">Editor Canvas</h2>
                <div className="text-xs text-gray-505 dark:text-slate-400 font-mono bg-gray-150 dark:bg-slate-850 px-2 py-0.5 rounded">
                  Words: {editorStats.words} | Characters: {editorStats.chars} | Lines: {editorStats.lines}
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder={user ? "Type your notes here..." : "You are viewing this notepad in read-only mode. Please login to edit."}
                style={{ 
                  fontFamily: selectedFont.css, 
                  fontSize: selectedFontSize,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textDecoration: isUnderline ? 'underline' : 'none'
                }}
                spellCheck={spellcheckEnabled}
                className={`w-full p-6 border border-gray-300 dark:border-slate-800 dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed transition-all duration-200 shadow-sm ${
                  isFullscreen ? 'flex-1 h-full' : 'h-72 sm:h-[450px]'
                }`}
                disabled={!user}
              />
              
              {!user && !isFullscreen && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/15 border border-yellow-250 dark:border-yellow-900/30 rounded-lg flex-shrink-0 text-sm select-none">
                  <p className="text-yellow-805 dark:text-yellow-450">
                    You are viewing this notepad as a guest. 
                    <button
                      onClick={() => onNavigate('login')}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      Login
                    </button>
                    {' '}or{' '}
                    <button
                      onClick={() => onNavigate('signup')}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      Sign up
                    </button>
                    {' '}to save edits and files.
                  </p>
                </div>
              )}
            </div>

            {/* Photos Panel Sidebar */}
            {!isFullscreen && showPhotosSidebar && (
              <div className="lg:col-span-1">
                <h2 className="text-sm font-semibold text-gray-550 dark:text-slate-400 uppercase tracking-wider mb-3">Attached Photos</h2>
                
                {/* Upload box */}
                {user && (
                  <div className="mb-4">
                    <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-lg cursor-pointer bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors shadow-sm">
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400 dark:text-slate-505 mb-2" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-slate-350">Upload Photos</p>
                        <p className="text-xs text-gray-500 dark:text-slate-455">Click or drag images</p>
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

                {/* Guest upload notice */}
                {!user && images.length === 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950/15 border border-yellow-250 dark:border-yellow-900/30 rounded-lg text-xs">
                    <p className="text-yellow-808 dark:text-yellow-450">
                      <button
                        onClick={() => onNavigate('login')}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                      >
                        Login
                      </button>
                      {' '}to upload and attach photos.
                    </p>
                  </div>
                )}

                {/* Grid gallery */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {images.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-slate-450 text-xs py-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg transition-colors">
                      {user ? 'No photos attached yet.' : 'No photos attached'}
                    </p>
                  ) : (
                    images.map(image => (
                      <div key={image.id} className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all shadow-sm">
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
                                  className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                  title="Download"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteImage(image.id);
                                  }}
                                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-655 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-2 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{image.name}</p>
                          <p className="text-[10px] text-gray-550 dark:text-slate-400">{(image.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {images.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/15 border border-blue-200 dark:border-blue-900/30 rounded-lg text-xs shadow-sm">
                    <p className="text-blue-800 dark:text-blue-400 font-semibold">
                      {images.length} photo{images.length !== 1 ? 's' : ''} attached to note
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-85 z-50 flex items-center justify-center p-4 transition-all duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-transparent dark:border-slate-700 max-w-4xl max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white dark:bg-slate-700 text-gray-800 dark:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors z-10 cursor-pointer shadow-md"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center justify-center p-4">
              <img
                src={selectedImage.src}
                alt={selectedImage.name}
                className="max-w-full max-h-[60vh] object-contain rounded"
              />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 rounded-b-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white">{selectedImage.name}</h3>
              <p className="text-sm text-gray-650 dark:text-slate-400 mt-1">
                Size: {(selectedImage.size / 1024).toFixed(1)} KB • 
                Uploaded: {new Date(selectedImage.uploadedAt).toLocaleDateString()}
              </p>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => downloadImage(selectedImage)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
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
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-655 text-white px-4 py-2 rounded-lg hover:bg-red-750 transition-colors cursor-pointer"
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

      {/* Word Count / Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-transparent dark:border-slate-700 transition-all">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                <span>Document Statistics</span>
              </h3>
              <button 
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center my-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{editorStats.words}</div>
                <div className="text-xs font-semibold text-gray-450 dark:text-slate-400 uppercase tracking-wider mt-1">Words</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{editorStats.chars}</div>
                <div className="text-xs font-semibold text-gray-455 dark:text-slate-400 uppercase tracking-wider mt-1">Chars</div>
              </div>
              <div className="bg-slate-55 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-750">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{editorStats.lines}</div>
                <div className="text-xs font-semibold text-gray-455 dark:text-slate-400 uppercase tracking-wider mt-1">Lines</div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setShowStatsModal(false)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-semibold shadow-md hover:shadow-lg border border-transparent"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Info Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-transparent dark:border-slate-700 transition-all">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                <span>Keyboard Shortcuts</span>
              </h3>
              <button 
                onClick={() => setShowShortcutsModal(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 my-5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-350">Save Document:</span>
                <kbd className="bg-gray-100 dark:bg-slate-750 px-2.5 py-1 rounded font-mono text-xs dark:text-slate-300 border dark:border-slate-650">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-350">Open document picker:</span>
                <kbd className="bg-gray-100 dark:bg-slate-750 px-2.5 py-1 rounded font-mono text-xs dark:text-slate-300 border dark:border-slate-650">Ctrl + O</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-350">Print Note:</span>
                <kbd className="bg-gray-100 dark:bg-slate-750 px-2.5 py-1 rounded font-mono text-xs dark:text-slate-300 border dark:border-slate-650">Ctrl + P</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-350">Undo last edit:</span>
                <kbd className="bg-gray-100 dark:bg-slate-750 px-2.5 py-1 rounded font-mono text-xs dark:text-slate-300 border dark:border-slate-650">Ctrl + Z</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-350">Redo last edit:</span>
                <kbd className="bg-gray-100 dark:bg-slate-750 px-2.5 py-1 rounded font-mono text-xs dark:text-slate-300 border dark:border-slate-650">Ctrl + Y</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-350">Find & Replace toggle:</span>
                <kbd className="bg-gray-100 dark:bg-slate-750 px-2.5 py-1 rounded font-mono text-xs dark:text-slate-300 border dark:border-slate-650">Ctrl + F</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-350">Select all text:</span>
                <kbd className="bg-gray-100 dark:bg-slate-750 px-2.5 py-1 rounded font-mono text-xs dark:text-slate-300 border dark:border-slate-650">Ctrl + A</kbd>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-semibold border border-transparent shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-transparent dark:border-slate-700 transition-all text-center">
            <div className="flex justify-end">
              <button 
                onClick={() => setShowAboutModal(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-3">
              <div className="w-16 h-16 bg-blue-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border dark:border-slate-700">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Online Notepad</h3>
              <p className="text-xs text-gray-450 dark:text-slate-400 mt-1 font-mono">v1.2.0</p>
              
              <p className="text-sm text-gray-600 dark:text-slate-350 mt-4 leading-relaxed">
                A modern, premium notepad application designed for creating, editing, and categorizing notes securely in real-time. Features custom font selectors, hotkey triggers, full viewport writing canvas, and local photo attachments.
              </p>
            </div>

            <div className="flex justify-center pt-5">
              <button
                onClick={() => setShowAboutModal(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-semibold border border-transparent shadow-md"
              >
                Great
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI API Key Configuration Modal */}
      {showAiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-xl shadow-2xl p-6 w-full max-w-md border border-transparent dark:border-slate-700 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span>Configure Gemini AI</span>
              </h3>
              <button
                onClick={() => setShowAiKeyModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
              Enhance your notes, fix grammar, rewrite tones, summarize, and translate using Google's Gemini AI. Your API key is stored <strong>safely and locally</strong> in your browser's local storage and is never uploaded anywhere.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase">
                  Gemini API Key:
                </label>
                <input
                  type="password"
                  placeholder={aiKey && aiKey !== 'demo' ? "••••••••••••••••••••••••" : "Enter your Gemini API key"}
                  value={tempAiKey}
                  onChange={(e) => setTempAiKey(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div className="text-xs text-gray-500 dark:text-slate-400 flex flex-wrap gap-x-1.5 gap-y-1">
                <span>Don't have a key? Get a free key at</span>
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center space-x-0.5"
                >
                  <span>Google AI Studio</span>
                  <span>↗</span>
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 border-t dark:border-slate-700 pt-4 mt-2">
                <button
                  onClick={saveAiKey}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold text-xs cursor-pointer shadow transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>Save Key</span>
                </button>
                <button
                  onClick={useDemoMode}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg font-semibold text-xs cursor-pointer shadow transition-colors"
                >
                  Use Demo Mode
                </button>
                {aiKey && (
                  <button
                    onClick={clearAiKey}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold text-xs cursor-pointer shadow transition-colors"
                  >
                    Clear Config
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