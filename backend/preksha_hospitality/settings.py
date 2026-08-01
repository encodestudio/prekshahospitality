from pathlib import Path
import dj_database_url
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'properties',
    'bookings',
    'leads',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'preksha_hospitality.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'preksha_hospitality.wsgi.application'

_DATABASE_URL = config('DATABASE_URL', default='')
if _DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=_DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': config('DB_NAME', default='preksha_hospitality'),
            'USER': config('DB_USER', default='root'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='3306'),
            'OPTIONS': {
                'charset': 'utf8mb4',
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES', time_zone='+05:30'",
            },
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = False

STATIC_URL = '/django-static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'staticfiles': {
        'BACKEND': (
            'whitenoise.storage.CompressedManifestStaticFilesStorage'
            if not DEBUG
            else 'whitenoise.storage.CompressedStaticFilesStorage'
        ),
    },
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Raise the total-request-size cap for admin pages that upload several room/property
# photos at once (Django defaults to 2.5MB). FILE_UPLOAD_MAX_MEMORY_SIZE is left at
# Django's own default (~2.5MB) on purpose — that's the per-file threshold above which
# an upload streams to a temp file on disk instead of being buffered in memory, which
# matters on a memory-constrained server even though the overall request may be large.
DATA_UPLOAD_MAX_MEMORY_SIZE = 100 * 1024 * 1024  # 100MB

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')
DEFAULT_LOCAL_ORIGINS = [
    FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
CORS_ALLOWED_ORIGINS = list(dict.fromkeys(config(
    'CORS_ALLOWED_ORIGINS',
    default=','.join(DEFAULT_LOCAL_ORIGINS),
    cast=Csv(),
)))
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = list(dict.fromkeys(config(
    'CSRF_TRUSTED_ORIGINS',
    default=','.join(CORS_ALLOWED_ORIGINS),
    cast=Csv(),
)))

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'preksha_hospitality.authentication.CsrfExemptSessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# Email
# Provider selection: set SENDGRID_API_KEY for SendGrid, or EMAIL_HOST_USER +
# EMAIL_HOST_PASSWORD for any SMTP provider (e.g. Gmail). If neither is set,
# emails are printed to the terminal (console backend — dev fallback only).
SENDGRID_API_KEY = config('SENDGRID_API_KEY', default='')
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER or 'noreply@prekshahospitality.com')
BOOKING_MANAGER_EMAIL = config('BOOKING_MANAGER_EMAIL', default='shivam@encodestudio.in')
CONTACT_EMAIL = config('CONTACT_EMAIL', default='contact@prekshahospitality.com')
# Copied on every booking-request confirmation and status-update email, alongside the guest
BOOKINGS_TEAM_EMAIL = config('BOOKINGS_TEAM_EMAIL', default='bookings@prekshahospitality.com')

if SENDGRID_API_KEY and not SENDGRID_API_KEY.startswith('your_'):
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = 'smtp.sendgrid.net'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = 'apikey'
    EMAIL_HOST_PASSWORD = SENDGRID_API_KEY
elif EMAIL_HOST_USER and EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
    EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
    EMAIL_USE_TLS = True
    EMAIL_USE_SSL = False
else:
    # No credentials configured — print to terminal so you can see email content during dev
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ICS WhatsApp Business API (WABA) — booking confirmation & status update messages.
# Templates (booking_request, booking_confirmed, booking_cancelled) are created &
# approved via the ICS dashboard/API — the template NAME is sent directly as the
# "templateid" field per ICS support, so no separate id setting is needed here.
ICS_WHATSAPP_USER = config('ICS_WHATSAPP_USER', default='')
ICS_WHATSAPP_PASS = config('ICS_WHATSAPP_PASS', default='')
ICS_WHATSAPP_FROM = config('ICS_WHATSAPP_FROM', default='')  # registered WABA number, e.g. 9180xxxxxxx (no +)

