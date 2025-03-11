const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// API endpoints
// Get complete data (categories with heuristics)
app.get('/api/data', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// Get heuristics data
app.get('/api/heuristics', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    const parsedData = JSON.parse(data);
    // Extract heuristics from categories
    const heuristics = [];
    if (parsedData.categories) {
      parsedData.categories.forEach(category => {
        if (category.heuristics && Array.isArray(category.heuristics)) {
          category.heuristics.forEach(heuristic => {
            // Map field names to match what the client expects
            const mappedHeuristic = {
              ...heuristic,
              guideline: heuristic.description, // Map description to guideline
              categoryId: category.id,
              categoryName: category.name
            };
            
            // Add empty arrays for fields that might be missing
            if (!mappedHeuristic.examples) {
              mappedHeuristic.examples = [];
            } else if (Array.isArray(mappedHeuristic.examples)) {
              // Transform string examples to object format with title/description fields
              mappedHeuristic.examples = mappedHeuristic.examples.map(example => {
                // If already in object format with title/description
                if (typeof example === 'object' && example !== null && (example.title || example.description)) {
                  return example;
                }
                // If it's a string, convert to object format
                if (typeof example === 'string') {
                  return {
                    title: example,
                    description: ''
                  };
                }
                // Fallback for any other format
                return {
                  title: String(example),
                  description: ''
                };
              });
            }
            
            heuristics.push(mappedHeuristic);
          });
        }
      });
    }
    res.json(heuristics);
  } catch (error) {
    console.error('Error reading heuristics data:', error);
    res.status(500).json({ error: 'Failed to load heuristics data' });
  }
});

// Get categories data
app.get('/api/categories', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    const parsedData = JSON.parse(data);
    // Extract just the categories without heuristics
    if (parsedData.categories) {
      // Create a copy of categories without the heuristics arrays to reduce payload size
      const categories = parsedData.categories.map(category => {
        const { heuristics, ...categoryData } = category;
        return categoryData;
      });
      res.json(categories);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading categories data:', error);
    res.status(500).json({ error: 'Failed to load categories data' });
  }
});

// Debug endpoint to check data transformation
app.get('/api/debug/:id', (req, res) => {
  try {
    const heuristicId = req.params.id;
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    const parsedData = JSON.parse(data);
    
    // Debug information object
    const debugInfo = {
      originalData: null,
      transformedData: null,
      fieldPresence: {
        originalHasDescription: false,
        originalHasGuideline: false,
        originalHasExamples: false,
        transformedHasDescription: false,
        transformedHasGuideline: false,
        transformedHasExamples: false
      }
    };
    
    // Search for the heuristic in all categories
    if (parsedData.categories) {
      for (const category of parsedData.categories) {
        if (category.heuristics && Array.isArray(category.heuristics)) {
          const heuristic = category.heuristics.find(h => h.id === heuristicId);
          if (heuristic) {
            // Store original data
            debugInfo.originalData = {
              ...heuristic,
              categoryId: category.id,
              categoryName: category.name
            };
            
            // Check field presence in original
            debugInfo.fieldPresence.originalHasDescription = 'description' in heuristic;
            debugInfo.fieldPresence.originalHasGuideline = 'guideline' in heuristic;
            debugInfo.fieldPresence.originalHasExamples = Array.isArray(heuristic.examples);
            
            // Create transformed data with mapping
            const transformedHeuristic = {
              ...heuristic,
              guideline: heuristic.description,
              categoryId: category.id,
              categoryName: category.name
            };
            
            // Add empty examples array if missing
            if (!transformedHeuristic.examples) {
              transformedHeuristic.examples = [];
            }
            
            // Store transformed data
            debugInfo.transformedData = transformedHeuristic;
            
            // Check field presence in transformed
            debugInfo.fieldPresence.transformedHasDescription = 'description' in transformedHeuristic;
            debugInfo.fieldPresence.transformedHasGuideline = 'guideline' in transformedHeuristic;
            debugInfo.fieldPresence.transformedHasExamples = Array.isArray(transformedHeuristic.examples);
            
            // Add field values for direct inspection
            debugInfo.fieldValues = {
              originalDescription: heuristic.description,
              transformedGuideline: transformedHeuristic.guideline,
              originalExamples: heuristic.examples,
              transformedExamples: transformedHeuristic.examples
            };
            
            break;
          }
        }
      }
    }
    
    console.log('DEBUG INFO:', JSON.stringify(debugInfo, null, 2));
    res.json(debugInfo);
  } catch (error) {
    console.error(`Debug error:`, error);
    res.status(500).json({ error: 'Debug error' });
  }
});

