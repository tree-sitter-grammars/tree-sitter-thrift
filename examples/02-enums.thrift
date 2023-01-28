enum TweetType {
    TWEET,       // Enums are specified C-style. Compiler assigns default values starting at 0.
    RETWEET = 2, // You can of course, supply specific integral values for constants.
    DM = 0xa,    // Hex values are also acceptable.
    REPLY
}                // Again notice no trailing semi-colon 

struct Tweet {
    1: required i32 userId;
    2: required string userName;
    3: required string text;
    4: optional Location loc;
    5: optional TweetType tweetType = TweetType.TWEET // Use the fully qualified name of the constant when assigning default values.
    16: optional string language = "english"
}
