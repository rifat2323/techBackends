const mongoose = require('mongoose');

// Define schema for filter options
const filterOptionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  checkBoxValue: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    query: {
      type: String,
      required: true
    }
  }],
  category:{
    type: String,
    required:true
  }
});

// Create a model based on the schema
const FilterOption = mongoose.model('FilterOption', filterOptionSchema);

module.exports = FilterOption;
