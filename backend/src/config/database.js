const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || "shopee-clone",
    });

    console.log(
      `✅ Connected to MongoDB Atlas via Mongoose: ${conn.connection.host}`,
    );

    // Auto-seed default admin if none exists
    const User = require("../modules/auth/model");
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      await User.create({
        email: "admin@shopee.com",
        password: "admin123",
        role: "admin",
        profile: {
          name: "Shopee Admin",
          phone: "09123456789",
        },
      });
      console.log("👤 Seeded default admin user: admin@shopee.com / admin123");
    }

    // Auto-seed categories if none exist
    const Category = require("../modules/category/model");
    const categoriesToSeed = [
      "Men's Apparel",
      "Mobiles & Gadgets",
      "Mobiles Accessories",
      "Home Entertainment",
      "Babies & Kids",
      "Home & Living",
      "Groceries",
      "Toys, Games & Collectibles",
      "Women's Bags",
      "Women Accessories",
      "Women's Apparel",
      "Health & Personal Care",
      "Makeup & Fragrances",
      "Home Appliances",
      "Laptops & Computers",
      "Cameras",
      "Sports & Travel",
      "Men's Bags & Accessories",
      "Men's Shoes",
      "Motors",
      "Women's Shoes",
      "Pet Care",
      "Audio",
      "Hobbies & Stationery",
      "Gaming"
    ];

    for (const catName of categoriesToSeed) {
      const catExists = await Category.findOne({ name: catName });
      if (!catExists) {
        await Category.create({ name: catName, description: `${catName} category` });
      }
    }
    console.log(`🗂️ Categories database verified and populated.`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
