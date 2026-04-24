const request = require('supertest');
const app = require('../src/app');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const OrderItem = require('../src/models/OrderItem');

(global.__RUN_DB_TESTS__ ? describe : describe.skip)('Orders API', () => {
  let product;

  beforeAll(async () => {
    await Promise.all([
      OrderItem.deleteMany({}),
      Order.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({})
    ]);

    const category = await Category.create({
      id: 1,
      name: 'Electrical',
      slug: `electrical-${Date.now()}`
    });

    product = await Product.create({
      id: 1,
      name: 'Industrial Wire Pack',
      slug: `industrial-wire-${Date.now()}`,
      description: 'High quality copper wire',
      price: 800,
      discountPrice: 650,
      categoryId: category.id,
      stock: 8
    });
  });

  test('POST /api/orders creates order and decrements stock atomically per item', async () => {
    const response = await request(app).post('/api/orders').send({
      customerName: 'Rakesh Sharma',
      phone: '9999999999',
      address: '12 Market Road',
      city: 'Indore',
      items: [
        {
          productId: product.id,
          quantity: 3
        }
      ]
    });

    expect(response.status).toBe(201);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].priceAtPurchase).toBe(650);
    expect(response.body.totalAmount).toBe(1950);

    const updatedProduct = await Product.findOne({ id: product.id });
    expect(updatedProduct.stock).toBe(5);
  });
});
