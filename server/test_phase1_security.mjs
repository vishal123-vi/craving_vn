import dns from "node:dns";
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/config/dbConnection.config.js";
import User from "./src/models/user.model.js";
import Rider from "./src/models/rider.model.js";
import Restaurant from "./src/models/restaurant.model.js";
import Order from "./src/models/order.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const BASE_URL = "http://localhost:5000";

const results = [];
function record(testName, status, details = "") {
  results.push({ testName, status, details });
  console.log(`[${status ? "PASS" : "FAIL"}] ${testName} ${details ? "(" + details + ")" : ""}`);
}

async function runSecurityTests() {
  await connectDB();
  console.log("\n=======================================================");
  console.log("🔒 RUNNING PHASE 1: TARGETED SECURITY VERIFICATION SUITE");
  console.log("=======================================================\n");

  const timestamp = Date.now();
  const testPassword = "SecurePassword@123";

  // ─────────────────────────────────────────────────────────────
  // 1. PUBLIC REGISTRATION ROLE ESCALATION
  // ─────────────────────────────────────────────────────────────
  console.log("--- 1. Public Registration Role Escalation ---");

  // 1.1 Attempt to register as 'admin'
  try {
    const adminRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Attacker Admin",
        email: `exploit_admin_${timestamp}@example.com`,
        password: testPassword,
        phone: "9999900001",
        userType: "admin",
      }),
    });
    const adminRegData = await adminRegRes.json();
    const isBlocked = adminRegRes.status === 403;
    record(
      "Prevent public registration from assigning 'admin' role",
      isBlocked,
      `Status: ${adminRegRes.status}, Message: "${adminRegData.message}"`
    );
  } catch (err) {
    record("Prevent public registration from assigning 'admin' role", false, err.message);
  }

  // 1.2 Legitimate Customer registration
  let custUserEmail = `legit_cust_${timestamp}@example.com`;
  let custToken = "";
  let custId = "";
  try {
    const custRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Legit Customer",
        email: custUserEmail,
        password: testPassword,
        phone: "9999900002",
        userType: "customer",
      }),
    });
    const custRegSuccess = custRegRes.status === 201;

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: custUserEmail, password: testPassword }),
    });
    const loginData = await loginRes.json();
    custToken = loginData.token;
    custId = loginData.data?._id;

    record("Preserve legitimate Customer registration & login", custRegSuccess && !!custToken, `Status: ${custRegRes.status}`);
  } catch (err) {
    record("Preserve legitimate Customer registration & login", false, err.message);
  }

  // 1.3 Legitimate Rider registration
  let riderEmail = `legit_rider_${timestamp}@example.com`;
  let riderToken = "";
  let riderUserId = "";
  try {
    const riderRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Legit Rider",
        email: riderEmail,
        password: testPassword,
        phone: "9999900003",
        userType: "rider",
      }),
    });
    const riderRegSuccess = riderRegRes.status === 201;

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: riderEmail, password: testPassword }),
    });
    const loginData = await loginRes.json();
    riderToken = loginData.token;
    riderUserId = loginData.data?._id;

    record("Preserve legitimate Rider registration & login", riderRegSuccess && !!riderToken, `Status: ${riderRegRes.status}`);
  } catch (err) {
    record("Preserve legitimate Rider registration & login", false, err.message);
  }

  // 1.4 Legitimate Restaurant registration
  let restManagerEmail = `legit_rest_${timestamp}@example.com`;
  let restToken = "";
  let restManagerId = "";
  try {
    const restRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Legit Restaurant Manager",
        email: restManagerEmail,
        password: testPassword,
        phone: "9999900004",
        userType: "restaurant",
      }),
    });
    const restRegSuccess = restRegRes.status === 201;

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: restManagerEmail, password: testPassword }),
    });
    const loginData = await loginRes.json();
    restToken = loginData.token;
    restManagerId = loginData.data?._id;

    record("Preserve legitimate Restaurant registration & login", restRegSuccess && !!restToken, `Status: ${restRegRes.status}`);
  } catch (err) {
    record("Preserve legitimate Restaurant registration & login", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SANDBOX PAYMENT VERIFICATION RESTRICTION
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 2. Sandbox Payment Verification ---");

  try {
    const { VerifySandboxPayment } = await import("./src/controller/payment.controller.js");

    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    let productionBlocked = false;
    let prodStatusCode = 0;
    let prodMsg = "";

    const reqMock = {
      body: { orderId: "dummy_order_id" },
      user: { _id: custId },
    };
    const resMock = {
      status(code) {
        prodStatusCode = code;
        return {
          json(data) {
            prodMsg = data.message;
          },
        };
      },
    };
    const nextMock = (err) => {
      if (err) {
        prodStatusCode = err.statusCode || 500;
        prodMsg = err.message;
        if (prodStatusCode === 403 && prodMsg.includes("disabled in production")) {
          productionBlocked = true;
        }
      }
    };

    await VerifySandboxPayment(reqMock, resMock, nextMock);

    process.env.NODE_ENV = originalNodeEnv;

    record(
      "Restrict sandbox payment verification in production (NODE_ENV=production -> 403)",
      productionBlocked,
      `Status: ${prodStatusCode}, Message: "${prodMsg}"`
    );
  } catch (err) {
    record("Restrict sandbox payment verification in production", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. PROFILE UPDATE IDOR MITIGATION
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 3. Profile Update IDOR Prevention ---");

  try {
    // Create Victim Customer B
    const victimEmail = `victim_cust_${timestamp}@example.com`;
    const victimUser = await User.create({
      fullName: "Original Victim Name",
      email: victimEmail,
      password: await bcrypt.hash(testPassword, 10),
      phone: "9111122222",
      photo: { url: "https://example.com/victim.jpg" },
      userType: "customer",
    });

    // Attacker (custToken) sends profile update with email = victimEmail to PUT /common/edit-profile
    const idorAttemptRes = await fetch(`${BASE_URL}/common/edit-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        email: victimEmail, // Malicious target email in body
        fullName: "HACKED NAME BY ATTACKER",
        phone: "9999999999",
      }),
    });
    const idorData = await idorAttemptRes.json();

    // Verify victim's document in database is completely untouched
    const freshVictimInDb = await User.findById(victimUser._id);
    const victimUntouched =
      freshVictimInDb.fullName === "Original Victim Name" &&
      freshVictimInDb.phone === "9111122222";

    // Verify attacker's own document was updated instead
    const attackerInDb = await User.findById(custId);
    const attackerUpdatedSelf = attackerInDb.fullName === "HACKED NAME BY ATTACKER";

    const idorPrevented = victimUntouched && attackerUpdatedSelf;
    record(
      "Fix profile-update IDOR (Identity derived from token, victim unaffected)",
      idorPrevented,
      `Victim unchanged: ${victimUntouched}, Target is authenticated caller: ${attackerUpdatedSelf}`
    );
  } catch (err) {
    record("Fix profile-update IDOR", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. WHITELIST EDITABLE FIELDS (RIDER & RESTAURANT)
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 4. Mass Assignment / Whitelist Protection ---");

  // 4.1 Rider field whitelist check
  try {
    // Rider attempts to set status to 'active' and averageRating to 5.0 via POST /rider/update-profile
    const riderExploitRes = await fetch(`${BASE_URL}/rider/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${riderToken}`,
      },
      body: JSON.stringify({
        status: "active", // Privileged field!
        averageRating: 5.0, // Privileged field!
        vehicleDetails: {
          vehicleType: "Bike",
          vehicleNumber: "MP04AB1234",
          vehicleModel: "Honda Activa",
          vehicleColor: "Black",
        },
      }),
    });

    const freshRiderDoc = await Rider.findOne({ riderId: riderUserId });
    const riderPrivilegedBlocked =
      freshRiderDoc &&
      freshRiderDoc.status === "inactive" &&
      freshRiderDoc.averageRating === 0 &&
      freshRiderDoc.vehicleDetails?.vehicleNumber === "MP04AB1234";

    record(
      "Whitelist Rider editable fields (status and rating cannot be mass-assigned)",
      riderPrivilegedBlocked,
      `Status: ${freshRiderDoc?.status}, Rating: ${freshRiderDoc?.averageRating}, Vehicle: ${freshRiderDoc?.vehicleDetails?.vehicleNumber}`
    );
  } catch (err) {
    record("Whitelist Rider editable fields", false, err.message);
  }

  // 4.2 Restaurant Manager field whitelist check
  try {
    // Create an initial restaurant doc for restManagerId
    const initialRest = await Restaurant.create({
      managerId: restManagerId,
      restaurantName: "Initial Security Cafe",
      address: "123 Security Blvd",
      city: "Bhopal",
      state: "Madhya Pradesh",
      pinCode: "462001",
      country: "India",
      status: "inactive",
      averageRating: 0,
      numReviews: 0,
      cuisineTypes: ["Cafe"],
      restaurantType: "veg",
      description: "Initial description",
      contactDetails: { email: restManagerEmail, phone: "9999900004" },
      documents: {
        legalName: "Security Cafe LLC",
        companyType: "Private",
        gstCertificate: "GST123",
        fssaiCertificate: "FSSAI123",
        panCard: "PAN123",
      },
      financialDetails: {
        bankName: "State Bank",
        accountNumber: "123456789",
        ifscCode: "SBIN0001",
      },
      servingHours: { openingTime: "10:00", closingTime: "22:00" },
      coverImage: { url: "https://example.com/cover.jpg", publicId: "cov1" },
      restaurantImage: [{ url: "https://example.com/img1.jpg", publicId: "img1" }],
    });

    // Manager updates restaurant profile attempting to inject status, averageRating, numReviews, and managerId
    const restExploitRes = await fetch(`${BASE_URL}/restaurant/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${restToken}`,
      },
      body: JSON.stringify({
        restaurantId: initialRest._id,
        restaurantName: "Updated Security Cafe",
        status: "active", // Privileged field!
        averageRating: 5.0, // Privileged field!
        numReviews: 9999, // Privileged field!
        managerId: custId, // Attempt to reassign owner to another user!
      }),
    });

    const freshRestDoc = await Restaurant.findById(initialRest._id);
    const restPrivilegedBlocked =
      freshRestDoc &&
      freshRestDoc.restaurantName === "Updated Security Cafe" &&
      freshRestDoc.status === "inactive" &&
      freshRestDoc.averageRating === 0 &&
      freshRestDoc.numReviews === 0 &&
      freshRestDoc.managerId.toString() === restManagerId.toString();

    record(
      "Whitelist Restaurant editable fields (status, rating, review count & managerId protected)",
      restPrivilegedBlocked,
      `Updated Name: ${freshRestDoc?.restaurantName}, Status: ${freshRestDoc?.status}, Rating: ${freshRestDoc?.averageRating}, Reviews: ${freshRestDoc?.numReviews}, ManagerId intact: ${freshRestDoc?.managerId.toString() === restManagerId.toString()}`
    );
  } catch (err) {
    record("Whitelist Restaurant editable fields", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 5. PASSWORD HASH EXPOSURE & PASSWORD LIFECYCLE
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 5. Password Hash Absence & Password Lifecycle ---");

  // 5.1 Check /auth/login response
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: custUserEmail, password: testPassword }),
    });
    const loginData = await loginRes.json();
    const hashAbsentInLogin = loginData.data?.password === undefined;

    record(
      "Password hash absent from /auth/login response",
      hashAbsentInLogin,
      `data.password is ${typeof loginData.data?.password}`
    );
  } catch (err) {
    record("Password hash absent from /auth/login response", false, err.message);
  }

  // 5.2 Check /common/edit-profile response
  try {
    const profRes = await fetch(`${BASE_URL}/common/edit-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        email: custUserEmail,
        fullName: "Legit Customer Updated",
        phone: "9999900002",
      }),
    });
    const profData = await profRes.json();
    const hashAbsentInProfile = profData.data?.password === undefined;

    record(
      "Password hash absent from /common/edit-profile response",
      hashAbsentInProfile,
      `data.password is ${typeof profData.data?.password}`
    );
  } catch (err) {
    record("Password hash absent from /common/edit-profile response", false, err.message);
  }

  // 5.3 Password Comparison & Change functionality preserved
  try {
    const freshUserEmail = `pwd_test_${timestamp}@example.com`;
    await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Password Tester",
        email: freshUserEmail,
        password: "OldPassword@123",
        phone: "9888877777",
        userType: "customer",
      }),
    });

    const freshLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: freshUserEmail, password: "OldPassword@123" }),
    });
    const freshLoginData = await freshLoginRes.json();
    const freshToken = freshLoginData.token;

    // Test password change
    const changeRes = await fetch(`${BASE_URL}/common/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${freshToken}`,
      },
      body: JSON.stringify({
        oldPassword: "OldPassword@123",
        newPassword: "BrandNewPassword@456",
      }),
    });
    const changeSuccess = changeRes.status === 200;

    // Verify login with new password
    const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: freshUserEmail, password: "BrandNewPassword@456" }),
    });
    const newLoginSuccess = newLoginRes.status === 200;

    record(
      "Password comparison and password-change flow fully preserved",
      changeSuccess && newLoginSuccess,
      `Change Status: ${changeRes.status}, New Login Status: ${newLoginRes.status}`
    );
  } catch (err) {
    record("Password comparison and password-change flow fully preserved", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 6. RAZORPAY WEBHOOK SIGNATURE VERIFICATION
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 6. Razorpay Webhook Signature Verification ---");

  // 6.1 Unconfigured webhook secret rejects incoming webhook requests safely
  try {
    const unconfiguredRes = await fetch(`${BASE_URL}/payment/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "payment.failed" }),
    });
    const unconfiguredData = await unconfiguredRes.json();
    const safelyRejected = unconfiguredRes.status === 400 && unconfiguredData.message?.includes("Webhook secret");

    record(
      "Reject webhook when webhook secret is not configured on server",
      safelyRejected,
      `Status: ${unconfiguredRes.status}, Message: "${unconfiguredData.message}"`
    );
  } catch (err) {
    record("Reject webhook when webhook secret is not configured on server", false, err.message);
  }

  // 6.2 Test HandleRazorpayWebhook controller directly with simulated webhook secret
  try {
    const { HandleRazorpayWebhook } = await import("./src/controller/payment.controller.js");
    const testSecret = "verified_test_webhook_secret_9988";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const webhookBody = {
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: `pay_test_${timestamp}`,
            order_id: `order_test_${timestamp}`,
          },
        },
      },
    };
    const rawPayloadBuffer = Buffer.from(JSON.stringify(webhookBody), "utf8");

    // Test A: Missing signature header
    let missingStatus = 0;
    let missingMsg = "";
    await HandleRazorpayWebhook(
      {
        headers: {},
        rawBody: rawPayloadBuffer,
        body: webhookBody,
      },
      {
        status(c) { missingStatus = c; return { json(d) { missingMsg = d.message; } }; },
      }
    );
    const missingRejected = missingStatus === 400 && missingMsg.includes("missing");
    record(
      "Reject webhook when signature header is missing (with configured secret)",
      missingRejected,
      `Status: ${missingStatus}, Message: "${missingMsg}"`
    );

    // Test B: Invalid signature
    let invalidStatus = 0;
    let invalidMsg = "";
    await HandleRazorpayWebhook(
      {
        headers: { "x-razorpay-signature": "bogus_signature_1234567890abcdef" },
        rawBody: rawPayloadBuffer,
        body: webhookBody,
      },
      {
        status(c) { invalidStatus = c; return { json(d) { invalidMsg = d.message; } }; },
      }
    );
    const invalidRejected = invalidStatus === 400 && invalidMsg.includes("Invalid");
    record(
      "Reject webhook when signature is invalid or tampered",
      invalidRejected,
      `Status: ${invalidStatus}, Message: "${invalidMsg}"`
    );

    // Test C: Valid HMAC-SHA256 signature
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(rawPayloadBuffer)
      .digest("hex");

    let validStatus = 0;
    let validStatusJson = null;
    await HandleRazorpayWebhook(
      {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: rawPayloadBuffer,
        body: webhookBody,
      },
      {
        status(c) { validStatus = c; return { json(d) { validStatusJson = d; } }; },
      }
    );
    const validAccepted = validStatus === 200;
    record(
      "Accept legitimate webhook with valid HMAC-SHA256 signature",
      validAccepted,
      `Status: ${validStatus}, Response: ${JSON.stringify(validStatusJson)}`
    );

    // Clean up
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  } catch (err) {
    record("Webhook signature verification tests", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  const total = results.length;
  const passed = results.filter((r) => r.status).length;
  const failed = total - passed;

  console.log("\n=======================================================");
  console.log("📊 PHASE 1 SECURITY TEST RESULTS SUMMARY:");
  console.log(`TOTAL CHECKS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("=======================================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

runSecurityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
