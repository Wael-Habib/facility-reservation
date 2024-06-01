import { groq } from 'next-sanity';

export const getFeaturedFacilityQuery = groq`*[_type == "facility" && isFeatured == true][0] {
    _id,
    description,
    images,
    isFeatured,
    name,
    slug,
    coverImage
}`;

export const getFacilitiesQuery = groq`*[_type == "facility"] {
    _id,
    coverImage,
    description,
    dimension,
    isBooked,
    isFeatured,
    name,
    slug,
    type
}`;


export const getFacility = groq`*[_type == "facility" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description,
    images,
    coverImage,
    type,
    specialNote,
    dimension,
    numberOfSeats,
    offeredAmenities,
    isBooked,
    reviews,
    isFeatured,
}`;

export const getUserBookingsQuery = groq`*[_type == 'booking' && user._ref == $userId] {
    _id,
    facility -> {
        _id,
        name,
        slug,
    },
    checkinDate,
    checkoutDate,
    numberOfDays,
    participants
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

export const getFacilityReviewsQuery = groq`*[_type == "review" && facility._ref == $facilityId] {
    _createdAt,
    _id,
    text,
    user -> {
        name
    },
    userRating
}`;
