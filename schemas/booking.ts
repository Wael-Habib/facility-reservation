import { defineField } from 'sanity';

const booking = {
  name: 'booking',
  title: 'Booking',
  type: 'document',
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'facility',
      title: 'facility',
      type: 'reference',
      to: [{ type: 'facility' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'checkinDate',
      title: 'Check-in Date',
      type: 'date',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'checkoutDate',
      title: 'Check-out Date',
      type: 'date',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'numberOfDays',
      title: 'Number Of Days',
      type: 'number',
      initialValue: 1,
      validation: Rule => Rule.required().min(1),
    }),
  ],
};

export default booking;
