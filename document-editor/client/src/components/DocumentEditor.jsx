import React, { useState, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';

function DocumentEditor({ document, onSave }) {
  const [content, setContent] = useState(document?.content || '');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [attributes, setAttributes] = useState({
    tone: '',
    style: '', 
    pacing: '',
  });
  const quillRef = useRef(null);

  const handleSelectionChange = useCallback((range, oldRange, source) => {
    if (range && range.length > 0) {
      const quill = quillRef.current.getEditor();
      const bounds = quill.getBounds(range.index, range.length);
      const editorBounds = quill.container.getBoundingClientRect();
      
      const text = quill.getText(range.index, range.length);
      
      setSelectedText(text);
      setPopupPosition({
        x: editorBounds.left + bounds.left,
        y: editorBounds.top + bounds.bottom + window.scrollY + 10
      });
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, []);

  const handleChange = (value) => {
    setContent(value);
    onSave?.(value);
  };

  const handleAttributeSubmit = async (event, quill) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          attributes: attributes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to rewrite text');
      }

      const data = await response.json();
      
      const range = quill.getSelection();
      if (range) {
        quill.deleteText(range.index, range.length);
        quill.insertText(range.index, data.rewrittenText);
      }
      
      setShowPopup(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={handleChange}
        onChangeSelection={handleSelectionChange}
      />

      {showPopup && (
        <div 
          style={{
            position: 'absolute',
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '300px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3>Rewrite Text</h3>
            <button 
              type="button"
              onClick={() => setShowPopup(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAttributeSubmit(e, quillRef.current.getEditor());
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="tone">Tone:</label>
              <select 
                id="tone" 
                name="tone" 
                value={attributes.tone} 
                onChange={(e) => setAttributes({...attributes, tone: e.target.value})}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="">Select Tone</option>
                <option value="humorous">Humorous</option>
                <option value="serious">Serious</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="style">Style:</label>
              <select 
                id="style" 
                name="style" 
                value={attributes.style} 
                onChange={(e) => setAttributes({...attributes, style: e.target.value})}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="">Select Style</option>
                <option value="descriptive">Descriptive</option>
                <option value="concise">Concise</option>
                <option value="technical">Technical</option>
                <option value="narrative">Narrative</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="pacing">Pacing:</label>
              <select 
                id="pacing" 
                name="pacing" 
                value={attributes.pacing} 
                onChange={(e) => setAttributes({...attributes, pacing: e.target.value})}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="">Select Pacing</option>
                <option value="fast">Fast</option>
                <option value="moderate">Moderate</option>
                <option value="slow">Slow</option>
              </select>
            </div>

            <div style={{ margin: '16px 0', padding: '8px', background: '#f5f5f5' }}>
              <strong>Selected Text:</strong>
              <p>{selectedText}</p>
            </div>

            <button 
              type="submit"
              style={{
                width: '100%',
                padding: '8px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Rewrite
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default DocumentEditor;