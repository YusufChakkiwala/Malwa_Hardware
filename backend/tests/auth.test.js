const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../src/app');
const Admin = require('../src/models/Admin');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const OrderItem = require('../src/models/OrderItem');
const Query = require('../src/models/Query');
const Chat = require('../src/models/Chat');
const ChatMessage = require('../src/models/ChatMessage');

(global.__RUN_DB_TESTS__ ? describe : describe.skip)('Auth API', () => {
  beforeAll(async () => {
    await Promise.all([
      OrderItem.deleteMany({}),
      Order.deleteMany({}),
      ChatMessage.deleteMany({}),
      Chat.deleteMany({}),
      Query.deleteMany({}),
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
  });

  test('POST /api/admin/login returns JWT token for valid credentials', async () => {
    const response = await request(app).post('/api/admin/login').send({
      username: 'admin',
      password: 'admin123'
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
