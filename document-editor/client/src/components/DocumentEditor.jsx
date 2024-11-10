import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Paper, 
  TextField, 
  Button, 
  Stack,
  Box,
  Snackbar, // Add this
  Alert    // Add this
} from '@mui/material';
import { getDocument, updateDocument } from '../services/api';

// Debounce helper function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentDoc, setCurrentDoc] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // Add this for status messages

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const response = await getDocument(id);
      setCurrentDoc(response.data);
    } catch (error) {
      console.error('Error loading document:', error);
      navigate('/');
    }
  };

  // Create memoized autoSave function
  const autoSave = useCallback(
    debounce(async (docData) => {
      setSaving(true);
      setSaveStatus('Saving...');
      try {
        await updateDocument(id, docData);
        setSaveStatus('Saved!');
      } catch (error) {
        console.error('Error auto-saving:', error);
        setSaveStatus('Error saving!');
      } finally {
        setSaving(false);
        // Clear "Saved!" message after 2 seconds
        setTimeout(() => setSaveStatus(''), 2000);
      }
    }, 1000),
    [id]
  );

  const handleTitleChange = (event) => {
    const newDoc = { ...currentDoc, title: event.target.value };
    setCurrentDoc(newDoc);
    autoSave(newDoc);
  };

  const handleContentChange = (content) => {
    const newDoc = { ...currentDoc, content };
    setCurrentDoc(newDoc);
    autoSave(newDoc);
  };

  // Manual save button (optional, since we have autosave)
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDocument(id, currentDoc);
      setSaveStatus('Saved!');
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus('Error saving!');
    }
    setSaving(false);
  };

  return (
    <Paper sx={{ p: 2, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={2} sx={{ height: '100%' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Title"
            value={currentDoc.title}
            onChange={handleTitleChange}
          />
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
          >
            Back
          </Button>
        </Box>
        
        {/* Updated ReactQuill container */}
        <Box sx={{ flexGrow: 1, '& .quill': { height: '100%' } }}>
          <ReactQuill
            theme="snow"
            value={currentDoc.content}
            onChange={handleContentChange}
            style={{ height: 'calc(100% - 42px)' }} // 42px is the toolbar height
          />
        </Box>
      </Stack>
  
      <Snackbar 
        open={!!saveStatus} 
        autoHideDuration={2000} 
        onClose={() => setSaveStatus('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={saveStatus === 'Error saving!' ? 'error' : 'success'} 
          sx={{ 
            width: '100%',
            boxShadow: 2,
            '& .MuiAlert-message': {
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          {saveStatus}
        </Alert>
      </Snackbar>
    </Paper>
  );
}