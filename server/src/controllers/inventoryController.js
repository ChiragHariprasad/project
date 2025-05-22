import InventoryItem from '../models/inventoryModel.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
export const getInventoryItems = async (req, res) => {
  try {
    const inventoryItems = await InventoryItem.find({});
    res.json(inventoryItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get a single inventory item
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Create a new inventory item
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      image,
      category,
      nextRestock
    } = req.body;

    const item = new InventoryItem({
      name,
      description,
      price,
      stock,
      image,
      category,
      nextRestock: nextRestock || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      image,
      category,
      nextRestock
    } = req.body;

    console.log('Update request for ID:', req.params.id);
    console.log('Update data:', req.body);

    let item;
    try {
      // First try to find by MongoDB ObjectId
      item = await InventoryItem.findById(req.params.id);
    } catch (err) {
      console.log('Not a valid MongoDB ID, trying alternative methods');
    }
    
    // If not found by _id, try other approaches
    if (!item) {
      // Try to find by the id property
      item = await InventoryItem.findOne({ id: req.params.id });
    }

    if (item) {
      console.log('Found item to update:', item.name);
      item.name = name || item.name;
      item.description = description || item.description;
      item.price = price !== undefined ? Number(price) : item.price;
      item.stock = stock !== undefined ? Number(stock) : item.stock;
      item.image = image || item.image;
      item.category = category || item.category;
      
      // Handle nextRestock carefully
      if (nextRestock) {
        try {
          item.nextRestock = new Date(nextRestock);
        } catch (err) {
          console.error('Error parsing nextRestock date:', err);
          // Keep existing date if new one is invalid
        }
      }

      console.log('Saving updated item');
      const updatedItem = await item.save();
      console.log('Item updated successfully:', updatedItem.name);
      res.json(updatedItem);
    } else {
      console.log('Item not found for ID:', req.params.id);
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during update',
      error: error.message,
    });
  }
};

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
export const deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (item) {
      await InventoryItem.deleteOne({ _id: req.params.id });
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update inventory stock (checkout functionality)
// @route   PUT /api/inventory/checkout
// @access  Private
export const updateInventoryStock = async (req, res) => {
  try {
    const { items } = req.body;
    
    console.log('Checkout request body:', req.body);
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid checkout data',
      });
    }

    const updatePromises = items.map(async (cartItem) => {
      const { id, quantity } = cartItem;
      
      console.log(`Processing item ID: ${id}, quantity: ${quantity}`);
      
      // Try to find the item by ID, supporting both MongoDB _id and legacy id
      let item;
      try {
        // First try to find by MongoDB ObjectId
        item = await InventoryItem.findById(id);
      } catch (err) {
        console.log('Not a valid MongoDB ID, trying alternative methods');
      }
      
      // If not found by _id, try other approaches
      if (!item) {
        // Try to find by the id property
        item = await InventoryItem.findOne({ id: id });
      }
      
      if (item) {
        console.log(`Found item: ${item.name}, current stock: ${item.stock}`);
        item.stock = Math.max(0, item.stock - quantity);
        console.log(`Updated stock to: ${item.stock}`);
        return item.save();
      } else {
        console.log(`Item with ID ${id} not found`);
      }
    });

    const results = await Promise.all(updatePromises.filter(Boolean));
    console.log(`Updated ${results.length} items`);

    res.json({
      success: true,
      message: 'Checkout successful',
      updatedItems: results.length
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during checkout',
      error: error.message,
    });
  }
};