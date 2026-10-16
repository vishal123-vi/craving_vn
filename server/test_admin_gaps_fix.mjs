import dns from "node:dns";
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/config/dbConnection.config.js";
import User from "./src/models/user.model.js";
import Contact from "./src/models/contact.model.js";
import Feedback from "./src/models/feedback.model.js";
import Order from "./src/models/order.model.js";

const BASE_URL = "http://localhost:5000";

const testResults = [];
function recordResult(testId, name, status, details = "") {
  testResults.push({ testId, name, status, details });
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
  console.log(`${icon} [${status}] Test ${testId}: ${name}`);
  if (details) {
    console.log(`        Details: ${details}`);
  }
}

async function runTests() {
  await connectDB();
  console.log("\n=======================================================");
  console.log("🔍 ADMIN AUDIT GAPS VERIFICATION SUITE");
  console.log("=======================================================\n");

  const timestamp = Date.now();
  let adminToken = "";
  let customerToken = "";
  let managerToken = "";
  let riderToken = "";

  // 1. Obtain tokens for role verification
  try {
    const [adminLogin, customerLogin, managerLogin, riderLogin] = await Promise.all([
      fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@cravingsfsd08.com", password: "StrongPassword@123" }),
      }),
      fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "customer1@gmail.com", password: "Customer@123" }),
      }),
      fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "manager1@gmail.com", password: "Manager@123" }),
      }),
      fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "rider1@gmail.com", password: "123456" }),
      }),
    ]);

    adminToken = (await adminLogin.json()).token;
    customerToken = (await customerLogin.json()).token;
    managerToken = (await managerLogin.json()).token;
    riderToken = (await riderLogin.json()).token;

    console.log("Tokens acquired:");
    console.log(` - Admin: ${!!adminToken}`);
    console.log(` - Customer: ${!!customerToken}`);
    console.log(` - Manager: ${!!managerToken}`);
    console.log(` - Rider: ${!!riderToken}\n`);
  } catch (err) {
    console.error("Login setup failed:", err);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE A: AUTHORIZATION CHECKS
  // ─────────────────────────────────────────────────────────────
  console.log("--- Suite A: Authorization & Security Checks ---");

  // A1: Unauthenticated requests rejected with 401
  try {
    const [msgUnauth, fbUnauth, ordUnauth] = await Promise.all([
      fetch(`${BASE_URL}/admin/messages`),
      fetch(`${BASE_URL}/admin/feedback`),
      fetch(`${BASE_URL}/admin/orders`),
    ]);

    const pass = msgUnauth.status === 401 && fbUnauth.status === 401 && ordUnauth.status === 401;
    recordResult(
      "A1",
      "Unauthenticated requests rejected with 401 Session Expired",
      pass ? "PASS" : "FAIL",
      `Messages: HTTP ${msgUnauth.status}, Feedback: HTTP ${fbUnauth.status}, Orders: HTTP ${ordUnauth.status}`
    );
  } catch (err) {
    recordResult("A1", "Unauthenticated requests rejected", "FAIL", err.message);
  }

  // A2: Customer role rejected with 403 Forbidden
  try {
    const [msgCust, fbCust, ordCust] = await Promise.all([
      fetch(`${BASE_URL}/admin/messages`, { headers: { Authorization: `Bearer ${customerToken}` } }),
      fetch(`${BASE_URL}/admin/feedback`, { headers: { Authorization: `Bearer ${customerToken}` } }),
      fetch(`${BASE_URL}/admin/orders`, { headers: { Authorization: `Bearer ${customerToken}` } }),
    ]);

    const pass = msgCust.status === 403 && fbCust.status === 403 && ordCust.status === 403;
    recordResult(
      "A2",
      "Customer role blocked from admin endpoints with 403",
      pass ? "PASS" : "FAIL",
      `Messages: HTTP ${msgCust.status}, Feedback: HTTP ${fbCust.status}, Orders: HTTP ${ordCust.status}`
    );
  } catch (err) {
    recordResult("A2", "Customer role blocked", "FAIL", err.message);
  }

  // A3: Restaurant Manager & Rider roles rejected with 403 Forbidden
  try {
    const [msgMgr, ordRider] = await Promise.all([
      fetch(`${BASE_URL}/admin/messages`, { headers: { Authorization: `Bearer ${managerToken}` } }),
      fetch(`${BASE_URL}/admin/orders`, { headers: { Authorization: `Bearer ${riderToken}` } }),
    ]);

    const pass = msgMgr.status === 403 && ordRider.status === 403;
    recordResult(
      "A3",
      "Restaurant Manager and Rider roles blocked with 403",
      pass ? "PASS" : "FAIL",
      `Manager on /messages: HTTP ${msgMgr.status}, Rider on /orders: HTTP ${ordRider.status}`
    );
  } catch (err) {
    recordResult("A3", "Manager/Rider roles blocked", "FAIL", err.message);
  }

  // A4: Admin role authorized with 200 OK
  try {
    const [msgAdmin, fbAdmin, ordAdmin] = await Promise.all([
      fetch(`${BASE_URL}/admin/messages`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      fetch(`${BASE_URL}/admin/feedback`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      fetch(`${BASE_URL}/admin/orders`, { headers: { Authorization: `Bearer ${adminToken}` } }),
    ]);

    const pass = msgAdmin.status === 200 && fbAdmin.status === 200 && ordAdmin.status === 200;
    recordResult(
      "A4",
      "Admin role authorized with 200 OK across all endpoints",
      pass ? "PASS" : "FAIL",
      `Messages: HTTP ${msgAdmin.status}, Feedback: HTTP ${fbAdmin.status}, Orders: HTTP ${ordAdmin.status}`
    );
  } catch (err) {
    recordResult("A4", "Admin role authorized", "FAIL", err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE B: PAGINATION & LIMITS CHECKS
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- Suite B: Pagination & Input Boundary Checks ---");

  // B1: Orders pagination page 1 vs page 2
  try {
    const [page1Res, page2Res] = await Promise.all([
      fetch(`${BASE_URL}/admin/orders?page=1&limit=5`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      fetch(`${BASE_URL}/admin/orders?page=2&limit=5`, { headers: { Authorization: `Bearer ${adminToken}` } }),
    ]);

    const page1Data = await page1Res.json();
    const page2Data = await page2Res.json();

    const p1Count = page1Data.data?.length || 0;
    const p2Count = page2Data.data?.length || 0;
    const p1FirstId = page1Data.data?.[0]?._id;
    const p2FirstId = page2Data.data?.[0]?._id;

    const isDistinct = p1FirstId && p2FirstId && p1FirstId !== p2FirstId;
    const metaOk =
      page1Data.pagination?.page === 1 &&
      page1Data.pagination?.limit === 5 &&
      page2Data.pagination?.page === 2 &&
      page2Data.pagination?.total >= 70;

    const pass = isDistinct && metaOk && p1Count === 5 && p2Count === 5;
    recordResult(
      "B1",
      "Orders pagination returns distinct slices with accurate metadata",
      pass ? "PASS" : "FAIL",
      `Page 1 count: ${p1Count} (First: ${p1FirstId}), Page 2 count: ${p2Count} (First: ${p2FirstId}), Total: ${page1Data.pagination?.total}, TotalPages: ${page1Data.pagination?.totalPages}`
    );
  } catch (err) {
    recordResult("B1", "Orders pagination", "FAIL", err.message);
  }

  // B2: Limit boundary clamping (negative values & oversized values)
  try {
    const [negRes, overRes] = await Promise.all([
      fetch(`${BASE_URL}/admin/orders?page=-5&limit=-20`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      fetch(`${BASE_URL}/admin/orders?page=1&limit=500`, { headers: { Authorization: `Bearer ${adminToken}` } }),
    ]);

    const negData = await negRes.json();
    const overData = await overRes.json();

    const negClamped = negData.pagination?.page === 1 && negData.pagination?.limit === 1;
    const overClamped = overData.pagination?.limit === 100;

    const pass = negClamped && overClamped;
    recordResult(
      "B2",
      "Pagination parameters safely clamped to minimum 1 and maximum 100",
      pass ? "PASS" : "FAIL",
      `Negative input clamped to page: ${negData.pagination?.page}, limit: ${negData.pagination?.limit}. Oversized input clamped to limit: ${overData.pagination?.limit}`
    );
  } catch (err) {
    recordResult("B2", "Pagination clamping", "FAIL", err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE C: EMPTY RESULTS HANDLING
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- Suite C: Empty Results & Safe Filtering ---");

  // C1: Non-existent order search returns empty array with 200 OK
  try {
    const emptyOrderRes = await fetch(
      `${BASE_URL}/admin/orders?search=NONEXISTENT_QUERY_${timestamp}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const emptyOrderData = await emptyOrderRes.json();
    const pass =
      emptyOrderRes.status === 200 &&
      emptyOrderData.success === true &&
      Array.isArray(emptyOrderData.data) &&
      emptyOrderData.data.length === 0 &&
      emptyOrderData.pagination?.total === 0;

    recordResult(
      "C1",
      "Non-matching order search safely yields empty array with total=0",
      pass ? "PASS" : "FAIL",
      `HTTP ${emptyOrderRes.status}, data length: ${emptyOrderData.data?.length}, total: ${emptyOrderData.pagination?.total}`
    );
  } catch (err) {
    recordResult("C1", "Non-matching order search", "FAIL", err.message);
  }

  // C2: Non-existent messages search returns empty array
  try {
    const emptyMsgRes = await fetch(
      `${BASE_URL}/admin/messages?search=NONEXISTENT_MSG_${timestamp}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const emptyMsgData = await emptyMsgRes.json();
    const pass =
      emptyMsgRes.status === 200 &&
      emptyMsgData.success === true &&
      Array.isArray(emptyMsgData.data) &&
      emptyMsgData.data.length === 0 &&
      emptyMsgData.pagination?.total === 0;

    recordResult(
      "C2",
      "Non-matching messages search safely yields empty array with total=0",
      pass ? "PASS" : "FAIL",
      `HTTP ${emptyMsgRes.status}, data length: ${emptyMsgData.data?.length}, total: ${emptyMsgData.pagination?.total}`
    );
  } catch (err) {
    recordResult("C2", "Non-matching messages search", "FAIL", err.message);
  }

  // C3: Non-existent feedback search returns empty array
  try {
    const emptyFbRes = await fetch(
      `${BASE_URL}/admin/feedback?search=NONEXISTENT_FB_${timestamp}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const emptyFbData = await emptyFbRes.json();
    const pass =
      emptyFbRes.status === 200 &&
      emptyFbData.success === true &&
      Array.isArray(emptyFbData.data) &&
      emptyFbData.data.length === 0 &&
      emptyFbData.pagination?.total === 0;

    recordResult(
      "C3",
      "Non-matching feedback search safely yields empty array with total=0",
      pass ? "PASS" : "FAIL",
      `HTTP ${emptyFbRes.status}, data length: ${emptyFbData.data?.length}, total: ${emptyFbData.pagination?.total}`
    );
  } catch (err) {
    recordResult("C3", "Non-matching feedback search", "FAIL", err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE D: SUCCESSFUL DATA RETRIEVAL & INTEGRITY
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- Suite D: Successful Data Retrieval & Integrity ---");

  let createdContactId = null;
  let createdFeedbackId = null;

  try {
    // D1: Ingest and retrieve contact message
    const uniqueEmail = `audit_inquiry_${timestamp}@example.com`;
    const postMsgRes = await fetch(`${BASE_URL}/public/contact-us`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: `Audit Tester ${timestamp}`,
        email: uniqueEmail,
        phone: "9123456789",
        subject: `Audit Subject ${timestamp}`,
        message: "Detailed test inquiry for audit verification",
      }),
    });
    const postMsgOk = postMsgRes.status === 201;

    // Retrieve via Admin endpoint with search
    const getMsgRes = await fetch(`${BASE_URL}/admin/messages?search=${uniqueEmail}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const getMsgData = await getMsgRes.json();
    const foundMsg = getMsgData.data?.[0];
    if (foundMsg?._id) createdContactId = foundMsg._id;

    const msgValid =
      foundMsg &&
      foundMsg.email === uniqueEmail &&
      foundMsg.fullName === `Audit Tester ${timestamp}` &&
      foundMsg.phone === "9123456789" &&
      foundMsg.message === "Detailed test inquiry for audit verification";

    recordResult(
      "D1",
      "Contact message ingested via public endpoint and retrieved via /admin/messages",
      postMsgOk && msgValid ? "PASS" : "FAIL",
      `Ingest HTTP ${postMsgRes.status}, Retrieved ID: ${foundMsg?._id}, Email: ${foundMsg?.email}, Subject: "${foundMsg?.subject}"`
    );

    // D2: Ingest and retrieve feedback with rating & category filter
    const uniqueFbEmail = `audit_feedback_${timestamp}@example.com`;
    const postFbRes = await fetch(`${BASE_URL}/public/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: `Feedback Reviewer ${timestamp}`,
        email: uniqueFbEmail,
        category: "Delivery",
        rating: 4,
        message: "Prompt and careful delivery handling.",
      }),
    });
    const postFbOk = postFbRes.status === 201;

    // Retrieve via Admin endpoint with rating & category filter
    const getFbRes = await fetch(
      `${BASE_URL}/admin/feedback?rating=4&category=Delivery&search=${uniqueFbEmail}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const getFbData = await getFbRes.json();
    const foundFb = getFbData.data?.[0];
    if (foundFb?._id) createdFeedbackId = foundFb._id;

    const fbValid =
      foundFb &&
      foundFb.email === uniqueFbEmail &&
      foundFb.rating === 4 &&
      foundFb.category === "Delivery" &&
      typeof getFbData.averageRating === "number";

    recordResult(
      "D2",
      "Customer feedback ingested and retrieved with rating/category filter & averageRating",
      postFbOk && fbValid ? "PASS" : "FAIL",
      `Ingest HTTP ${postFbRes.status}, Retrieved ID: ${foundFb?._id}, Rating: ${foundFb?.rating}, Avg Rating: ${getFbData.averageRating}`
    );

    // D3: Retrieve orders with relation populations and item details
    const ordRes = await fetch(`${BASE_URL}/admin/orders?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const ordData = await ordRes.json();
    const sampleOrder = ordData.data?.[0];

    const hasRest = !!sampleOrder?.restaurantId?.restaurantName;
    const hasCust = !!(sampleOrder?.customerId?.customerId?.fullName || sampleOrder?.deliveryAddress?.name);
    const hasItems = Array.isArray(sampleOrder?.orderItems) && sampleOrder.orderItems.length > 0;
    const hasBill = typeof sampleOrder?.billDetails?.finalAmount === "number";
    const noPasswordLeaked =
      sampleOrder?.customerId?.customerId?.password === undefined &&
      sampleOrder?.riderId?.password === undefined;

    const ordersValid = hasRest && hasCust && hasItems && hasBill && noPasswordLeaked;

    recordResult(
      "D3",
      "All orders retrieved with populated restaurant, customer, enriched items, and zero password leak",
      ordersValid ? "PASS" : "FAIL",
      `Sample Order #${sampleOrder?._id?.slice(-5)}: Restaurant: "${sampleOrder?.restaurantId?.restaurantName}", Customer: "${sampleOrder?.customerId?.customerId?.fullName || sampleOrder?.deliveryAddress?.name}", Items: ${sampleOrder?.orderItems?.length} (Item 1: "${sampleOrder?.orderItems?.[0]?.name}" @ ₹${sampleOrder?.orderItems?.[0]?.price}), Password absent: ${noPasswordLeaked}`
    );

    // D4: Status filtering for orders
    const [prepRes, deliverRes] = await Promise.all([
      fetch(`${BASE_URL}/admin/orders?status=prep`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      fetch(`${BASE_URL}/admin/orders?status=deliver`, { headers: { Authorization: `Bearer ${adminToken}` } }),
    ]);

    const prepData = await prepRes.json();
    const deliverData = await deliverRes.json();

    const prepAllMatch = prepData.data.every((o) => o.orderStatus === "preparing");
    const deliverAllMatch = deliverData.data.every((o) => o.orderStatus === "delivered");

    recordResult(
      "D4",
      "Orders status filtering correctly partitions results by orderStatus",
      prepAllMatch && deliverAllMatch ? "PASS" : "FAIL",
      `Preparing count: ${prepData.pagination?.total} (all match: ${prepAllMatch}), Delivered count: ${deliverData.pagination?.total} (all match: ${deliverAllMatch})`
    );
  } finally {
    // Cleanup audit artifacts created in test
    if (createdContactId) {
      await Contact.findByIdAndDelete(createdContactId);
      console.log(`\n🧹 Cleaned up test contact document ${createdContactId}`);
    }
    if (createdFeedbackId) {
      await Feedback.findByIdAndDelete(createdFeedbackId);
      console.log(`🧹 Cleaned up test feedback document ${createdFeedbackId}`);
    }
  }

  // Summary
  console.log("\n=======================================================");
  console.log("📊 SUMMARY OF TEST RESULTS");
  console.log("=======================================================");
  const totalTests = testResults.length;
  const passedTests = testResults.filter((r) => r.status === "PASS").length;
  const failedTests = testResults.filter((r) => r.status === "FAIL").length;

  console.log(`Total Checks: ${totalTests}`);
  console.log(`Passed:       ${passedTests}`);
  console.log(`Failed:       ${failedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%\n`);

  process.exit(failedTests > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
