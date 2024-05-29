export type Booking = {
    _id: string;
    Facility: {
      _id: string;
      name: string;
      slug: { current: string };
    };
    checkinDate: string;
    checkoutDate: string;
    numberOfDays: number;
    participants: number;
  };
