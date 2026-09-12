# Mini B2B RFQ Marketplace

A full-stack B2B Request for Quotation (RFQ) marketplace that connects buyers with suppliers.

Buyers can publish requirements and receive quotations from suppliers, while suppliers can browse open RFQs and submit competitive quotations.

The application uses a React frontend, Django REST Framework backend, JWT-based authentication, and PostgreSQL database.

---

## Live Application

**Frontend:**  
https://rfqs-frontend.vercel.app

**Backend API:**  
https://rfqs-backend.vercel.app

**GitHub Repository:**  
https://github.com/nikhil12345678910sai/rfqs

---

# Features

## Authentication

- User registration
- Secure login
- JWT-based authentication
- Access and refresh tokens
- Automatic access-token refresh
- Logout
- Role-based access control
- Password validation

The application supports two user roles:

- Buyer
- Supplier

---

# Buyer Features

A buyer can:

- Create an RFQ
- Edit their own RFQs
- Delete their own RFQs
- View submitted RFQs
- View RFQ details
- Set product/service requirements
- Specify quantity
- Specify delivery location
- Set quotation deadline
- Search RFQs
- Filter RFQs
- View quotations received from suppliers
- Accept a quotation
- Reject a quotation

### RFQ Fields

Each RFQ contains:

- Product/Service Name
- Requirement Description
- Quantity
- Delivery Location
- Deadline
- Status
- Creation Date
- Last Updated Date

### RFQ Statuses

An RFQ can have the following statuses:

- `OPEN`
- `CLOSED`
- `EXPIRED`

When a buyer accepts a quotation:

1. The selected quotation becomes `ACCEPTED`
2. Other pending quotations become `REJECTED`
3. The RFQ becomes `CLOSED`

---

# Supplier Features

A supplier can:

- Browse open RFQs
- Search RFQs
- Filter RFQs
- View RFQ details
- Submit quotations
- Edit their own pending quotations
- Delete their own pending quotations
- View their submitted quotations
- Track quotation status

### Quotation Fields

Each quotation contains:

- RFQ
- Supplier
- Quoted Price
- Estimated Delivery Time
- Message
- Status
- Creation Date
- Last Updated Date

### Quotation Statuses

- `PENDING`
- `ACCEPTED`
- `REJECTED`

A supplier cannot directly change the quotation status.

Only the buyer who owns the RFQ can accept or reject quotations.

---

# Business Rules

The application implements several backend validation and authorization rules.

### RFQ Rules

- Only buyers can create RFQs.
- Buyers can modify or delete only their own RFQs.
- Suppliers cannot create or modify RFQs.
- Suppliers can view available open RFQs.
- Expired RFQs cannot receive new quotations.
- Closed RFQs cannot receive new quotations.

### Quotation Rules

- Only suppliers can submit quotations.
- A supplier cannot quote on their own RFQ.
- A supplier can submit only one quotation per RFQ.
- A quotation can only be submitted while the RFQ is open.
- A quotation cannot be submitted after the deadline.
- Suppliers can edit or delete only their own pending quotations.
- Accepted or rejected quotations cannot be edited.
- Suppliers cannot directly change quotation status.

### Acceptance Rules

When a buyer accepts a quotation:

- The buyer must own the RFQ.
- The RFQ must still be open.
- The deadline must not have passed.
- The selected quotation must be pending.
- The selected quotation becomes accepted.
- All other quotations become rejected.
- The RFQ becomes closed.

The acceptance operation is performed atomically to keep the RFQ and quotation states consistent.

---

# Technology Stack

## Frontend

- React
- Vite
- React Router
- Axios
- Bootstrap
- JavaScript

## Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- django-cors-headers

## Database

- PostgreSQL
- Neon PostgreSQL

## Deployment

- Vercel

## Development Tools

- Git
- GitHub
- VS Code

---

# Project Architecture

````text
rfq-marketplace/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RFQCard.jsx
│   │   │   └── QuotationCard.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   │
│   │   │   ├── buyer/
│   │   │   │   ├── BuyerDashboard.jsx
│   │   │   │   ├── CreateRFQ.jsx
│   │   │   │   ├── EditRFQ.jsx
│   │   │   │   └── RFQDetails.jsx
│   │   │   │
│   │   │   └── supplier/
│   │   │       ├── SupplierDashboard.jsx
│   │   │       ├── RFQDetails.jsx
│   │   │       └── MyQuotations.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── rfqService.js
│   │   │   └── quotationService.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   │
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   ├── formatDate.js
│   │   │   └── formatCurrency.js
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   │
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── rfqs/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   ├── filters.py
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── quotations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
└── README.md


