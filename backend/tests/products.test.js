const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../src/app');
const Admin = require('../src/models/Admin');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const OrderItem = require('../src/models/OrderItem');

async function getAdminToken() {
  const response = await request(app).post('/api/admin/login').send({
    username: 'admin',
    password: 'admin123'
  });

  return response.body.token;
}

(global.__RUN_DB_TESTS__ ? describe : describe.skip)('Products API', () => {
  beforeAll(async () => {
    await Promise.all([
      OrderItem.deleteMany({}),
      Order.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Admin.deleteMany({})
    ]);

    await Admin.create({
      id: 1,
      username: 'admin',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'owner'
    });

    await Category.create({
      id: 1,
      name: 'Tools',
      slug: 'tools'
    });
  });

  test('POST /api/products creates product for authenticated admin', async () => {
    const category = await Category.findOne({ slug: 'tools' });
    const token = await getAdminToken();

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cordless Drill',
        slug: 'cordless-drill',
        description: 'Powerful cordless drill',
        price: 2999,
        categoryId: category.id,
        stock: 25,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Cordless Drill');
    expect(response.body.stock).toBe(25);
  });
});
