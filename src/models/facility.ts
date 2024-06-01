type CoverImage = {
    url: string;
  };

  export type Image = {
    _key: string;
    url: string;
  };

  type Amenity = {
    _key: string;
    amenity: string;
    icon: string;
  };
  type Reviews = {
    _key: string;
    review: string;
  };

  type Slug = {
    _type: string;
    current: string;
  };

  export type Facility = {
    _id: string;
    name: string;
    slug: Slug;
    description: string;
    images: Image[];
    coverImage: CoverImage;
    type: string;
    specialNote: string;
    dimension: string;
    numberOfSeats: number;
    offeredAmenities: Amenity[];
    isBooked: boolean;
    reviews: Reviews[];
    isFeatured: boolean;
  };

  export type CreateBookingDto = {
    user: string;
    facility: string;
    checkinDate: string;
    checkoutDate: string;
    participants: number;
    numberOfDays: number;
  };
