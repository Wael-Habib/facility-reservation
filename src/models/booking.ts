export type Booking = {
    _id: string;
    facility: {
      _id: string;
      name: string;
      slug: { current: string };
    };
    checkinDate: string;
    checkoutDate: string;
    numberOfDays: number;
    participants: number;
  };
