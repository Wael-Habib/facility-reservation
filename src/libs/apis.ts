import { CreateReviewDto, Review } from './../models/review';
import axios from 'axios';

import { CreateBookingDto, Facility } from '@/models/facility';
import sanityClient from './sanity';
import * as queries from './sanityQueries';
import { Booking } from '@/models/booking';
import { UpdateReviewDto } from '@/models/review';

export async function getFeaturedFacility() {
  const result = await sanityClient.fetch<Facility>(
    queries.getFeaturedFacilityQuery,
    {},
    { cache: 'no-cache' }
  );

  return result;
}

export async function getFacilities() {
  const result = await sanityClient.fetch<Facility[]>(
    queries.getFacilitysQuery,
    {},
    { cache: 'no-cache' }
  );
  return result;
}

export async function getFacility(slug: string) {
  const result = await sanityClient.fetch<Facility>(
    queries.getFacility,
    { slug },
    { cache: 'no-cache' }
  );

  return result;
}

export const createBooking = async ({
  adults,
  checkinDate,
  checkoutDate,
  Facility,
  user,
}: CreateBookingDto) => {
  const mutation = {
    mutations: [
      {
        create: {
          _type: 'booking',
          user: { _type: 'reference', _ref: user },
          Facility: { _type: 'reference', _ref: Facility },
          checkinDate,
          checkoutDate,
          adults,
        },
      },
    ],
  };

  const { data } = await axios.post(
    `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET}`,
    mutation,
    { headers: { Authorization: `Bearer ${process.env.SANITY_STUDIO_TOKEN}` } }
  );

  return data;
};

export const updateFacility = async (FacilityId: string) => {
  const mutation = {
    mutations: [
      {
        patch: {
          id: FacilityId,
          set: {
            isBooked: true,
          },
        },
      },
    ],
  };

  const { data } = await axios.post(
    `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET}`,
    mutation,
    { headers: { Authorization: `Bearer ${process.env.SANITY_STUDIO_TOKEN}` } }
  );

  return data;
};

export async function getUserBookings(userId: string) {
  const result = await sanityClient.fetch<Booking[]>(
    queries.getUserBookingsQuery,
    {
      userId,
    },
    { cache: 'no-cache' }
  );

  return result;
}

export async function getUserData(userId: string) {
  const result = await sanityClient.fetch(
    queries.getUserDataQuery,
    { userId },
    { cache: 'no-cache' }
  );

  return result;
}

export async function checkReviewExists(
  userId: string,
  FacilityId: string
): Promise<null | { _id: string }> {
  const query = `*[_type == 'review' && user._ref == $userId && Facility._ref == $FacilityId][0] {
    _id
  }`;

  const params = {
    userId,
    FacilityId,
  };

  const result = await sanityClient.fetch(query, params);

  return result ? result : null;
}

export const updateReview = async ({
  reviewId,
  reviewText,
  userRating,
}: UpdateReviewDto) => {
  const mutation = {
    mutations: [
      {
        patch: {
          id: reviewId,
          set: {
            text: reviewText,
            userRating,
          },
        },
      },
    ],
  };

  const { data } = await axios.post(
    `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET}`,
    mutation,
    { headers: { Authorization: `Bearer ${process.env.SANITY_STUDIO_TOKEN}` } }
  );

  return data;
};

export const createReview = async ({
  FacilityId,
  reviewText,
  userId,
  userRating,
}: CreateReviewDto) => {
  const mutation = {
    mutations: [
      {
        create: {
          _type: 'review',
          user: {
            _type: 'reference',
            _ref: userId,
          },
          Facility: {
            _type: 'reference',
            _ref: FacilityId,
          },
          userRating,
          text: reviewText,
        },
      },
    ],
  };

  const { data } = await axios.post(
    `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET}`,
    mutation,
    { headers: { Authorization: `Bearer ${process.env.SANITY_STUDIO_TOKEN}` } }
  );

  return data;
};

export async function getFacilityReviews(facilityId: string) {
  const result = await sanityClient.fetch<Review[]>(
    queries.getFacilityReviewsQuery,
    {
      facilityId,
    },
    { cache: 'no-cache' }
  );

  return result;
}
