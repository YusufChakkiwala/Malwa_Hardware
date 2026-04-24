require('dotenv').config();

const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../src/config/db');
const Admin = require('../src/models/Admin');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const FAQ = require('../src/models/FAQ');
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

async function clearFAQs() {
  await FAQ.deleteMany({});
  console.log('Cleared existing FAQs');
}

async function seedFAQs() {
  const sampleFAQs = [
    {
      question: 'What are your store hours?',
      answer: 'We are open Monday to Saturday from 9 AM to 8 PM.'
    },
    {
      question: 'Do you offer delivery?',
      answer: 'Yes, we provide free delivery for orders above INR 1000 within 10km.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cards, UPI, net banking, and cash on delivery.'
    },
    {
      question: 'What is your return policy?',
      answer: 'You can return products within 7 days of delivery in original condition.'
    },
    {
      question: 'How long is the warranty on tools?',
      answer: 'Most tools come with 1 year warranty. Check product description for details.'
    }
  ];

  await FAQ.insertMany(sampleFAQs);
  console.log('Sample FAQs seeded successfully');
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

  await clearFAQs();
  await seedFAQs();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDB();
  });
