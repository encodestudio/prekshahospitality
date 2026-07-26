import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

ICS_SEND_URL = 'https://media.sendmsg.in/mediasend'


class WhatsAppSendError(Exception):
    pass


def _normalize_mobile(number: str) -> str:
    """Strip spaces, dashes, +, and an existing 91 country-code prefix so the
    result is always a plain 10-digit Indian number ready for the 91-prefix."""
    digits = ''.join(c for c in number if c.isdigit())
    if digits.startswith('91') and len(digits) == 12:
        digits = digits[2:]
    return digits


def send_whatsapp_template(to, template_id, template_name='', placeholders=None, smsgid=None):
    """
    Send a pre-approved WhatsApp template message via the ICS WABA API.

    `to` accepts any common Indian mobile format — the country code (91) is
    added automatically after normalisation.
    `placeholders` is an ordered list of values for the template's {{1}}, {{2}}... variables.
    """
    if not settings.ICS_WHATSAPP_USER or not settings.ICS_WHATSAPP_PASS:
        raise WhatsAppSendError('ICS WhatsApp credentials are not configured')
    if not settings.ICS_WHATSAPP_FROM:
        raise WhatsAppSendError('ICS_WHATSAPP_FROM (registered WABA number) is not configured')
    if not template_id:
        raise WhatsAppSendError('No WhatsApp template id configured')

    normalized = _normalize_mobile(to)
    if len(normalized) != 10:
        raise WhatsAppSendError(f'Invalid mobile number "{to}" — must be 10 digits after normalisation (got {len(normalized)})')

    payload = {
        'user': settings.ICS_WHATSAPP_USER,
        'pass': settings.ICS_WHATSAPP_PASS,
        'whatsapptosend': [
            {
                'from': settings.ICS_WHATSAPP_FROM,
                'to': f'91{normalized}',
                'templateid': template_id,
                'templatename': template_name,
                'smsgid': smsgid or '',
                'placeholders': [
                    {str(i): value for i, value in enumerate(placeholders or [], start=1)}
                ],
                'buttons': [],
            }
        ],
    }

    response = requests.post(ICS_SEND_URL, json=payload, timeout=15)
    try:
        data = response.json()
    except ValueError:
        raise WhatsAppSendError(f'ICS WhatsApp API returned a non-JSON response: {response.text[:200]}')

    if response.status_code >= 400:
        raise WhatsAppSendError(f'ICS WhatsApp API HTTP {response.status_code}: {data}')
    if isinstance(data, dict) and data.get('status') is False:
        raise WhatsAppSendError(f"ICS WhatsApp API error: {data.get('Error')}")
    if isinstance(data, dict) and data.get('errors'):
        err = data['errors'][0]
        raise WhatsAppSendError(
            f"ICS WhatsApp API error {err.get('status')}: {err.get('title')} — {err.get('detail')}"
        )

    logger.info('WhatsApp template %s sent to 91%s (response: %s)', template_id, normalized, data)
    return data
