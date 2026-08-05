"""PDF generation: the downloadable General Booking / Cancellation Policy document,
and the per-booking "boarding pass" style confirmation ticket.

Note: base14 PDF fonts (Helvetica) only cover WinAnsi/Latin-1 glyphs — no emoji, no
Devanagari script. Keep all PDF copy to plain ASCII/Latin-1 so it renders identically
on every platform (including the Linux server this app deploys to), without needing
to bundle custom font files.
"""
import io

import qrcode
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.platypus import (
    ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

from .policy_content import CANCELLATION_POLICY_SECTIONS, POLICY_SECTIONS

DARK = colors.HexColor('#2C1810')
BROWN = colors.HexColor('#6B4226')
ORANGE = colors.HexColor('#FF6B35')
GOLD = colors.HexColor('#B8860B')
CREAM = colors.HexColor('#FFF8F0')
LIGHT_BORDER = colors.HexColor('#FFD9C0')
GREEN = colors.HexColor('#2E7D32')
RED = colors.HexColor('#C62828')
GREY = colors.HexColor('#8A6952')

BRAND_NAME = 'PREKSHA HOSPITALITY'
BRAND_TAGLINE = 'Where Every Stay is Divine'


# ─────────────────────────────────────────────────────────────────────────────
# General Booking Policy + Cancellation & Refund Policy — downloadable PDF
# ─────────────────────────────────────────────────────────────────────────────

def _policy_styles():
    return {
        'doc_title': ParagraphStyle(
            'doc_title', fontName='Helvetica-Bold', fontSize=18, leading=22,
            textColor=DARK, alignment=TA_CENTER, spaceAfter=4,
        ),
        'doc_subtitle': ParagraphStyle(
            'doc_subtitle', fontName='Helvetica', fontSize=10.5, leading=15,
            textColor=BROWN, alignment=TA_CENTER, spaceAfter=14,
        ),
        'part_heading': ParagraphStyle(
            'part_heading', fontName='Helvetica-Bold', fontSize=14, leading=18,
            textColor=colors.white, spaceBefore=0, spaceAfter=0,
        ),
        'section_title': ParagraphStyle(
            'section_title', fontName='Helvetica-Bold', fontSize=11, leading=14,
            textColor=ORANGE, spaceBefore=12, spaceAfter=4,
        ),
        'body': ParagraphStyle(
            'body', fontName='Helvetica', fontSize=9.5, leading=14,
            textColor=BROWN,
        ),
    }


def _policy_part_header(title, styles):
    """A full-width dark bar used as a part divider ('General Booking Policy' / 'Cancellation & Refund Policy')."""
    t = Table([[Paragraph(title, styles['part_heading'])]], colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    return t


def _policy_sections_flowables(sections, styles):
    flowables = []
    for idx, (title, points) in enumerate(sections, start=1):
        flowables.append(Paragraph(f'{idx}. {title}', styles['section_title']))
        items = [
            ListItem(Paragraph(point, styles['body']), bulletColor=ORANGE, value='circle')
            for point in points
        ]
        flowables.append(ListFlowable(items, bulletType='bullet', start='circle', leftIndent=14, spaceBefore=2))
    return flowables


def _add_page_chrome(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(GREY)
    canvas.setFont('Helvetica', 7.5)
    canvas.drawString(20 * mm, 12 * mm, 'Preksha Hospitality — Where Every Stay is Divine')
    canvas.drawRightString(190 * mm, 12 * mm, f'Page {doc.page}')
    canvas.setStrokeColor(LIGHT_BORDER)
    canvas.line(20 * mm, 16 * mm, 190 * mm, 16 * mm)
    canvas.restoreState()


def generate_policy_pdf():
    """Returns the combined General Booking Policy + Cancellation & Refund Policy as PDF bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm, topMargin=16 * mm, bottomMargin=20 * mm,
        title='Preksha Hospitality - Booking & Cancellation Policy',
    )
    styles = _policy_styles()

    flowables = [
        Paragraph('PREKSHA HOSPITALITY', styles['doc_title']),
        Paragraph(
            'General Booking Policy &amp; Cancellation / Refund Policy<br/>'
            'Applicable to all bookings unless otherwise agreed in writing.',
            styles['doc_subtitle'],
        ),
        _policy_part_header('1. General Booking Policy', styles),
        Spacer(1, 6),
        *_policy_sections_flowables(POLICY_SECTIONS, styles),
        Spacer(1, 14),
        _policy_part_header('2. Cancellation &amp; Refund Policy', styles),
        Spacer(1, 6),
        *_policy_sections_flowables(CANCELLATION_POLICY_SECTIONS, styles),
    ]

    doc.build(flowables, onFirstPage=_add_page_chrome, onLaterPages=_add_page_chrome)
    return buffer.getvalue()


# ─────────────────────────────────────────────────────────────────────────────
# Booking "boarding pass" style confirmation ticket — per-booking PDF
# ─────────────────────────────────────────────────────────────────────────────

PAGE_W, PAGE_H = A4


def _qr_image_reader(data):
    qr = qrcode.QRCode(border=2, box_size=8)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color='#2C1810', back_color='white').convert('RGB')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return ImageReader(buf)


def _status_look(status):
    if status == 'confirmed':
        return GREEN, 'CONFIRMED'
    if status == 'cancelled':
        return RED, 'CANCELLED'
    return ORANGE, status.upper().replace('_', ' ')


def _draw_kv_row(c, x, y, col_width, pairs):
    """Draws a row of (label, value) pairs evenly spaced across the width starting at x."""
    n = len(pairs)
    each = col_width / n
    for i, (label, value) in enumerate(pairs):
        cx = x + i * each
        c.setFont('Helvetica', 7.5)
        c.setFillColor(GREY)
        c.drawString(cx, y, label.upper())
        c.setFont('Helvetica-Bold', 11)
        c.setFillColor(DARK)
        c.drawString(cx, y - 14, value)


def generate_booking_ticket_pdf(booking):
    """Returns an airline-boarding-pass-style PDF confirmation ticket for a BookingRequest."""
    buffer = io.BytesIO()
    from reportlab.pdfgen import canvas as pdfcanvas
    c = pdfcanvas.Canvas(buffer, pagesize=A4)

    margin = 15 * mm
    card_w = PAGE_W - 2 * margin
    status_color, status_label = _status_look(booking.status)
    property_name = booking.venue.name if booking.venue else 'Preksha Hospitality'
    property_location = ''
    if booking.venue:
        property_location = ', '.join(
            p for p in [booking.venue.location, str(booking.venue.city) if booking.venue.city else ''] if p
        )
    room_name = booking.room_category.name if booking.room_category else 'As assigned'

    # ── Header band ─────────────────────────────────────────────────────────
    header_h = 32 * mm
    top = PAGE_H - margin
    c.setFillColor(DARK)
    c.rect(margin, top - header_h, card_w, header_h, stroke=0, fill=1)

    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 20)
    c.drawString(margin + 8 * mm, top - 13 * mm, BRAND_NAME)
    c.setFillColor(colors.HexColor('#FFD9C0'))
    c.setFont('Helvetica-Oblique', 9)
    c.drawString(margin + 8 * mm, top - 20 * mm, BRAND_TAGLINE)
    c.setFillColor(colors.white)
    c.setFont('Helvetica', 8)
    c.drawString(margin + 8 * mm, top - 27 * mm, 'BOOKING CONFIRMATION TICKET')

    # Status badge, top-right of header
    badge_w, badge_h = 38 * mm, 10 * mm
    badge_x = margin + card_w - badge_w - 8 * mm
    badge_y = top - 13 * mm
    c.setFillColor(status_color)
    c.roundRect(badge_x, badge_y, badge_w, badge_h, 3 * mm, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 11)
    c.drawCentredString(badge_x + badge_w / 2, badge_y + 3.2 * mm, status_label)

    # Orange accent strip
    accent_h = 3 * mm
    c.setFillColor(ORANGE)
    c.rect(margin, top - header_h - accent_h, card_w, accent_h, stroke=0, fill=1)

    # ── Ticket card ──────────────────────────────────────────────────────────
    # Layout is computed top-down with fixed offsets so the card height always
    # matches its content — a hardcoded card_h previously let the perforation/stub
    # land on top of the rows above it whenever special_requests was present.
    card_top = top - header_h - accent_h
    inner_x = margin + 10 * mm
    inner_w = card_w - 20 * mm

    qr_reader = _qr_image_reader(booking.booking_reference)
    guests_txt = f'{booking.number_of_adults} Adult(s)'
    if booking.number_of_children:
        guests_txt += f', {booking.number_of_children} Child(ren)'

    special_lines = []
    if booking.special_requests:
        special_lines = simpleSplit(booking.special_requests, 'Helvetica', 8.5, inner_w)[:2]
        if len(special_lines) == 2 and simpleSplit(booking.special_requests, 'Helvetica', 8.5, inner_w) != special_lines:
            special_lines[-1] = special_lines[-1].rstrip()[:-1] + '…'

    ref_block_h = 34 * mm       # label + big reference code
    divider_gap_h = 12 * mm     # divider line to first row
    row_h = 18 * mm             # each of the four detail rows
    special_block_h = (10 * mm + len(special_lines) * 4.2 * mm) if special_lines else 6 * mm
    perf_gap_h = 8 * mm         # last content to perforation line
    stub_h = 30 * mm            # tear-off stub section
    bottom_pad_h = 8 * mm

    card_h = (
        14 * mm + ref_block_h + divider_gap_h + 4 * row_h
        + special_block_h + perf_gap_h + stub_h + bottom_pad_h
    )

    c.setFillColor(CREAM)
    c.setStrokeColor(LIGHT_BORDER)
    c.roundRect(margin, card_top - card_h, card_w, card_h, 4 * mm, stroke=1, fill=1)

    y = card_top - 14 * mm

    # Booking reference + QR
    c.setFillColor(GREY)
    c.setFont('Helvetica', 8)
    c.drawString(inner_x, y, 'BOOKING REFERENCE (PNR)')
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 22)
    c.drawString(inner_x, y - 12 * mm, booking.booking_reference)

    qr_size = 28 * mm
    qr_x = margin + card_w - 10 * mm - qr_size
    qr_y = y - 12 * mm - qr_size + 6 * mm
    c.drawImage(qr_reader, qr_x, qr_y, width=qr_size, height=qr_size, mask='auto')

    # Divider
    y -= ref_block_h
    c.setStrokeColor(LIGHT_BORDER)
    c.setLineWidth(0.75)
    c.line(inner_x, y, inner_x + inner_w, y)
    y -= divider_gap_h

    # Guest / property / stay detail rows
    _draw_kv_row(c, inner_x, y, inner_w, [
        ('Guest Name', booking.guest_name),
        ('Mobile Number', booking.mobile_number),
    ])
    y -= row_h
    _draw_kv_row(c, inner_x, y, inner_w, [
        ('Property', property_name),
        ('Location', property_location or '-'),
    ])
    y -= row_h
    _draw_kv_row(c, inner_x, y, inner_w, [
        ('Check-in', booking.check_in_date.strftime('%d %b %Y') + ' (12:00 PM)'),
        ('Check-out', booking.check_out_date.strftime('%d %b %Y') + ' (11:00 AM)'),
        ('Nights', str(booking.nights())),
    ])
    y -= row_h
    _draw_kv_row(c, inner_x, y, inner_w, [
        ('Room Type', room_name),
        ('Rooms', str(booking.number_of_rooms)),
        ('Guests', guests_txt),
    ])
    y -= row_h

    if special_lines:
        c.setFillColor(GREY)
        c.setFont('Helvetica', 7.5)
        c.drawString(inner_x, y, 'SPECIAL REQUESTS')
        c.setFillColor(BROWN)
        c.setFont('Helvetica', 8.5)
        for i, line in enumerate(special_lines):
            c.drawString(inner_x, y - 10 - i * 4.2 * mm, line)
    y -= special_block_h

    # ── Perforation ──────────────────────────────────────────────────────────
    perf_y = y - perf_gap_h
    c.setDash(3, 3)
    c.setStrokeColor(GREY)
    c.line(inner_x, perf_y, inner_x + inner_w, perf_y)
    c.setDash()
    c.setFillColor(colors.white)
    c.circle(margin, perf_y, 4 * mm, stroke=0, fill=1)
    c.circle(margin + card_w, perf_y, 4 * mm, stroke=0, fill=1)

    # ── Stub (repeats the essentials, like a tear-off boarding-pass stub) ────
    stub_y = perf_y - 10 * mm
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(inner_x, stub_y, f'{booking.guest_name}  •  {booking.booking_reference}')
    c.setFillColor(BROWN)
    c.setFont('Helvetica', 8)
    c.drawString(
        inner_x, stub_y - 11,
        f'{property_name}  |  {booking.check_in_date.strftime("%d %b %Y")} to '
        f'{booking.check_out_date.strftime("%d %b %Y")}',
    )
    stub_qr = 18 * mm
    c.drawImage(qr_reader, margin + card_w - 10 * mm - stub_qr, perf_y - stub_qr - 8 * mm,
                width=stub_qr, height=stub_qr, mask='auto')

    # ── Footer note ──────────────────────────────────────────────────────────
    footer_y = margin + 12 * mm
    c.setFillColor(GREY)
    c.setFont('Helvetica-Oblique', 8)
    c.drawCentredString(
        PAGE_W / 2, footer_y,
        'Please carry a valid Government photo ID and this ticket at check-in.',
    )
    contact_bits = []
    if booking.venue and booking.venue.primary_phone:
        contact_bits.append(f'Call: {booking.venue.primary_phone}')
    if booking.venue and booking.venue.primary_email:
        contact_bits.append(f'Email: {booking.venue.primary_email}')
    if contact_bits:
        c.setFont('Helvetica', 8)
        c.drawCentredString(PAGE_W / 2, footer_y - 11, '   |   '.join(contact_bits))

    c.showPage()
    c.save()
    return buffer.getvalue()
