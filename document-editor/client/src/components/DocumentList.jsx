import { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Paper,
  Typography 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getDocuments, createDocument } from '../services/api';

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
      console.log('Sending document creation request:', {
        title: 'Untitled Document',
        content: ''
      });
      
      const response = await createDocument({
        title: 'Untitled Document',
        content: ''
      });
      
      console.log('Create document response:', response);
      
      if (response.data && response.data._id) {
        setDocuments(prev => [response.data, ...prev]);
        navigate(`/documents/${response.data._id}`);
      } else {
        console.error('Invalid response format:', response);
      }
    } catch (error) {
      console.error('Error creating document:', error);
      // Add this to see more details about the error
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
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
            button
            onClick={() => navigate(`/documents/${doc._id}`)}
          >
            <ListItemText 
              primary={doc.title} 
              secondary={new Date(doc.updatedAt).toLocaleDateString()}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}