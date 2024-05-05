import { defineField } from 'sanity';

const facilityTypes = [
  { title: 'Amphitheatre', value: 'amphitheatre' },
  { title: 'ConferenceFacility', value: 'conferenceFacility' },
  { title: 'Class', value: 'class' },
];

const facility = {
  name: 'facility',
  title: 'facility',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule =>
        Rule.required().max(50).error('Maximum 50 Characters'),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'name',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: Rule =>
        Rule.required().min(100).error('Minimum 100 Characters'),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'url', type: 'url', title: 'URL' },
            { name: 'file', type: 'file', title: 'File' },
          ],
        },
      ],
      validation: Rule =>
        Rule.required().min(3).error('Minimum of 3 images required'),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'object',
      fields: [
        { name: 'url', type: 'url', title: 'URL' },
        { name: 'file', type: 'file', title: 'File' },
      ],
      validation: Rule => Rule.required().error('Cover Image is required'),
    }),
    defineField({
      name: 'type',
      title: 'Facility Type',
      type: 'string',
      options: {
        list: facilityTypes,
      },
      validation: Rule => Rule.required(),
      initialValue: 'Amphitheatre',
    }),
    defineField({
      name: 'specialNote',
      title: 'Special Note',
      type: 'text',
      validation: Rule => Rule.required(),
      initialValue:
        'Check-in time is 12:00 PM, checkout time is 11:59 AM. If you leave behind any items, please contact the receptionist.',
    }),
    defineField({
      name: 'dimension',
      title: 'Dimension',
      type: 'string',
    }),
    defineField({
      name: 'numberOfSeats',
      title: 'Number Of Seats',
      type: 'number',
      validation: Rule => Rule.min(1),
      initialValue: 1,
    }),
    defineField({
      name: 'offeredAmenities',
      title: 'Offered Amenities',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'icon', title: 'Icon', type: 'string' },
            { name: 'amenity', title: 'Amenity', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'isBooked',
      title: 'Is Booked',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isFeatured',
      title: 'Is Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'reviews',
      title: 'Reviews',
      type: 'array',
      of: [{ type: 'review' }],
    }),
  ],
};

export default facility;
