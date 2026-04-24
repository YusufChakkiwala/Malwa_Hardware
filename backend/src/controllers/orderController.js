const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const { getNextSequence } = require('../utils/sequence');

function resolveProductSellingPrice(product) {
  const price = Number(product?.price) || 0;
  const discountPrice = Number(product?.discountPrice);
  const hasValidDiscount = Number.isFinite(discountPrice) && discountPrice >= 0 && discountPrice < price;
  return hasValidDiscount ? discountPrice : price;
}

async function hydrateOrderById(id) {
  return Order.findOne({ id }).populate({
    path: 'items',
    options: { sort: { id: 1 } },
    populate: { path: 'product' }
  });
}

async function restoreStock(decrementedItems) {
  if (!decrementedItems.length) {
    return;
  }

  const quantityByProductId = decrementedItems.reduce((accumulator, current) => {
    const existing = accumulator.get(current.productId) || 0;
    accumulator.set(current.productId, existing + current.quantity);
    return accumulator;
  }, new Map());

  await Promise.all(
    Array.from(quantityByProductId.entries()).map(([productId, quantity]) =>
      Product.findOneAndUpdate({ id: productId }, { $inc: { stock: quantity } })
    )
  );
}

async function createOrder(req, res, next) {
  const decrementedItems = [];
  let createdOrderId = null;

  try {
    const { customerUid = '', customerName, phone, address, city, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items is required' });
    }

    let totalAmount = 0;
    const normalizedItems = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
        const error = new Error('Invalid order item');
        error.statusCode = 400;
        throw error;
      }

      const product = await Product.findOne({ id: productId });
      if (!product) {
        const error = new Error(`Product ${productId} not found`);
        error.statusCode = 404;
        throw error;
      }

      const updated = await Product.findOneAndUpdate(
        {
          id: productId,
          stock: { $gte: quantity }
        },
        {
          $inc: { stock: -quantity }
        },
        { new: true }
      );

      if (!updated) {
        const error = new Error(`Insufficient stock for ${product.name}`);
        error.statusCode = 409;
        throw error;
      }

      decrementedItems.push({ productId, quantity });

      const priceAtPurchase = resolveProductSellingPrice(product);
      totalAmount += priceAtPurchase * quantity;

      normalizedItems.push({
        productId,
        quantity,
        priceAtPurchase
      });
    }

    const orderId = await getNextSequence('order');
    createdOrderId = orderId;
    await Order.create({
      id: orderId,
      customerUid: String(customerUid || '').trim(),
      customerName,
      phone,
      address,
      city,
      totalAmount,
      status: 'pending'
    });

    const orderItems = [];
    for (const item of normalizedItems) {
      const id = await getNextSequence('order_item');
      orderItems.push({
        id,
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase
      });
    }

    await OrderItem.insertMany(orderItems);

    const result = await hydrateOrderById(orderId);
    return res.status(201).json(result);
  } catch (error) {
    try {
      await restoreStock(decrementedItems);
    } catch (rollbackError) {
      console.error('Stock rollback failed:', rollbackError);
    }

    if (createdOrderId !== null) {
      try {
        await Promise.all([
          OrderItem.deleteMany({ orderId: createdOrderId }),
          Order.deleteOne({ id: createdOrderId })
        ]);
      } catch (cleanupError) {
        console.error('Order cleanup failed:', cleanupError);
      }
    }

    return next(error);
  }
}

async function getOrderHistory(req, res, next) {
  try {
    const customerUid = String(req.query.customerUid || '').trim();
    if (!customerUid) {
      return res.status(400).json({ message: 'customerUid is required' });
    }

    const orders = await Order.find({ customerUid })
      .sort({ createdAt: -1 })
      .populate({
        path: 'items',
        options: { sort: { id: 1 } },
        populate: { path: 'product' }
      });

    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'items',
        options: { sort: { id: 1 } },
        populate: { path: 'product' }
      });

    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await hydrateOrderById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const { status } = req.body;

    const existing = await Order.findOne({ id }).select('_id');
    if (!existing) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = await Order.findByIdAndUpdate(
      existing._id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getOrderHistory,
  getOrders,
  getOrderById,
  updateOrderStatus
};