// Get a single heuristic by ID
app.get('/api/heuristics/:id', (req, res) => {
  try {
    const heuristicId = req.params.id;
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    const parsedData = JSON.parse(data);
    
    // Search for the heuristic in all categories
    let foundHeuristic = null;
    
    if (parsedData.categories) {
      for (const category of parsedData.categories) {
        if (category.heuristics && Array.isArray(category.heuristics)) {
          const heuristic = category.heuristics.find(h => h.id === heuristicId);
          if (heuristic) {
            // Map field names to match what the client expects
            // The editor.js expects 'guideline' but data has 'description'
            const mappedHeuristic = {
              ...heuristic,
              guideline: heuristic.description,
              categoryId: category.id,
              categoryName: category.name
            };
            
            // Add empty arrays for fields that might be missing
            if (!mappedHeuristic.examples) {
              mappedHeuristic.examples = [];
            } else if (Array.isArray(mappedHeuristic.examples)) {
              // Transform string examples to object format with title/description fields
              mappedHeuristic.examples = mappedHeuristic.examples.map(example => {
                // If already in object format with title/description
                if (typeof example === 'object' && example !== null && (example.title || example.description)) {
                  return example;
                }
                // If it's a string, convert to object format
                if (typeof example === 'string') {
                  return {
                    title: example,
                    description: ''
                  };
                }
                // Fallback for any other format
                return {
                  title: String(example),
                  description: ''
                };
              });
            }
            
            foundHeuristic = mappedHeuristic;
            break;
          }
        }
      }
    }
    
    if (foundHeuristic) {
      res.json(foundHeuristic);
    } else {
      res.status(404).json({ error: `Heuristic with ID ${heuristicId} not found` });
    }
  } catch (error) {
    console.error(`Error reading heuristic with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to load heuristic data' });
  }
});

// Create a new heuristic
app.post('/api/heuristics', (req, res) => {
  try {
    const newHeuristic = req.body;
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    const parsedData = JSON.parse(data);
    
    // Find the category to add the heuristic to
    const categoryId = newHeuristic.categoryId;
    if (!categoryId || !parsedData.categories) {
      return res.status(400).json({ error: 'Category ID is required' });
    }
    
    // Find the category index
    const categoryIndex = parsedData.categories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: `Category with ID ${categoryId} not found` });
    }
    
    // Remove categoryId and categoryName from the heuristic before saving
    // Also map guideline back to description for storage
    const { categoryId: removedId, categoryName, guideline, ...heuristicData } = newHeuristic;
    
    const heuristicToSave = {
      ...heuristicData,
      description: guideline // Map guideline back to description
    };
    
    // Add heuristic to the category
    if (!parsedData.categories[categoryIndex].heuristics) {
      parsedData.categories[categoryIndex].heuristics = [];
    }
    
    parsedData.categories[categoryIndex].heuristics.push(heuristicToSave);
    
    // Save the updated data
    fs.writeFileSync(
      path.join(__dirname, '../data/heuristics.json'),
      JSON.stringify(parsedData, null, 2)
    );
    
    // Return the newly created heuristic with category info
    res.status(201).json({
      ...heuristicToSave,
      guideline: heuristicToSave.description,
      categoryId,
      categoryName: parsedData.categories[categoryIndex].name
    });
  } catch (error) {
    console.error('Error creating heuristic:', error);
    res.status(500).json({ error: 'Failed to create heuristic' });
  }
});

// Update a heuristic
app.put('/api/heuristics/:id', (req, res) => {
  try {
    const heuristicId = req.params.id;
    const updatedHeuristic = req.body;
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    const parsedData = JSON.parse(data);
    
    // Find the heuristic in all categories
    let found = false;
    let categoryIndex = -1;
    let heuristicIndex = -1;
    let oldCategoryId = null;
    
    // First, find the current location of the heuristic
    if (parsedData.categories) {
      for (let i = 0; i < parsedData.categories.length; i++) {
        const category = parsedData.categories[i];
        if (category.heuristics && Array.isArray(category.heuristics)) {
          const index = category.heuristics.findIndex(h => h.id === heuristicId);
          if (index !== -1) {
            found = true;
            categoryIndex = i;
            heuristicIndex = index;
            oldCategoryId = category.id;
            break;
          }
        }
      }
    }
    
    if (!found) {
      return res.status(404).json({ error: `Heuristic with ID ${heuristicId} not found` });
    }
    
    // Check if the heuristic is being moved to a different category
    const newCategoryId = updatedHeuristic.categoryId || oldCategoryId;
    
    if (newCategoryId !== oldCategoryId) {
      // Remove from old category
      const heuristicToMove = parsedData.categories[categoryIndex].heuristics.splice(heuristicIndex, 1)[0];
      
      // Find new category
      const newCategoryIndex = parsedData.categories.findIndex(c => c.id === newCategoryId);
      if (newCategoryIndex === -1) {
        return res.status(404).json({ error: `New category with ID ${newCategoryId} not found` });
      }
      
      // Add to new category
      if (!parsedData.categories[newCategoryIndex].heuristics) {
        parsedData.categories[newCategoryIndex].heuristics = [];
      }
      
      // Remove categoryId and categoryName before saving
      // Also map guideline back to description
      const { categoryId, categoryName, guideline, ...heuristicData } = updatedHeuristic;
      
      // Update and save the heuristic in the new category
      parsedData.categories[newCategoryIndex].heuristics.push({
        ...heuristicData,
        description: guideline, // Map guideline back to description
        id: heuristicId
      });
      
      // Set the indices for the response
      categoryIndex = newCategoryIndex;
      heuristicIndex = parsedData.categories[newCategoryIndex].heuristics.length - 1;
    } else {
      // Remove categoryId and categoryName before saving
      // Also map guideline back to description
      const { categoryId, categoryName, guideline, ...heuristicData } = updatedHeuristic;
      
      // Update the heuristic in the same category
      parsedData.categories[categoryIndex].heuristics[heuristicIndex] = {
        ...heuristicData,
        description: guideline, // Map guideline back to description
        id: heuristicId
      };
    }
    
    // Save the updated data
    fs.writeFileSync(
      path.join(__dirname, '../data/heuristics.json'),
      JSON.stringify(parsedData, null, 2)
    );
    
    // Return the updated heuristic with category info
    const returnedHeuristic = {
      ...parsedData.categories[categoryIndex].heuristics[heuristicIndex],
      guideline: parsedData.categories[categoryIndex].heuristics[heuristicIndex].description,
      categoryId: parsedData.categories[categoryIndex].id,
      categoryName: parsedData.categories[categoryIndex].name
    };
    
    res.json(returnedHeuristic);
  } catch (error) {
    console.error(`Error updating heuristic with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update heuristic' });
  }
});

// Delete a heuristic
app.delete('/api/heuristics/:id', (req, res) => {
  try {
    const heuristicId = req.params.id;
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    const parsedData = JSON.parse(data);
    
    // Find the heuristic in all categories
    let found = false;
    let deletedHeuristic = null;
    
    if (parsedData.categories) {
      for (const category of parsedData.categories) {
        if (category.heuristics && Array.isArray(category.heuristics)) {
          const index = category.heuristics.findIndex(h => h.id === heuristicId);
          if (index !== -1) {
            // Store the heuristic before deleting
            const heuristic = category.heuristics[index];
            deletedHeuristic = {
              ...heuristic,
              guideline: heuristic.description,
              categoryId: category.id,
              categoryName: category.name
            };
            
            // Remove the heuristic
            category.heuristics.splice(index, 1);
            found = true;
            break;
          }
        }
      }
    }
    
    if (!found) {
      return res.status(404).json({ error: `Heuristic with ID ${heuristicId} not found` });
    }
    
    // Save the updated data
    fs.writeFileSync(
      path.join(__dirname, '../data/heuristics.json'),
      JSON.stringify(parsedData, null, 2)
    );
    
    // Return the deleted heuristic
    res.json(deletedHeuristic);
  } catch (error) {
    console.error(`Error deleting heuristic with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete heuristic' });
  }
});

// Create a new category
app.post('/api/categories', (req, res) => {
  try {
    const newCategory = req.body;
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    const parsedData = JSON.parse(data);
    
    // Initialize categories array if it doesn't exist
    if (!parsedData.categories) {
      parsedData.categories = [];
    }
    
    // Check if a category with the same ID already exists
    const existingCategory = parsedData.categories.find(c => c.id === newCategory.id);
    if (existingCategory) {
      return res.status(400).json({ error: `Category with ID ${newCategory.id} already exists` });
    }
    
    // Add empty heuristics array if not provided
    if (!newCategory.heuristics) {
      newCategory.heuristics = [];
    }
    
    // Add the new category
    parsedData.categories.push(newCategory);
    
    // Save the updated data
    fs.writeFileSync(
      path.join(__dirname, '../data/heuristics.json'),
      JSON.stringify(parsedData, null, 2)
    );
    
    // Return the new category (without heuristics)
    const { heuristics, ...categoryData } = newCategory;
    res.status(201).json(categoryData);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update a category
app.put('/api/categories/:id', (req, res) => {
  try {
    const categoryId = req.params.id;
    const updatedCategory = req.body;
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    const parsedData = JSON.parse(data);
    
    // Find the category index
    const categoryIndex = parsedData.categories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: `Category with ID ${categoryId} not found` });
    }
    
    // Preserve heuristics from the existing category
    const existingHeuristics = parsedData.categories[categoryIndex].heuristics || [];
    
    // Update the category
    parsedData.categories[categoryIndex] = {
      ...updatedCategory,
      id: categoryId, // Ensure the ID remains the same
      heuristics: existingHeuristics // Preserve existing heuristics
    };
    
    // Save the updated data
    fs.writeFileSync(
      path.join(__dirname, '../data/heuristics.json'),
      JSON.stringify(parsedData, null, 2)
    );
    
    // Return the updated category (without heuristics)
    const { heuristics, ...categoryData } = parsedData.categories[categoryIndex];
    res.json(categoryData);
  } catch (error) {
    console.error(`Error updating category with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete a category
app.delete('/api/categories/:id', (req, res) => {
  try {
    const categoryId = req.params.id;
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    const parsedData = JSON.parse(data);
    
    // Find the category index
    const categoryIndex = parsedData.categories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: `Category with ID ${categoryId} not found` });
    }
    
    // Store the category before removing
    const deletedCategory = parsedData.categories[categoryIndex];
    
    // Remove the category
    parsedData.categories.splice(categoryIndex, 1);
    
    // Save the updated data
    fs.writeFileSync(
      path.join(__dirname, '../data/heuristics.json'),
      JSON.stringify(parsedData, null, 2)
    );
    
    // Return the deleted category (without heuristics)
    const { heuristics, ...categoryData } = deletedCategory;
    res.json(categoryData);
  } catch (error) {
    console.error(`Error deleting category with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
