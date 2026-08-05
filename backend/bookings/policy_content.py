"""Policy text shared by the PDF generator and (mirrored) the frontend data files
frontend/src/data/bookingPolicy.js and frontend/src/data/cancellationPolicy.js.
Keep these three in sync when policy wording changes.
"""

POLICY_SECTIONS = [
    ('Reservation Confirmation', [
        'All reservations are subject to room availability.',
        'A booking is confirmed only upon receipt of the required advance payment and issuance of a booking confirmation.',
        'Group bookings may require a higher advance payment as communicated at the time of reservation.',
    ]),
    ('Check-in & Check-out', [
        'Check-in: 12:00 PM',
        'Check-out: 11:00 AM',
        'Early check-in and late check-out are subject to availability and may attract additional charges.',
    ]),
    ('Valid Identification', [
        'Every guest must present a valid Government-issued photo ID at the time of check-in (Aadhaar Card, Passport, Driving Licence, Voter ID, etc.).',
        'Foreign nationals must produce a valid Passport and Visa.',
    ]),
    ('Guest Eligibility', [
        'Unmarried couples are not permitted to stay at the hotel.',
        'Couples carrying local ID proof (Ayodhya/Faizabad or nearby local addresses) are not permitted to check in.',
        "The management reserves the right to refuse admission if the booking does not comply with the hotel's guest policy.",
    ]),
    ('Payment Policy', [
        'Advance payment may be required to confirm reservations.',
        'The balance amount shall be payable at the time of check-in unless otherwise agreed in writing.',
        'Payments may be made through UPI, bank transfer, credit/debit cards, or cash, subject to applicable regulations.',
    ]),
    ('Cancellation & Amendment', [
        'Cancellation and amendment charges shall apply as per the booking confirmation.',
        'Peak season, festival, and group bookings may be governed by separate cancellation terms.',
        'Eligible refunds will be processed to the original mode of payment.',
    ]),
    ('No-Show Policy', [
        'Failure to arrive on the scheduled check-in date without prior intimation may result in cancellation of the booking and forfeiture of the applicable advance amount.',
    ]),
    ('Group Bookings', [
        'Group rates are applicable only for the confirmed number of rooms/guests.',
        'A rooming list and arrival schedule should be shared in advance.',
    ]),
    ('Child & Extra Bed Policy', [
        'Children below 5 years sharing existing bedding stay complimentary.',
        'Extra mattress/bed, if required, shall be charged as per the prevailing tariff.',
        'Extra beds/mattresses are available subject to availability and are chargeable.',
    ]),
    ('Food & Beverage Policy', [
        'Non-vegetarian food is strictly prohibited within the hotel premises.',
        'Guests are requested not to bring, cook, or consume non-vegetarian food inside the hotel.',
    ]),
    ('Smoking & Alcohol Policy', [
        'Smoking and consumption of alcoholic beverages are strictly prohibited anywhere within the hotel premises.',
        'Any violation of this policy may result in immediate cancellation of the stay without refund and may attract penalties for damages or cleaning charges, where applicable.',
    ]),
    ('Pet Policy', [
        'Pets are not permitted inside the hotel premises.',
    ]),
    ('Guest Conduct', [
        'Guests are expected to maintain a peaceful and respectful environment.',
        'Any damage caused to hotel property shall be recoverable from the guest.',
        'Illegal activities, nuisance, or behaviour causing inconvenience to other guests will not be tolerated.',
    ]),
    ('Liability', [
        'Guests are advised to keep their valuables secure.',
        'The hotel shall not be responsible for loss, theft, or damage to personal belongings except as required under applicable law.',
    ]),
    ('Force Majeure', [
        'The hotel shall not be liable for cancellations or disruptions arising from natural calamities, government restrictions, pandemics, strikes, or any other events beyond its reasonable control.',
    ]),
    ('Jurisdiction', [
        'All disputes arising out of bookings or stay shall be subject to the exclusive jurisdiction of the competent courts at Ayodhya, Uttar Pradesh.',
    ]),
]

CANCELLATION_POLICY_SECTIONS = [
    ('Individual Bookings (FIT)', [
        'More than 7 days prior to check-in: No cancellation charges. Any advance received shall be refunded after deduction of applicable bank/payment gateway charges.',
        '3 to 7 days prior to check-in: 50% of the booking value shall be charged.',
        "Less than 72 hours before check-in, or No-Show: 100% of the first night's room charges shall be forfeited.",
    ]),
    ('Group Bookings (10 Rooms or More)', [
        'More than 30 days prior to arrival: No cancellation charges.',
        '15 to 30 days prior to arrival: 25% of the total booking value shall be charged.',
        '7 to 14 days prior to arrival: 50% of the total booking value shall be charged.',
        'Less than 7 days prior to arrival, or No-Show: 100% of the advance amount shall be forfeited.',
    ]),
    ('Festival & Peak Season Bookings', [
        'Bookings made during festivals, long weekends, New Year, Ram Navami, Deepotsav, Kartik Purnima, and other notified peak periods may be non-cancellable, non-refundable, and non-amendable, unless specifically mentioned otherwise in the booking confirmation.',
    ]),
    ('Amendments', [
        'Any change in arrival date, departure date, number of rooms, or guest details shall be subject to room availability and prevailing tariff.',
        'Amendments requested within 72 hours of arrival may be treated as a cancellation and fresh booking.',
    ]),
    ('Early Departure', [
        'In case a guest checks out before the confirmed departure date, the hotel reserves the right to charge for the unused room nights as per the confirmed reservation.',
    ]),
    ('No-Show', [
        'Failure to arrive on the scheduled check-in date without prior written intimation shall be treated as a No-Show, and the applicable cancellation charges shall apply.',
        'The hotel reserves the right to release the room for further sale.',
    ]),
    ('Refunds', [
        'Eligible refunds shall be processed within 7–10 working days from the date of cancellation approval.',
        'Refunds shall be made through the original mode of payment only.',
        'Bank charges, payment gateway charges, taxes, or any third-party transaction charges, wherever applicable, may be deducted from the refundable amount.',
    ]),
    ('Force Majeure', [
        'The hotel shall not be liable for any cancellation, delay, or failure to provide accommodation due to events beyond its reasonable control, including natural disasters, government restrictions, strikes, pandemics, or other force majeure events.',
        'In such cases, refunds or rescheduling shall be considered at the sole discretion of the management.',
    ]),
    ("Management's Decision", [
        'The Management reserves the right to modify this policy without prior notice.',
        'Any exception to the above terms shall be valid only if confirmed in writing by the hotel management.',
    ]),
]
