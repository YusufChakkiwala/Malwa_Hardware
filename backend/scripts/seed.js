require('dotenv').config();

const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../src/config/db');
const Admin = require('../src/models/Admin');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const { getNextSequence } = require('../src/utils/sequence');

async function upsertCategory({ name, slug }) {
  const existing = await Category.findOne({ slug });
  if (existing) {
    existing.name = name;
    await existing.save();
    return existing;
  }

  const id = await getNextSequence('category');
  return Category.create({ id, name, slug });
}

async function upsertAdmin({ username, password, role }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await Admin.findOne({ username });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = role;
    await existing.save();
    return existing;
  }

  const id = await getNextSequence('admin');
  return Admin.create({
    id,
    username,
    passwordHash,
    role
  });
}

async function upsertProduct({ slug, data }) {
  const existing = await Product.findOne({ slug });
  if (existing) {
    return existing;
  }

  const id = await getNextSequence('product');
  return Product.create({
    id,
    ...data
  });
}

async function main() {
  await connectDB();

  const username = process.env.ADMIN_SEED_USERNAME || 'admin';
  const password = process.env.ADMIN_SEED_PASSWORD || 'admin123';

  const categories = [
    { name: 'Tools', slug: 'tools' },
    { name: 'Electrical', slug: 'electrical' },
    { name: 'Plumbing', slug: 'plumbing' },
    { name: 'Paint', slug: 'paint' }
  ];

  for (const category of categories) {
    await upsertCategory(category);
  }

  await upsertAdmin({
    username,
    password,
    role: 'owner'
  });

  const toolsCategory = await Category.findOne({ slug: 'tools' });

  if (toolsCategory) {
    await upsertProduct({
      slug: 'premium-drill-machine',
      data: {
        name: 'Premium Drill Machine',
        slug: 'premium-drill-machine',
        description: 'Heavy duty drill machine suitable for industrial work.',
        price: 4999,
        categoryId: toolsCategory.id,
        stock: 10,
        imageUrl: null
      }
    });
  }

  console.log(`Seed complete. Admin username: ${username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDB();
  });
