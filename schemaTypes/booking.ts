import { Rule } from "postcss";
import { defineField } from "sanity";

const booking = {
    name: "booking",
    title: "Booking",
    type: "document",
    fields:[
        defineField({
            name: "user",
            title: "user",
            type: "reference",
            to: [{ type: "user" }],
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "facility",
            title: "Facility",
            type: "reference",
            to: [{ type: "room" }],
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "checkinDate",
            title: "Check-in Date",
            type: "date",
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "checkoutDate",
            title: "Check-out Date",
            type: "date",
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "numberOfDays",
            title: "Number Of Days",
            type: "number",
            initialValue: 1,
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "students",
            title: "Students",
            type: "number",
            initialValue: 0,
            validation: Rule => Rule.required().min(0),
        }),
    ]
};

export default booking;