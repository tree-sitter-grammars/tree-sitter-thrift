include "tweet.thrift"           // File names must be quoted; again notice the absent semi-colon.
// ...
struct TweetSearchResult {
    1: list<tweet.Tweet> tweets; // Note the tweet prefix.
}
