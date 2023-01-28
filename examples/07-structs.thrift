struct Location {                            // Multiple structs can be defined and referred to within the same Thrift file
    1: required double latitude;
    2: required double longitude;
}

struct Tweet {
    1: required i32 userId;                  // Every field must have a unique, positive integer identifier
    2: required string userName;             // Fields may be marked as required or optional
    3: required string text;
    4: optional Location loc;                // Structs may contain other structs
    16: optional string language = "english" // You may specify an optional "default" value for a field
}

// Required Is Forever
// You should be very careful about marking fields as required.
// If at some point you wish to stop writing or sending a required field,
// it will be problematic to change the field to an optional field — 
// old readers will consider messages without this field to be incomplete and may reject or drop them unintentionally. 
// You should consider writing application-specific custom validation routines for your buffers instead. 
// Some have come to the conclusion that using required does more harm than good; they prefer to use only optional. 
// However, this view is not universal.
