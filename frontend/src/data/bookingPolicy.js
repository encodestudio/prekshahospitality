const API_BASE = process.env.REACT_APP_API_URL || '/api';
export const POLICY_PDF_URL = `${API_BASE}/bookings/policy-pdf/`;

export const POLICY_SECTIONS = [
  {
    icon: '🏨',
    title: 'Reservation Confirmation',
    points: [
      'All reservations are subject to room availability.',
      'A booking is confirmed only upon receipt of the required advance payment and issuance of a booking confirmation.',
      'Group bookings may require a higher advance payment as communicated at the time of reservation.',
    ],
  },
  {
    icon: '🕐',
    title: 'Check-in & Check-out',
    points: [
      'Check-in: 12:00 PM',
      'Check-out: 11:00 AM',
      'Early check-in and late check-out are subject to availability and may attract additional charges.',
    ],
  },
  {
    icon: '🆔',
    title: 'Valid Identification',
    points: [
      'Every guest must present a valid Government-issued photo ID at the time of check-in (Aadhaar Card, Passport, Driving Licence, Voter ID, etc.).',
      'Foreign nationals must produce a valid Passport and Visa.',
    ],
  },
  {
    icon: '👫',
    title: 'Guest Eligibility',
    points: [
      'Unmarried couples are not permitted to stay at the hotel.',
      'Couples carrying local ID proof (Ayodhya/Faizabad or nearby local addresses) are not permitted to check in.',
      "The management reserves the right to refuse admission if the booking does not comply with the hotel's guest policy.",
    ],
  },
  {
    icon: '💳',
    title: 'Payment Policy',
    points: [
      'Advance payment may be required to confirm reservations.',
      'The balance amount shall be payable at the time of check-in unless otherwise agreed in writing.',
      'Payments may be made through UPI, bank transfer, credit/debit cards, or cash, subject to applicable regulations.',
    ],
  },
  {
    icon: '📝',
    title: 'Cancellation & Amendment',
    points: [
      'Cancellation and amendment charges shall apply as per the booking confirmation.',
      'Peak season, festival, and group bookings may be governed by separate cancellation terms.',
      'Eligible refunds will be processed to the original mode of payment.',
    ],
  },
  {
    icon: '🚫',
    title: 'No-Show Policy',
    points: [
      'Failure to arrive on the scheduled check-in date without prior intimation may result in cancellation of the booking and forfeiture of the applicable advance amount.',
    ],
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Group Bookings',
    points: [
      'Group rates are applicable only for the confirmed number of rooms/guests.',
      'A rooming list and arrival schedule should be shared in advance.',
    ],
  },
  {
    icon: '🧒',
    title: 'Child & Extra Bed Policy',
    points: [
      'Children below 5 years sharing existing bedding stay complimentary.',
      'Extra mattress/bed, if required, shall be charged as per the prevailing tariff.',
      'Extra beds/mattresses are available subject to availability and are chargeable.',
    ],
  },
  {
    icon: '🍽️',
    title: 'Food & Beverage Policy',
    points: [
      'Non-vegetarian food is strictly prohibited within the hotel premises.',
      'Guests are requested not to bring, cook, or consume non-vegetarian food inside the hotel.',
    ],
  },
  {
    icon: '🚭',
    title: 'Smoking & Alcohol Policy',
    points: [
      'Smoking and consumption of alcoholic beverages are strictly prohibited anywhere within the hotel premises.',
      'Any violation of this policy may result in immediate cancellation of the stay without refund and may attract penalties for damages or cleaning charges, where applicable.',
    ],
  },
  {
    icon: '🐾',
    title: 'Pet Policy',
    points: [
      'Pets are not permitted inside the hotel premises.',
    ],
  },
  {
    icon: '🙏',
    title: 'Guest Conduct',
    points: [
      'Guests are expected to maintain a peaceful and respectful environment.',
      'Any damage caused to hotel property shall be recoverable from the guest.',
      'Illegal activities, nuisance, or behaviour causing inconvenience to other guests will not be tolerated.',
    ],
  },
  {
    icon: '🔒',
    title: 'Liability',
    points: [
      'Guests are advised to keep their valuables secure.',
      'The hotel shall not be responsible for loss, theft, or damage to personal belongings except as required under applicable law.',
    ],
  },
  {
    icon: '⚠️',
    title: 'Force Majeure',
    points: [
      'The hotel shall not be liable for cancellations or disruptions arising from natural calamities, government restrictions, pandemics, strikes, or any other events beyond its reasonable control.',
    ],
  },
  {
    icon: '⚖️',
    title: 'Jurisdiction',
    points: [
      'All disputes arising out of bookings or stay shall be subject to the exclusive jurisdiction of the competent courts at Ayodhya, Uttar Pradesh.',
    ],
  },
];
