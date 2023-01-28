service Twitter {
    // A method definition looks like C code. It has a return type, arguments,
    // and optionally a list of exceptions that it may throw. Note that argument
    // lists and exception list are specified using the exact same syntax as
    // field lists in structs.
    void ping(),                                                             // Confusingly, method definitions can be terminated using comma or semi-colon
    bool postTweet(1:Tweet tweet) throws (1:TwitterUnavailable unavailable), // Arguments can be primitive types or structs
    TweetSearchResult searchTweets(1:string query);                          // Likewise for return types

    // The 'oneway' modifier indicates that the client only makes a request and
    // does not wait for any response at all. Oneway methods MUST be void.
    oneway void zip()                                                        // void is a valid return type for functions
}

// Nested Types
// As of this writing, Thrift does NOT support nested type definitions.
// That is, you may not define a struct (or an enum) within a struct; you may of course use structs/enums within other structs.
