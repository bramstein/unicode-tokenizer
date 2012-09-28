module.exports = {
   // A line break opportunity exists between two adjacent
   // characters of the given line breaking classes.
   // Example: break before an em-dash
   DIRECT: 0,

   // A line break opportunity exists between two characters
   // of the given line breaking classes only if they are
   // separated by one or more spaces.
   // Example: two words separated by a space
   INDIRECT: 1,

   COMBINING_INDIRECT: 2,

   COMBINING_PROHIBITED: 3,

   // No line break opportunity exists between two characters
   // of the given line breaking classes, even if they are
   // separated by one or more space characters.
   // Example: non-breaking space
   PROHIBITED: 4,

   // A line must break following a character that has the
   // mandatory break property.
   EXPLICIT: 5
};
