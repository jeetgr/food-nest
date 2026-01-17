import { db } from "../index";
import { category } from "../schema/categories";
import { food } from "../schema/foods";
import { user } from "../schema/auth";
import { address } from "../schema/addresses";
import { order, orderItem } from "../schema/orders";
import { payment } from "../schema/payments";
import { v4 as uuid } from "uuid";

// Sample images (placeholder URLs - you can replace with real images)
const CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  "https://images.unsplash.com/photo-1482049016gy506de8caa5?w=400",
];

const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400",
  "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=400",
  "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400",
];

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data (optional - comment out if you don't want to reset)
    console.log("🗑️  Clearing existing data...");
    await db.delete(payment);
    await db.delete(orderItem);
    await db.delete(order);
    await db.delete(address);
    await db.delete(food);
    await db.delete(category);
    // Note: Not deleting users/accounts to preserve admin user

    // Seed Categories
    console.log("📁 Seeding categories...");
    const categories = await db
      .insert(category)
      .values([
        {
          name: "Burgers",
          slug: "burgers",
          image: CATEGORY_IMAGES[0]!,
          isActive: true,
          sortOrder: 1,
        },
        {
          name: "Pizza",
          slug: "pizza",
          image: CATEGORY_IMAGES[1]!,
          isActive: true,
          sortOrder: 2,
        },
        {
          name: "Drinks",
          slug: "drinks",
          image: CATEGORY_IMAGES[2]!,
          isActive: true,
          sortOrder: 3,
        },
        {
          name: "Salads",
          slug: "salads",
          image: CATEGORY_IMAGES[3]!,
          isActive: true,
          sortOrder: 4,
        },
        {
          name: "Desserts",
          slug: "desserts",
          image: CATEGORY_IMAGES[4]!,
          isActive: true,
          sortOrder: 5,
        },
      ])
      .returning();

    console.log(`   ✓ Created ${categories.length} categories`);

    // Seed Foods
    console.log("🍔 Seeding foods...");
    const burgersCategory = categories.find((c) => c.slug === "burgers")!;
    const pizzaCategory = categories.find((c) => c.slug === "pizza")!;
    const drinksCategory = categories.find((c) => c.slug === "drinks")!;
    const saladsCategory = categories.find((c) => c.slug === "salads")!;
    const dessertsCategory = categories.find((c) => c.slug === "desserts")!;

    const foods = await db
      .insert(food)
      .values([
        // Burgers
        {
          name: "Classic Cheeseburger",
          slug: "classic-cheeseburger",
          description: "Juicy beef patty with melted cheese, lettuce, tomato",
          price: "199.00",
          image: FOOD_IMAGES[0]!,
          categoryId: burgersCategory.id,
          stock: 50,
          isAvailable: true,
        },
        {
          name: "Double Bacon Burger",
          slug: "double-bacon-burger",
          description: "Two beef patties with crispy bacon and special sauce",
          price: "349.00",
          image: FOOD_IMAGES[1]!,
          categoryId: burgersCategory.id,
          stock: 30,
          isAvailable: true,
        },
        {
          name: "Veggie Burger",
          slug: "veggie-burger",
          description: "Plant-based patty with fresh vegetables",
          price: "179.00",
          image: FOOD_IMAGES[2]!,
          categoryId: burgersCategory.id,
          stock: 40,
          isAvailable: true,
        },
        // Pizza
        {
          name: "Margherita Pizza",
          slug: "margherita-pizza",
          description: "Classic tomato, mozzarella, and fresh basil",
          price: "299.00",
          image: FOOD_IMAGES[1]!,
          categoryId: pizzaCategory.id,
          stock: 25,
          isAvailable: true,
        },
        {
          name: "Pepperoni Pizza",
          slug: "pepperoni-pizza",
          description: "Loaded with spicy pepperoni and cheese",
          price: "349.00",
          image: FOOD_IMAGES[1]!,
          categoryId: pizzaCategory.id,
          stock: 35,
          isAvailable: true,
        },
        {
          name: "BBQ Chicken Pizza",
          slug: "bbq-chicken-pizza",
          description: "Smoky BBQ chicken with red onions",
          price: "399.00",
          image: FOOD_IMAGES[1]!,
          categoryId: pizzaCategory.id,
          stock: 20,
          isAvailable: true,
        },
        // Drinks
        {
          name: "Fresh Lime Soda",
          slug: "fresh-lime-soda",
          description: "Refreshing lime with soda water",
          price: "79.00",
          image: FOOD_IMAGES[3]!,
          categoryId: drinksCategory.id,
          stock: 100,
          isAvailable: true,
        },
        {
          name: "Mango Smoothie",
          slug: "mango-smoothie",
          description: "Creamy mango blend with yogurt",
          price: "129.00",
          image: FOOD_IMAGES[3]!,
          categoryId: drinksCategory.id,
          stock: 60,
          isAvailable: true,
        },
        // Salads
        {
          name: "Caesar Salad",
          slug: "caesar-salad",
          description: "Crisp romaine with Caesar dressing and croutons",
          price: "179.00",
          image: FOOD_IMAGES[4]!,
          categoryId: saladsCategory.id,
          stock: 40,
          isAvailable: true,
        },
        // Desserts
        {
          name: "Chocolate Brownie",
          slug: "chocolate-brownie",
          description: "Rich chocolate brownie with vanilla ice cream",
          price: "149.00",
          image: FOOD_IMAGES[4]!,
          categoryId: dessertsCategory.id,
          stock: 45,
          isAvailable: true,
        },
        {
          name: "Cheesecake",
          slug: "cheesecake",
          description: "New York style creamy cheesecake",
          price: "199.00",
          image: FOOD_IMAGES[4]!,
          categoryId: dessertsCategory.id,
          stock: 30,
          isAvailable: true,
        },
      ])
      .returning();

    console.log(`   ✓ Created ${foods.length} food items`);

    // Seed a test customer user
    console.log("👤 Seeding test customer...");
    const customerId = uuid();
    await db.insert(user).values({
      id: customerId,
      name: "Test Customer",
      email: "customer1@test.com",
      emailVerified: true,
      role: "customer",
    });

    // Seed customer address
    console.log("📍 Seeding address...");
    const [customerAddress] = await db
      .insert(address)
      .values({
        userId: customerId,
        label: "Home",
        street: "123 Test Street, Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        phone: "+91 9876543210",
        isDefault: true,
      })
      .returning();

    // Seed sample orders
    console.log("🛒 Seeding orders...");
    const orderStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ] as const;

    const ordersCreated = [];

    for (let i = 0; i < 15; i++) {
      const status =
        orderStatuses[Math.floor(Math.random() * orderStatuses.length)]!;
      const daysAgo = Math.floor(Math.random() * 60); // Random date in last 60 days
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      // Random items for this order (1-4 items)
      const numItems = Math.floor(Math.random() * 4) + 1;
      const orderFoods = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const randomFood = foods[Math.floor(Math.random() * foods.length)]!;
        const quantity = Math.floor(Math.random() * 3) + 1;
        const foodPrice = parseFloat(randomFood.price);
        const itemTotal = foodPrice * quantity;
        totalAmount += itemTotal;

        orderFoods.push({
          food: randomFood,
          quantity,
          unitPrice: randomFood.price,
          totalPrice: itemTotal.toFixed(2),
        });
      }

      const [newOrder] = await db
        .insert(order)
        .values({
          userId: customerId,
          addressId: customerAddress!.id,
          status,
          totalAmount: totalAmount.toFixed(2),
          notes: i % 3 === 0 ? "Extra napkins please" : null,
          createdAt,
          updatedAt: createdAt,
        })
        .returning();

      // Create order items
      for (const item of orderFoods) {
        await db.insert(orderItem).values({
          orderId: newOrder!.id,
          foodId: item.food.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        });
      }

      // Create payment for this order
      const paymentStatus =
        status === "delivered"
          ? "completed"
          : status === "cancelled"
            ? "failed"
            : "pending";

      await db.insert(payment).values({
        orderId: newOrder!.id,
        method: "cod",
        status: paymentStatus,
        amount: totalAmount.toFixed(2),
        providerTransactionId: `COD-${newOrder!.id.slice(-8).toUpperCase()}`,
      });

      ordersCreated.push(newOrder);
    }

    console.log(`   ✓ Created ${ordersCreated.length} orders with items`);

    console.log("\n✅ Seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   • ${categories.length} categories`);
    console.log(`   • ${foods.length} food items`);
    console.log(`   • 1 test customer (customer@test.com)`);
    console.log(`   • ${ordersCreated.length} sample orders`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Run seed
seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
