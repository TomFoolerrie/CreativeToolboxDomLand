import { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, // Add this
  Button, 
  Paper,
  Typography,
  IconButton, // Add this
  Dialog, // Add this
  DialogTitle, // Add this
  DialogContent, // Add this
  DialogActions, // Add this
  DialogContentText // Add this
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Add this
import { useNavigate } from 'react-router-dom';
import { getDocuments, createDocument, deleteDocument } from '../services/api';

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
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

  // Add these new functions
  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument(documentToDelete._id);
      setDocuments(prev => prev.filter(doc => doc._id !== documentToDelete._id));
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
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
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                aria-label="delete"
                onClick={() => handleDeleteClick(doc)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Document?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}