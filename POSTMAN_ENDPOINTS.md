{{baseUrl}}/health

-- AUTH --
{{baseUrl}}/v1/api/auth/signup            (POST)
{{baseUrl}}/v1/api/auth/verify-otp       (POST)
{{baseUrl}}/v1/api/auth/resend-otp       (POST)
{{baseUrl}}/v1/api/auth/login             (POST)
{{baseUrl}}/v1/api/auth/logout            (POST)

-- ADMIN (requires admin token) --
# Users
{{baseUrl}}/v1/api/admin/users                          (GET)
{{baseUrl}}/v1/api/admin/users/:userId                  (GET)
{{baseUrl}}/v1/api/admin/users/:userId/ban              (PATCH)
{{baseUrl}}/v1/api/admin/users/:userId/unban            (PATCH)
{{baseUrl}}/v1/api/admin/users/role/:role               (GET)

# Seller verification
{{baseUrl}}/v1/api/admin/seller-requests/pending        (GET)
{{baseUrl}}/v1/api/admin/sellers/verified               (GET)
{{baseUrl}}/v1/api/admin/seller-requests/:id/:status    (PUT)  -- status = approve|reject (example)

# Species
{{baseUrl}}/v1/api/admin/species                        (GET)
{{baseUrl}}/v1/api/admin/species                        (POST)
{{baseUrl}}/v1/api/admin/species/:id                    (GET)
{{baseUrl}}/v1/api/admin/species/:id                    (DELETE)

# Breeds
{{baseUrl}}/v1/api/admin/breeds                         (GET)
{{baseUrl}}/v1/api/admin/breeds                         (POST)
{{baseUrl}}/v1/api/admin/breeds/:id                     (GET)
{{baseUrl}}/v1/api/admin/breeds/:id                     (DELETE)

# Pets (admin verification)
{{baseUrl}}/v1/api/admin/pets/not-verified              (GET)
{{baseUrl}}/v1/api/admin/pets/:petId/:status            (PATCH) -- status e.g. verified|rejected

# Advertisements (admin)
{{baseUrl}}/v1/api/admin/advertisements                 (GET)  -- returns advertisement requests
{{baseUrl}}/v1/api/admin/advertisements/requests        (GET)  -- pending requests (alias)
{{baseUrl}}/v1/api/admin/advertisements/listings        (GET)  -- list ad listings (filters: ?status=&adSpot=&skip=&limit=)
{{baseUrl}}/v1/api/admin/advertisements/:adId           (GET)  -- get ad listing by id
{{baseUrl}}/v1/api/admin/advertisements/listing         (POST) -- create ad listing (multipart/form-data, field 'images')
{{baseUrl}}/v1/api/admin/advertisements/:adId/:status   (PATCH) -- change status (active|paused|inactive|expired|rejected)
{{baseUrl}}/v1/api/admin/advertisements/:adId           (DELETE)

-- SELLER --
{{baseUrl}}/v1/api/seller/request                       (POST) -- seller form request
{{baseUrl}}/v1/api/seller/pet                           (POST)
{{baseUrl}}/v1/api/seller/pets                          (GET)
{{baseUrl}}/v1/api/seller/pet/:petId                     (GET)
{{baseUrl}}/v1/api/seller/pet/:petId                     (PATCH)

-- BUYER --
{{baseUrl}}/v1/api/buyer/profile                        (PATCH)
{{baseUrl}}/v1/api/buyer/profile/:buyerId               (GET)
{{baseUrl}}/v1/api/buyer/breeds                         (GET)


# Ad user endpoints (requests)
{{baseUrl}}/v1/api/ads/request/advertisement            (POST) -- request an advertisement (advisement)

Note: For endpoints that accept multipart uploads (ad listing creation), send files under field name 'images' (max 5). For admin endpoints include a valid admin JWT (cookie or Authorization header).
