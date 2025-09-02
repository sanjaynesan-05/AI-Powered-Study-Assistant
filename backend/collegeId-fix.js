// Fix for collegeId duplicate key error
// Add this to the userModel.js file

// Add collegeId field to the schema with a default value
collegeId: {
  type: String,
  default: function() {
    // Generate a unique ID
    return 'college_' + this._id;
  },
  // Remove any unique constraint if it exists
},
