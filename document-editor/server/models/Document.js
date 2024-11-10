class Document {
  static validate(doc) {
    const requiredFields = ['title', 'content'];
    const errors = [];

    for (const field of requiredFields) {
      if (!doc[field]) {
        errors.push(`${field} is required`);
      }
    }

    if (doc.title && typeof doc.title !== 'string') {
      errors.push('title must be a string');
    }

    if (doc.content && typeof doc.content !== 'string') {
      errors.push('content must be a string');
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
      content: data.content,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
}

module.exports = Document;