class Document {
  static validate(doc) {
    const errors = [];

    // Check if title exists and is a string
    if (!doc.title) {
      errors.push('Title is required');
    } else if (typeof doc.title !== 'string') {
      errors.push('Title must be a string');
    }

    // Check if content is a string (allowing empty string)
    if (typeof doc.content !== 'string') {
      errors.push('Content must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static create(data) {
    return {
      _id: Date.now().toString(),
      title: data.title,
      content: data.content || '', // Default to empty string if not provided
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
}

module.exports = Document;