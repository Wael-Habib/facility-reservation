import { defineField } from "sanity";
const room = {
    name: "room",
    title: "Room",
    type: "document",
    fields:[
        defineField({
            name: "name",
            title: "Name",
            type: "string",
            validation: Rule => Rule.required().max(10).error("Maximum 10 Characters"), //this 10 depends on rooms string length
        }),
    ]
};

export default room;