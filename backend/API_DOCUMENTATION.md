# Tabunganku Backend API Documentation

Dokumentasi ini dibuat untuk kebutuhan frontend agar dapat menggunakan API Tabunganku dengan benar.

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://tabungan-iki-ina.vercel.app/api` (isi dengan `BASE_URL` jika digunakan)

> Semua endpoint API berada di bawah path `/api` kecuali dokumentasi Swagger yang berada di `/api-docs`.

## Autentikasi

- Header: `Authorization`
- Format: `Bearer <access_token>`
- Access token diperoleh dari endpoint login.

Contoh header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Response Umum

Semua respons sukses umumnya berbentuk:

```json
{
  "success": true,
  "message": "Pesan deskriptif",
  "data": { ... }
}
```

Respons gagal umumnya berbentuk:

```json
{
  "success": false,
  "message": "Pesan error",
  "errors": null
}
```

## Authentication

### Register

- Method: `POST`
- URL: `/api/auth/register`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Respons sukses: `201`

### Login

- Method: `POST`
- URL: `/api/auth/login`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Respons sukses: `200`
- Respons data meliputi token akses dan refresh token.

### Refresh Token

- Method: `POST`
- URL: `/api/auth/refresh`
- Body:
  ```json
  {
    "refresh_token": "<refresh_token>"
  }
  ```
- Respons sukses: `200`

### Logout

- Method: `POST`
- URL: `/api/auth/logout`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

## Profile

### Get Profile

- Method: `GET`
- URL: `/api/profile`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

### Update Profile

- Method: `PUT`
- URL: `/api/profile`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "name": "Nama Baru",
    "avatar": "https://example.com/avatar.jpg",
    "username": "namauser"
  }
  ```
- Respons sukses: `200`

### Change Password

- Method: `PUT`
- URL: `/api/profile/password`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "old_password": "passwordLama",
    "new_password": "passwordBaru123"
  }
  ```
- Respons sukses: `200`

## Dashboard

### Dashboard Overview

- Method: `GET`
- URL: `/api/dashboard`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`
- Data tipikal:
  - total_savings
  - total_target
  - progress
  - completion_rate
  - remaining_target
  - total_transactions
  - total_deposit
  - total_withdrawal
  - num_savings_goals

### Monthly Statistics

- Method: `GET`
- URL: `/api/dashboard/statistics`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`
- Data tipikal: daftar bulan dengan deposit dan withdrawal.

### Recent Transactions

- Method: `GET`
- URL: `/api/dashboard/recent-transactions`
- Header: `Authorization: Bearer <access_token>`
- Query params:
  - `limit` (optional)
- Respons sukses: `200`

## Savings

### Create Savings Goal

- Method: `POST`
- URL: `/api/savings`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "name": "Beli Sepeda",
    "target_amount": 2000000
  }
  ```
- Respons sukses: `201`

### List Savings Goals

- Method: `GET`
- URL: `/api/savings`
- Header: `Authorization: Bearer <access_token>`
- Query params:
  - `page` (integer)
  - `limit` (integer)
  - `search` (string)
  - `keyword` (string)
  - `sort` (`asc` atau `desc`)
- Respons sukses: `200`

### Get Savings by ID

- Method: `GET`
- URL: `/api/savings/{id}`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

### Update Savings Goal

- Method: `PUT`
- URL: `/api/savings/{id}`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "name": "Beli Sepeda Motor",
    "target_amount": 5000000
  }
  ```
- Respons sukses: `200`

### Delete Savings Goal

- Method: `DELETE`
- URL: `/api/savings/{id}`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

### Get Transactions for Savings Goal

- Method: `GET`
- URL: `/api/savings/{id}/transactions`
- Header: `Authorization: Bearer <access_token>`
- Query params:
  - `page` (integer)
  - `limit` (integer)
  - `search` (string)
  - `sort` (`asc` atau `desc`)
  - `type` (`deposit` atau `withdrawal`)
  - `savings_id` (UUID)
- Respons sukses: `200`

## Transactions

### Create Transaction

- Method: `POST`
- URL: `/api/transactions`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "savings_id": "11111111-1111-1111-1111-111111111111",
    "type": "deposit",
    "amount": 100000,
    "description": "Setoran awal"
  }
  ```
- Respons sukses: `201`

### List Transactions

- Method: `GET`
- URL: `/api/transactions`
- Header: `Authorization: Bearer <access_token>`
- Query params:
  - `page` (integer)
  - `limit` (integer)
  - `search` (string)
  - `sort` (`asc` atau `desc`)
  - `type` (`deposit` atau `withdrawal`)
  - `savings_id` (UUID)
- Respons sukses: `200`

### Get Transaction by ID

- Method: `GET`
- URL: `/api/transactions/{id}`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

### Update Transaction

- Method: `PATCH`
- URL: `/api/transactions/{id}`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "type": "withdrawal",
    "amount": 50000,
    "description": "Tarik tunai"
  }
  ```
- Respons sukses: `200`

### Delete Transaction

- Method: `DELETE`
- URL: `/api/transactions/{id}`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

## Shared Savings

### Create Shared Savings

- Method: `POST`
- URL: `/api/shared-savings`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "name": "Liburan Bali",
    "description": "Tabungan bersama keluarga",
    "target_amount": 5000000
  }
  ```
- Respons sukses: `201`

### List Shared Savings

- Method: `GET`
- URL: `/api/shared-savings`
- Header: `Authorization: Bearer <access_token>`
- Query params:
  - `page` (integer)
  - `limit` (integer)
  - `search` (string)
  - `sort` (`asc` atau `desc`)
- Respons sukses: `200`

### Get Shared Savings by ID

- Method: `GET`
- URL: `/api/shared-savings/{id}`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

### Update Shared Savings

- Method: `PATCH`
- URL: `/api/shared-savings/{id}`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "name": "Liburan Bali 2026",
    "description": "Tabungan bersama untuk liburan keluarga",
    "target_amount": 5500000
  }
  ```
- Respons sukses: `200`

### Delete Shared Savings

- Method: `DELETE`
- URL: `/api/shared-savings/{id}`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

### Join Shared Savings

- Method: `POST`
- URL: `/api/shared-savings/join`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "invite_code": "ABCD123"
  }
  ```
- Respons sukses: `200`

### Get Shared Savings Members

- Method: `GET`
- URL: `/api/shared-savings/{id}/members`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

### Get Shared Savings Statistics

- Method: `GET`
- URL: `/api/shared-savings/{id}/statistics`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

## Shared Transactions

### Create Shared Transaction

- Method: `POST`
- URL: `/api/shared-transactions`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "shared_savings_id": "22222222-2222-2222-2222-222222222222",
    "type": "deposit",
    "amount": 250000,
    "description": "Setoran anggota"
  }
  ```
- Respons sukses: `201`

### Update Shared Transaction

- Method: `PATCH`
- URL: `/api/shared-transactions/{id}`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "amount": 300000,
    "description": "Perubahan jumlah setoran"
  }
  ```
- Respons sukses: `200`

### Delete Shared Transaction

- Method: `DELETE`
- URL: `/api/shared-transactions/{id}`
- Header: `Authorization: Bearer <access_token>`
- Respons sukses: `200`

## Notes for Frontend

- Pastikan semua request JSON menggunakan header `Content-Type: application/json`.
- Gunakan query parameter seperti `page`, `limit`, `sort`, dan `search` untuk fitur paging dan filter.
- Untuk semua rute yang memerlukan autentikasi, kirim token JWT yang valid dengan header `Authorization`.
- Jika ingin melihat struktur respons yang detail, buka Swagger UI di `http://localhost:5000/api-docs`.
