# User Registration & Login Endpoint Documentation

## Endpoint

`POST /users/register`

## Description

Registers a new user in the system. The endpoint expects user details in the request body and returns an authentication token and user information upon successful registration.

## Request Body

Send a JSON object with the following structure:

```
{
  "fullname": {
    "firstname": "<First Name>",
    "lastname": "<Last Name>" // optional, min 3 chars if provided
  },
  "email": "<user email>",
  "password": "<user password>"
}
```

- `fullname.firstname` (string, required): Minimum 3 characters
- `fullname.lastname` (string, optional): Minimum 3 characters if provided
- `email` (string, required): Must be a valid email address
- `password` (string, required): Minimum 6 characters

## Responses

### Success

- **Status Code:** `200 OK`
- **Body:**
  ```json
  {
    "token": "<JWT token>",
    "user": {
      "_id": "<user id>",
      "fullname": {
        "firstname": "<First Name>",
        "lastname": "<Last Name>"
      },
      "email": "<user email>"
      // ...other user fields
    }
  }
  ```

### Validation Error

- **Status Code:** `400 Bad Request`
- **Body:**
  ```json
  {
    "errors": [
      { "msg": "<error message>", "param": "<field>", ... }
    ]
  }
  ```

### Duplicate Email

- **Status Code:** `400 Bad Request`
- **Body:**
  ```json
  {
    "error": "Email already registered"
  }
  ```

## Example Request

```
curl -X POST http://localhost:5000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": { "firstname": "John", "lastname": "Doe" },
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

- The email must be unique.
- Passwords are securely hashed before storage.
- On success, a JWT token is returned for authentication.

---

## User Login Endpoint

### Endpoint

`POST /users/login`

### Description

Authenticates a user with email and password. Returns a JWT token and user information if credentials are valid.

### Request Body

Send a JSON object with the following structure:

```
{
  "email": "<user email>",
  "password": "<user password>"
}
```

- `email` (string, required): Must be a valid email address
- `password` (string, required): Minimum 6 characters

### Responses

#### Success

- **Status Code:** `200 OK`
- **Body:**
  ```json
  {
    "token": "<JWT token>",
    "user": {
      "_id": "<user id>",
      "fullname": {
        "firstname": "<First Name>",
        "lastname": "<Last Name>"
      },
      "email": "<user email>"
      // ...other user fields
    }
  }
  ```

#### Validation Error

- **Status Code:** `400 Bad Request`
- **Body:**
  ```json
  {
    "errors": [
      { "msg": "<error message>", "param": "<field>", ... }
    ]
  }
  ```

#### Invalid Credentials

- **Status Code:** `401 Unauthorized`
- **Body:**
  ```json
  {
    "message": "invaild email or password"
  }
  ```

### Example Request

```
curl -X POST http://localhost:5000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

### Notes

- On success, a JWT token is returned for authentication.
