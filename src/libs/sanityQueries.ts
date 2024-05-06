import { groq } from 'next-sanity';

export const getFeaturedFacilityQuery = groq`*[_type == "Facility" && isFeatured == true][0] {
    _id,
    description,
    discount,
    images,
    isFeatured,
    name,
    price,
    slug,
    coverImage
}`;

export const getFacilitysQuery = groq`*[_type == "Facility"] {
    _id,
    coverImage,
    description,
    dimension,
    isBooked,
    isFeatured,
    name,
    price,
    slug,
    type
}`;

export const getFacility = groq`*[_type == "Facility" && slug.current == $slug][0] {
    _id,
    coverImage,
    description,
    dimension,
    discount,
    images,
    isBooked,
    isFeatured,
    name,
    numberOfBeds,
    offeredAmenities,
    price,
    slug,
    specialNote,
    type
}`;

export const getUserBookingsQuery = groq`*[_type == 'booking' && user._ref == $userId] {
    _id,
    Facility -> {
        _id,
        name,
        slug,
        price
    },
    checkinDate,
    checkoutDate,
    numberOfDays,
    adults,
    children,
    totalPrice,
    discount
}`;

export const getUserDataQuery = groq`*[_type == 'user' && _id == $userId][0] {
    _id,
    name,
    email,
    isAdmin,
    about,
    _createdAt,
    image,
}`;

export const getFacilityReviewsQuery = groq`*[_type == "review" && Facility._ref == $facilityId] {
    _createdAt,
    _id,
    text,
    user -> {
        name
    },
    userRating
}`;