## Authentication APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register/` | Public | Register a new Buyer or Supplier |
| POST | `/auth/login/` | Public | Login and obtain JWT access and refresh tokens |
| GET | `/auth/me/` | Authenticated | Get the currently logged-in user's details |
| POST | `/auth/token/refresh/` | Authenticated with refresh token | Generate a new access token |

---

## RFQ APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/rfqs/` | Authenticated | List RFQs available to the current user |
| POST | `/rfqs/` | Buyer | Create a new RFQ |
| GET | `/rfqs/<id>/` | Authenticated | View details of a specific RFQ |
| PUT | `/rfqs/<id>/` | Buyer - Owner | Update an existing RFQ |
| PATCH | `/rfqs/<id>/` | Buyer - Owner | Partially update an existing RFQ |
| DELETE | `/rfqs/<id>/` | Buyer - Owner | Delete an existing RFQ |
| GET | `/rfqs/?search=<term>` | Authenticated | Search RFQs by product or service |
| GET | `/rfqs/?delivery_location=<location>` | Authenticated | Filter RFQs by delivery location |
| GET | `/rfqs/?status=<status>` | Authenticated | Filter RFQs by status |

---

## Quotation APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/quotations/` | Authenticated | List quotations accessible to the current user |
| POST | `/quotations/` | Supplier | Submit a quotation for an RFQ |
| GET | `/quotations/<id>/` | Authenticated | View details of a specific quotation |
| PUT | `/quotations/<id>/` | Supplier - Owner | Update own pending quotation |
| PATCH | `/quotations/<id>/` | Supplier - Owner | Partially update own pending quotation |
| DELETE | `/quotations/<id>/` | Supplier - Owner | Delete own pending quotation |
| POST | `/quotations/<id>/accept/` | Buyer - RFQ Owner | Accept a pending quotation |
| POST | `/quotations/<id>/reject/` | Buyer - RFQ Owner | Reject a pending quotation |

---

## RFQ Statuses

| Status | Description |
|---|---|
| `OPEN` | RFQ is accepting quotations |
| `CLOSED` | A quotation has been accepted and the RFQ is closed |
| `EXPIRED` | The RFQ deadline has passed |

---

## Quotation Statuses

| Status | Description |
|---|---|
| `PENDING` | Quotation is awaiting a buyer decision |
| `ACCEPTED` | Buyer accepted the quotation |
| `REJECTED` | Buyer rejected the quotation or it was rejected after another quotation was accepted |

---

## API Authorization Summary

| Operation | Buyer | Supplier |
|---|---|---|
| Register | Yes | Yes |
| Login | Yes | Yes |
| View Current User | Yes | Yes |
| Create RFQ | Yes | No |
| View Own RFQs | Yes | No |
| View Available RFQs | No | Yes |
| Update Own RFQ | Yes | No |
| Delete Own RFQ | Yes | No |
| View Quotations for Own RFQs | Yes | No |
| Submit Quotation | No | Yes |
| View Own Quotations | No | Yes |
| Update Own Pending Quotation | No | Yes |
| Delete Own Pending Quotation | No | Yes |
| Accept Quotation | Yes | No |
| Reject Quotation | Yes | No |


```markdown
# Assumptions and Limitations

## Assumptions

- A user registers as either a Buyer or a Supplier.
- A Buyer creates and manages their own RFQs.
- A Supplier can submit one quotation per RFQ.
- Buyers can accept or reject quotations for their own RFQs.
- An RFQ is closed when a quotation is accepted.
- Quotations can only be submitted while the RFQ is open and before its deadline.
- The application assumes that users provide valid business and contact information.

## Limitations

- Email notifications are not currently implemented.
- Password reset through email is not currently implemented.
- Real-time messaging between buyers and suppliers is not implemented.
- File attachments are not currently supported.
- The application does not include payment processing.
- The current implementation is intended as a mini B2B RFQ marketplace rather than a full enterprise procurement platform.
- The deployed application currently uses `DEBUG=True` during development/testing and should be changed to `DEBUG=False` for a production release.
````
