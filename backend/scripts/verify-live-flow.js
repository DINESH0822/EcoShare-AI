const fetch = global.fetch;

async function postJson(url, body, authToken) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  return { status: response.status, body: json };
}

async function getJson(url, authToken) {
  const response = await fetch(url, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  return { status: response.status, body: json };
}

async function putJson(url, body, authToken) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  return { status: response.status, body: json };
}

(async () => {
  const unique = Date.now();
  const donorEmail = `donor_${unique}@example.com`;
  const donor = await postJson('http://localhost:5000/api/auth/donor/register', {
    name: 'Test Donor',
    email: donorEmail,
    password: 'Password123!',
    phone: '9876543210',
    address: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    latitude: 19.0596,
    longitude: 72.8295
  });
  const donorToken = donor.body.data?.token || donor.body.token;
  console.log('DONOR_TOKEN_OK', !!donorToken, donor.status, donor.body.message || donor.body.code || 'ok');

  const foodRes = await fetch('http://localhost:5000/api/food', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${donorToken}`
    },
    body: JSON.stringify({
      foodName: 'Fresh cooked meals',
      quantity: 40,
      donorName: 'Test Donor',
      category: 'cooked_meals',
      storageCondition: 'ambient',
      expiryTime: new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 16),
      address: 'Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      latitude: 19.066,
      longitude: 72.867,
      phone: '9876543210',
      donorType: 'Individual',
      isEmergency: false,
      notes: 'Prepared this afternoon for redistribution.'
    })
  });
  const foodText = await foodRes.text();
  const food = foodText ? JSON.parse(foodText) : {};
  const foodId = food.data?._id || food._id;
  console.log('FOOD_ID', foodId || 'NO_ID', foodRes.status);

  const ngoEmail = `ngo_${unique}@example.com`;
  const ngo = await postJson('http://localhost:5000/api/auth/ngo/register', {
    ngoName: 'Test Rescue NGO 2026',
    contactPerson: 'Asha Mehta',
    email: ngoEmail,
    phone: '9988776655',
    password: 'Password123!',
    address: 'Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.1136,
    longitude: 72.8697,
    organizationType: 'ngo',
    dailyCapacity: 200,
    foodCategoriesAccepted: ['cooked_meals', 'mixed'],
    hasRefrigeration: true,
    refrigerationAvailable: true,
    emergencyPickupAvailable: true
  });
  const ngoId = ngo.body.data?.ngo?._id || ngo.body.ngo?._id || ngo.body._id;
  const ngoToken = ngo.body.data?.token || ngo.body.token;
  console.log('NGO_ID', ngoId || 'NO_ID', ngo.status, ngo.body.message || ngo.body.code || 'ok');

  const admin = await postJson('http://localhost:5000/api/users/login', {
    email: 'admin@ecoshare.org',
    password: 'Admin@EcoShare2025!'
  });
  const adminToken = admin.body.data?.token || admin.body.token;
  console.log('ADMIN_TOKEN_OK', !!adminToken, admin.status);

  const approve = await putJson(`http://localhost:5000/api/ngo/${ngoId}/approve`, {}, adminToken);
  console.log('APPROVE_STATUS', approve.status, approve.body.data?.status, approve.body.data?.verificationStatus, approve.body.message);

  const claim = await postJson('http://localhost:5000/api/claim', {
    foodId,
    ngoId,
    recipientCount: 20,
    notes: 'We can distribute within 2 hours.'
  }, ngoToken);
  const operationId = claim.body.data?.operation?._id || claim.body.operation?._id;
  console.log('CLAIM_STATUS', claim.status, 'OPERATION_ID', operationId || 'NO_OP');

  const invalid = await getJson('http://localhost:5000/api/operations/op-101', adminToken);
  console.log('INVALID_OP_STATUS', invalid.status, JSON.stringify(invalid.body));

  const op = await getJson(`http://localhost:5000/api/operations/${operationId}`, adminToken);
  console.log('OP_STATUS', op.status, JSON.stringify(op.body));
})();
