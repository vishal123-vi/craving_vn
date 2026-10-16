import dns from "node:dns";
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/config/dbConnection.config.js";
import User from "./src/models/user.model.js";
import Restaurant from "./src/models/restaurant.model.js";
import Menu from "./src/models/menu.model.js";
import Order from "./src/models/order.model.js";
import Customer from "./src/models/customer.model.js";
import bcrypt from "bcrypt";

const BASE_URL = "http://localhost:5000";

const checklist = [];
function recordCheck(num, title, passed, details = "") {
  checklist.push({ num, title, passed, details });
  console.log(`[${passed ? "PASS" : "FAIL"}] Checklist Item ${num}: ${title}`);
  if (details) console.log(`       Details: ${details}`);
}

async function runChecklist() {
  await connectDB();
  console.log("\n=======================================================");
  console.log("🍽️  RUNNING RESTAURANT MANAGER CHECKLIST VERIFICATION");
  console.log("=======================================================\n");

  const timestamp = Date.now();
  let manager1Token = "";
  let manager1User = null;
  let manager1Restaurant = null;
  let manager2Token = "";
  let manager2User = null;
  let manager2Restaurant = null;
  let customerToken = "";
  let customerDoc = null;

  // ─────────────────────────────────────────────────────────────
  // 1. Restaurant Manager login
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 1. Restaurant Manager Login ---");
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "manager1@gmail.com", password: "Manager@123" }),
    });
    const loginData = await loginRes.json();
    manager1Token = loginData.token;
    manager1User = loginData.data;

    const isLoginOk =
      loginRes.status === 200 &&
      !!manager1Token &&
      manager1User?.userType === "restaurant" &&
      manager1User?.password === undefined;

    recordCheck(
      1,
      "Restaurant Manager login",
      isLoginOk,
      `Status: ${loginRes.status}, UserType: "${manager1User?.userType}", Token: ${!!manager1Token}, Password in response: ${typeof manager1User?.password}`
    );
  } catch (err) {
    recordCheck(1, "Restaurant Manager login", false, err.message);
  }

  // Also login Manager 2 for cross-tenant isolation testing
  try {
    const mgr2Login = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "manager2@gmail.com", password: "Manager@123" }),
    });
    const mgr2Data = await mgr2Login.json();
    manager2Token = mgr2Data.token;
    manager2User = mgr2Data.data;
  } catch (e) {}

  // Find restaurants in DB
  if (manager1User) {
    manager1Restaurant = await Restaurant.findOne({ managerId: manager1User._id });
  }
  if (manager2User) {
    manager2Restaurant = await Restaurant.findOne({ managerId: manager2User._id });
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Restaurant profile
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 2. Restaurant Profile Management ---");
  try {
    // 2.1 View own profile
    const getProfileRes = await fetch(`${BASE_URL}/restaurant/get-profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${manager1Token}` },
    });
    const getProfileData = await getProfileRes.json();
    const restProfile = Array.isArray(getProfileData.data) ? getProfileData.data[0] : getProfileData.data;
    const canViewOwn =
      getProfileRes.status === 200 &&
      restProfile &&
      restProfile.managerId.toString() === manager1User._id.toString();

    // 2.2 Update legitimate fields on own profile
    const updateProfileRes = await fetch(`${BASE_URL}/restaurant/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${manager1Token}`,
      },
      body: JSON.stringify({
        restaurantId: manager1Restaurant._id,
        description: `Verified Gourmet Dining ${timestamp}`,
        contactDetails: {
          email: "manager1@gmail.com",
          phone: "9876543210",
        },
        status: "active", // Privileged - should not change approval status
      }),
    });
    const updateProfileData = await updateProfileRes.json();

    const freshRestDoc = await Restaurant.findById(manager1Restaurant._id);
    const updatePersisted =
      updateProfileRes.status === 200 &&
      freshRestDoc.description === `Verified Gourmet Dining ${timestamp}`;

    recordCheck(
      2,
      "Restaurant profile",
      canViewOwn && updatePersisted,
      `View Status: ${getProfileRes.status}, Update Status: ${updateProfileRes.status}, Description updated: "${freshRestDoc?.description}"`
    );
  } catch (err) {
    recordCheck(2, "Restaurant profile", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Menu management
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 3. Menu Management ---");
  let testDishId = null;
  try {
    // 3.1 Dish Add
    const addDishRes = await fetch(`${BASE_URL}/menu/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${manager1Token}`,
      },
      body: JSON.stringify({
        restaurantId: manager1Restaurant._id,
        itemName: `Chef Special Pizza ${timestamp}`,
        price: 299,
        category: "Pizza",
        type: "Vegetarian",
        description: "Fresh mozzarella and basil pizza",
      }),
    });
    const addDishData = await addDishRes.json();
    testDishId = addDishData.data?._id;
    const addPassed = addDishRes.status === 201 && !!testDishId;

    // 3.2 Dish Edit
    const editDishRes = await fetch(`${BASE_URL}/menu/update/${testDishId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${manager1Token}`,
      },
      body: JSON.stringify({
        restaurantId: manager1Restaurant._id,
        itemName: `Chef Special Pizza Edited ${timestamp}`,
        price: 349,
        description: "Updated gourmet toppings",
        status: "Available",
      }),
    });
    const editDishData = await editDishRes.json();

    const menuAfterEdit = await Menu.findOne({ restaurantId: manager1Restaurant._id });
    const editedItem = menuAfterEdit?.menuItems.find((m) => m._id.toString() === testDishId?.toString());
    const editPassed =
      editDishRes.status === 200 &&
      editedItem?.price === 349 &&
      editedItem?.itemName === `Chef Special Pizza Edited ${timestamp}`;

    // 3.3 Dish Delete
    const deleteDishRes = await fetch(`${BASE_URL}/menu/delete/${testDishId}?restaurantId=${manager1Restaurant._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${manager1Token}`,
      },
    });

    const menuAfterDelete = await Menu.findOne({ restaurantId: manager1Restaurant._id });
    const itemStillExists = menuAfterDelete?.menuItems.some((m) => m._id.toString() === testDishId?.toString());
    const deletePassed = deleteDishRes.status === 200 && !itemStillExists;

    const allMenuOpsPassed = addPassed && editPassed && deletePassed;
    recordCheck(
      3,
      "Menu management",
      allMenuOpsPassed,
      `Add Status: ${addDishRes.status}, Edit Status: ${editDishRes.status} (New Price: ₹${editedItem?.price}), Delete Status: ${deleteDishRes.status} (Removed: ${!itemStillExists})`
    );
  } catch (err) {
    recordCheck(3, "Menu management", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Incoming orders
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 4. Incoming Orders ---");
  let testOrderId = null;
  try {
    // 4.1 Authenticate customer and place a fresh order for Manager 1's restaurant
    const custLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "customer1@gmail.com", password: "Customer@123" }),
    });
    const custData = await custLogin.json();
    customerToken = custData.token;

    let custDoc = await Customer.findOne({ customerId: custData.data._id });
    if (!custDoc) {
      custDoc = await Customer.create({
        customerId: custData.data._id,
        address: "Flat 202, Sunshine Apartments, Bhopal",
        city: "Bhopal",
        phone: "9876543210",
      });
    }

    // Ensure restaurant has a sample menu item to order
    let sampleMenu = await Menu.findOne({ restaurantId: manager1Restaurant._id });
    let sampleItemId = sampleMenu?.menuItems[0]?._id;

    const createOrderRes = await fetch(`${BASE_URL}/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        restaurantId: manager1Restaurant._id,
        paymentMethod: "cod",
        orderItems: [
          {
            itemId: sampleItemId,
            name: "Audit Test Platter",
            price: 250,
            quantity: 1,
          },
        ],
        deliveryAddress: {
          address: "Flat 202, Sunshine Apartments",
          city: "Bhopal",
          pinCode: "462001",
        },
      }),
    });
    const createOrderData = await createOrderRes.json();
    testOrderId = createOrderData.data?._id;

    // 4.2 Manager fetches incoming orders
    const getOrdersRes = await fetch(
      `${BASE_URL}/order/restaurant-orders/${manager1Restaurant._id}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${manager1Token}` },
      }
    );
    const getOrdersData = await getOrdersRes.json();

    const orderFoundInDashboard =
      getOrdersRes.status === 200 &&
      Array.isArray(getOrdersData.data) &&
      getOrdersData.data.some((o) => o._id.toString() === testOrderId?.toString());

    recordCheck(
      4,
      "Incoming orders",
      orderFoundInDashboard,
      `Customer Order Created: ${testOrderId}, Manager Dashboard Orders Count: ${getOrdersData.data?.length}, Order found in list: ${orderFoundInDashboard}`
    );
  } catch (err) {
    recordCheck(4, "Incoming orders", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Order status
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 5. Order Status Updates ---");
  try {
    // 5.1 Manager accepts the order
    const acceptRes = await fetch(`${BASE_URL}/order/restaurant-update-status/${testOrderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${manager1Token}`,
      },
      body: JSON.stringify({ status: "accepted" }),
    });
    const orderAfterAccept = await Order.findById(testOrderId);
    const acceptedOk = acceptRes.status === 200 && orderAfterAccept.orderStatus === "accepted";

    // 5.2 Manager marks order preparing
    const prepRes = await fetch(`${BASE_URL}/order/restaurant-update-status/${testOrderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${manager1Token}`,
      },
      body: JSON.stringify({ status: "preparing" }),
    });
    const orderAfterPrep = await Order.findById(testOrderId);
    const prepOk = prepRes.status === 200 && orderAfterPrep.orderStatus === "preparing";

    // 5.3 Manager marks order ready for pickup
    const readyRes = await fetch(`${BASE_URL}/order/restaurant-update-status/${testOrderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${manager1Token}`,
      },
      body: JSON.stringify({ status: "ready" }),
    });
    const orderAfterReady = await Order.findById(testOrderId);
    const readyOk = readyRes.status === 200 && orderAfterReady.orderStatus === "ready";

    const allStatusesOk = acceptedOk && prepOk && readyOk;
    recordCheck(
      5,
      "Order status",
      allStatusesOk,
      `Accepted: ${acceptedOk} (Status: ${orderAfterAccept?.orderStatus}), Preparing: ${prepOk} (Status: ${orderAfterPrep?.orderStatus}), Ready: ${readyOk} (Status: ${orderAfterReady?.orderStatus})`
    );
  } catch (err) {
    recordCheck(5, "Order status", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 6. Access security
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 6. Access Security ---");
  try {
    // 6.1 Manager attempts to access Admin dashboard stats
    const adminStatsAttempt = await fetch(`${BASE_URL}/admin/dashboard-stats`, {
      method: "GET",
      headers: { Authorization: `Bearer ${manager1Token}` },
    });
    const adminStatsBlocked = adminStatsAttempt.status === 403;

    // 6.2 Manager attempts to access Admin users list
    const adminUsersAttempt = await fetch(`${BASE_URL}/admin/users`, {
      method: "GET",
      headers: { Authorization: `Bearer ${manager1Token}` },
    });
    const adminUsersBlocked = adminUsersAttempt.status === 403;

    // 6.3 Manager 1 attempts to access Manager 2's restaurant orders
    let otherRestaurantOrdersBlocked = false;
    let otherRestStatus = 0;
    if (manager2Restaurant) {
      const otherOrdersAttempt = await fetch(
        `${BASE_URL}/order/restaurant-orders/${manager2Restaurant._id}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${manager1Token}` },
        }
      );
      otherRestStatus = otherOrdersAttempt.status;
      otherRestaurantOrdersBlocked = otherOrdersAttempt.status === 403;
    } else {
      otherRestaurantOrdersBlocked = true; // No second restaurant
    }

    // 6.4 Manager 1 attempts to modify Manager 2's menu
    let otherMenuUpdateBlocked = false;
    let otherMenuStatus = 0;
    if (manager2Restaurant) {
      const otherMenuAttempt = await fetch(`${BASE_URL}/menu/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${manager1Token}`,
        },
        body: JSON.stringify({
          restaurantId: manager2Restaurant._id,
          itemName: "Unauthorized Hack Item",
          price: 999,
          category: "Fast Food",
        }),
      });
      otherMenuStatus = otherMenuAttempt.status;
      otherMenuUpdateBlocked = otherMenuAttempt.status === 403;
    } else {
      otherMenuUpdateBlocked = true;
    }

    const allSecurityChecksPassed =
      adminStatsBlocked &&
      adminUsersBlocked &&
      otherRestaurantOrdersBlocked &&
      otherMenuUpdateBlocked;

    recordCheck(
      6,
      "Access security",
      allSecurityChecksPassed,
      `Admin Stats Blocked: ${adminStatsBlocked} (403), Admin Users Blocked: ${adminUsersBlocked} (403), Other Restaurant Orders Blocked: ${otherRestaurantOrdersBlocked} (${otherRestStatus}), Other Restaurant Menu Blocked: ${otherMenuUpdateBlocked} (${otherMenuStatus})`
    );
  } catch (err) {
    recordCheck(6, "Access security", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  const total = checklist.length;
  const passed = checklist.filter((c) => c.passed).length;
  const failed = total - passed;

  console.log("\n=======================================================");
  console.log(`📋 RESTAURANT MANAGER CHECKLIST RESULT: ${passed}/${total} COMPLETED`);
  console.log("=======================================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

runChecklist().catch((err) => {
  console.error("Checklist test run failed:", err);
  process.exit(1);
});
