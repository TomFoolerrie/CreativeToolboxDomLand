import { 
    Drawer, 
    IconButton, 
    Box, 
    Typography,
    Button,
    CircularProgress,
    TextField
  } from '@mui/material';
  import MenuIcon from '@mui/icons-material/Menu';
  import CloseIcon from '@mui/icons-material/Close';
  import { useState } from 'react';
  
  // You'll need to get your Gemini API key from Google AI Studio
  const GEMINI_API_KEY = 'your_api_key_here';
  
  export default function Sidebar({ selectedText, onSuggestionApply }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState('');
    const [error, setError] = useState('');
  
    const toggleDrawer = () => {
      setIsOpen(!isOpen);
      // Clear previous suggestions when closing
      if (!isOpen) {
        setSuggestions('');
        setError('');
      }
    };
  
    const analyzeText = async () => {
      if (!selectedText) {
        setError('Please select some text to analyze');
        return;
      }
  
      setLoading(true);
      setError('');
  
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GEMINI_API_KEY}`
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Please analyze and improve the following text for better tone and clarity. 
                       Provide 2-3 alternative versions with explanations:
                       "${selectedText}"`
              }]
            }]
          })
        });
  
        const data = await response.json();
        setSuggestions(data.candidates[0].content.parts[0].text);
      } catch (err) {
        setError('Failed to get suggestions. Please try again.');
        console.error('Gemini API error:', err);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
  
        <Drawer
          anchor="right"
          open={isOpen}
          onClose={toggleDrawer}
        >
          <Box
            sx={{
              width: 350,
              p: 2,
              height: '100%',
              backgroundColor: 'background.paper'
            }}
            role="presentation"
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Text Analysis</Typography>
              <IconButton onClick={toggleDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>
  
            {selectedText ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Selected Text:
                </Typography>
                <Typography paragraph>
                  {selectedText}
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={analyzeText}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Analyze Text'}
                </Button>
              </Box>
            ) : (
              <Typography color="text.secondary">
                Select text in the editor to analyze
              </Typography>
            )}
  
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
  
            {suggestions && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Suggestions:
                </Typography>
                <Typography paragraph>
                  {suggestions}
                </Typography>
              </Box>
            )}
          </Box>
        </Drawer>
      </>
    );
  }