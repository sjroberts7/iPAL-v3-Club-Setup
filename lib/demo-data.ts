import { newClub, newSession, newExtra, dateKey } from "./model";
export const locations = [
  "Maple C of E Primary School",
  "Silver Leaf Primary School",
  "Greystoke Primary School",
];
export const children = [
  "Sam Roberts",
  "Will Roberts",
  "Jamie Cooper",
  "Joshua Shaw",
  "Amelia Jones",
  "Oliver Smith",
  "Isla Davies",
  "Noah Wilson",
];
export const years = [
  "Reception",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
];
export const classes = [
  "Oak Class",
  "Willow Class",
  "Maple Class",
  "Birch Class",
];
export const memberships = [
  "Annual Family Membership",
  "School Community Membership",
];
export const categories = [
  "Wraparound Care",
  "Holiday Clubs",
  "Trips and Activities",
  "School Meals",
];
export const accounts = [
  "Main Operating Account",
  "School Activities Account",
  "Holiday Club Account",
];
export const registerFields = [
  "Year",
  "Class",
  "Group",
  "Notes",
  "School",
  "Permissions",
  "Date of Birth",
  "Profile Image",
  "Collection Password",
  "SEN / Medical / Allergies",
  "Contact and Collection Information",
];
export const weekNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const bookingTypes = [
  [
    "Individual Booking",
    "Allows parents to book as many or as few dates they like",
    "calendar-plus",
  ],
  ["Block Booking", "Forces parents to book all dates", "calendar-days"],
  [
    "Contract booking",
    "Book every date within a set contract",
    "file-pen-line",
  ],
  [
    "Subscription Booking",
    "Book every date through a recurring subscription",
    "calendar-clock",
  ],
  ["Parents Evening", "Choose from available appointment slots", "handshake"],
  ["Trips", "Book places on upcoming trips and activities", "bus-front"],
  ["Lunches", "Select meals across available dates", "utensils"],
];
export function demoSessions() {
  return [
    ["Before School", "07:30", "09:00", "5.00"],
    ["After School", "15:00", "18:00", "12.00"],
    ["Standard Day", "09:00", "15:00", "28.00"],
    ["Early Drop Off", "08:00", "09:30", "4.00"],
  ].map(([name, start, end, price], i) => ({
    ...newSession(),
    id: `demo-session-${i}`,
    name,
    start,
    end,
    pricing: { ...newSession().pricing, standard: price },
  }));
}
export function demoExtras() {
  return ["Breakfast", "Packed Lunch", "Activity Pack"].map((name, i) => ({
    ...newExtra(),
    id: `demo-extra-${i}`,
    name,
    pricing: { ...newExtra().pricing, standard: ["2.50", "4.00", "3.00"][i] },
  }));
}
export function demoClubs() {
  return ["Out of School Club", "Art Workshop", "Holiday Activity Club"].map(
    (name, i) => {
      const c = newClub();
      const year = new Date().getFullYear();
      return {
        ...c,
        id: `demo-club-${i}`,
        name,
        bookingType: "Individual Booking",
        location: locations[i],
        dates: Array.from({ length: 12 + i * 3 }, (_, j) =>
          dateKey(new Date(year, 8, 1 + j)),
        ).filter((d) => ![0, 6].includes(new Date(d + "T12:00:00").getDay())),
        sessions: demoSessions()
          .slice(0, 2)
          .map((s) => ({
            ...s,
            fees: [
              { id: `fee-${i}-1`, delay: "00:10", amount: "2.00" },
              { id: `fee-${i}-2`, delay: "00:30", amount: "5.00" },
            ],
          })),
        tile: {
          ...c.tile,
          name: i ? "Holiday Clubs" : "Out of School Clubs",
          image: "/assets/tile-photo.png",
        },
        createdAt: new Date(year, 7, 1).toISOString(),
      };
    },
  );
}
export const templates = [
  {
    name: "Default booking confirmation",
    html: "<p>Dear Parent / Carer,</p><p>Thank you for your booking at <strong>{{clubName}}</strong>.</p><p>Your selected sessions and dates have been confirmed. Please arrive at the advertised start time and let our team know about any changes to your collection arrangements.</p><p>We look forward to welcoming you!</p><p>Kind regards,<br>The iPAL Team</p>",
  },
  {
    name: "Holiday club welcome",
    html: "<p>Hello!</p><p>Your place at <strong>{{clubName}}</strong> is booked.</p><p>Please bring a water bottle, suitable clothing and a packed lunch. Contact the club team if you have any questions.</p><p>See you soon!</p>",
  },
];
