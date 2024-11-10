import { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Paper,
  Typography,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { getDocuments, createDocument, deleteDocument } from '../services/api';

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const response = await createDocument({
        title: 'Untitled Document',
        content: ''
      });
      if (response.data && response.data._id) {
        setDocuments(prev => [response.data, ...prev]);
        navigate(`/documents/${response.data._id}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleDeleteDocument = async (id, event) => {
    event.stopPropagation(); // Prevent navigation when clicking delete
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc._id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        My Documents
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleCreateDocument}
        sx={{ mb: 2 }}
      >
        Create New Document
      </Button>
      <List>
        {documents.map((doc) => (
          <ListItem 
            key={doc._id}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <ListItemText 
              primary={doc.title} 
              secondary={new Date(doc.updatedAt).toLocaleDateString()}
              onClick={() => navigate(`/documents/${doc._id}`)}
              sx={{ cursor: 'pointer' }}
            />
            <IconButton 
              edge="end" 
              aria-label="delete"
              onClick={(e) => handleDeleteDocument(doc._id, e)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}