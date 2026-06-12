# 🕉️ Preksha Hospitality — Full-Stack Resort Website

A complete Django + React hotel/resort booking platform with a Hindu/saffron mythological theme.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Material UI 6, React Router 6 |
| Backend | Django 4.2, Django REST Framework |
| Database | MySQL 8 |
| Async Tasks | Celery + Redis |
| Notifications | SendGrid (email) + Twilio (WhatsApp) |

---

## Project Structure

```
PrekshaHospitality/
├── backend/                  # Django backend
│   ├── preksha_hospitality/  # Core settings, URLs
│   ├── properties/           # Property, Amenity, Room models
│   ├── bookings/             # Booking request + notifications
│   ├── leads/                # Lead management system
│   └── templates/emails/     # Email templates
└── frontend/                 # React frontend
    └── src/
        ├── theme/            # Saffron/Hindu MUI theme
        ├── components/       # Reusable components
        │   ├── layout/       # Header, Footer, Layout
        │   ├── home/         # Hero, PropertyInfo, Amenities, Rooms, BookingBanner
        │   ├── rooms/        # RoomCard
        │   ├── booking/      # BookingForm (4-step wizard)
        │   └── common/       # SectionHeading, LoadingScreen
        ├── pages/            # Page-level components
        │   └── leads/        # LeadsDashboard
        ├── services/         # Axios API service
        └── hooks/            # useProperty hook
```

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8
- Redis (for Celery, optional for development)

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials, email, WhatsApp keys
```

**Create the MySQL database:**
```sql
CREATE DATABASE preksha_hospitality CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
# Run migrations
python manage.py migrate

# Create superuser (for admin panel)
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Start development server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**
Admin panel: **http://localhost:8000/admin/**

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set REACT_APP_PROPERTY_ID to the ID of your property in admin

# Start development server
npm start
```

Frontend runs at: **http://localhost:3000**

---

### 3. Celery (for email/WhatsApp notifications)

```bash
cd backend
celery -A preksha_hospitality worker --loglevel=info
```

---

## Admin Panel Usage

### Step 1 — Add Amenities
1. Go to **Admin → Properties → Amenities**
2. Add each amenity with name, description, optional icon (MUI icon name), and photo

### Step 2 — Add Property
1. Go to **Admin → Properties → Properties → Add Property**
2. Fill in: Name, City, Location, Address, Description, Contact details
3. In the **Property Amenities** inline: select amenities and mark key ones as "highlighted"
4. In the **Property Photos** inline: upload photos, mark one as primary
5. In the **Room Categories** inline: add room types with names, prices, bed info

### Step 3 — Add Room Photos
1. Open each Room Category from **Admin → Properties → Room Categories**
2. Upload room photos in the inline section

### Step 4 — Set Property ID in Frontend
1. Note the property ID from the admin list
2. Update `REACT_APP_PROPERTY_ID=<id>` in `frontend/.env`

---

## Lead Management System

### Access
- URL: **http://localhost:3000/leads**
- Uses the same Django session auth
- Login via `/api/auth/login/`

### Features
- Dashboard with stats (Total / Pending / Confirmed / Completed / Cancelled)
- Search & filter by status, guest name, mobile, reference
- View full booking details
- Change status → triggers email + WhatsApp notification to guest
- Add internal notes
- Full activity log per lead

### Creating a Lead Admin
```python
# In Django shell
python manage.py shell

from django.contrib.auth.models import User
from leads.models import LeadAdmin

user = User.objects.create_user('leadmanager', 'manager@example.com', 'password123')
user.first_name = 'Lead'
user.last_name = 'Manager'
user.save()

# Assign to specific properties (optional)
from properties.models import Property
lead_admin = LeadAdmin.objects.create(user=user, phone='+91XXXXXXXXXX')
lead_admin.assigned_properties.set(Property.objects.all())
```

---

## Booking Flow

```
Guest fills form  →  POST /api/bookings/request/
                  →  Booking saved (status: pending)
                  →  Confirmation email sent (SendGrid)
                  →  WhatsApp message sent (Twilio)
                  →  Lead visible in /leads dashboard

Lead admin opens lead  →  PATCH /api/leads/{id}/status/
                       →  Status changed to confirmed/cancelled
                       →  Update email + WhatsApp sent to guest
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/properties/` | List properties |
| GET | `/api/properties/{id}/` | Property details with rooms & amenities |
| GET | `/api/properties/{id}/rooms/` | Room categories for a property |
| GET | `/api/properties/amenities/` | All amenities |
| POST | `/api/bookings/request/` | Submit booking request |
| GET | `/api/bookings/status/{ref}/` | Check booking status |
| GET | `/api/leads/` | List all leads (auth required) |
| PATCH | `/api/leads/{id}/status/` | Update lead status (auth required) |
| POST | `/api/leads/{id}/notes/` | Add note to lead (auth required) |
| GET | `/api/leads/stats/` | Lead statistics |
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/auth/me/` | Current user |

---

## Environment Variables

### Backend (`backend/.env`)
```
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=preksha_hospitality
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
SENDGRID_API_KEY=your_key
DEFAULT_FROM_EMAIL=noreply@yourproperty.com
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_PROPERTY_ID=1
```

---

## Theme Colors

| Name | Hex | Usage |
|---|---|---|
| Saffron (Primary) | `#FF6B35` | Buttons, highlights, icons |
| Gold (Secondary) | `#FFD700` | Headings, accents, borders |
| Dark Brown | `#2C1810` | Nav background, dark sections |
| Warm Cream | `#FFF8F0` | Page backgrounds |
| Maroon | `#8B0000` | Accents |

Fonts: **Cinzel** (headings), **Playfair Display** (subheadings), **Lato** (body)
