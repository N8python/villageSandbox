const talkingTree = {
    "idle": [
        "I'm $(waitVerb) $(actionVerb) $(randomItem).",
        "In $(freeTime) I $(emotionWord) $(randomItem).",
        "I'm feeling $(emotionStatus).",
        "I've been feeling $(emotionStatus) since $(time) ago.",
        "The weather is $(quality). Do you $(statusWord) this weather?",
        "I remember $(timeSignifier) where $(nostalgia). We would $(nostalgiaLore)."
    ],
    "nostalgiaLore": [
        "huddle around the fire",
        "play games in the yard",
        "travel on great airships",
        "descend to the surface"
    ],
    "nostalgia": [
        "there was more food",
        "there were... other things",
        "there... well I can't remember now",
        "there was fighting"
    ],
    "timeSignifier": [
        "a day",
        "a time",
        "an age",
        "an era"
    ],
    "quality": [
        "amazing",
        "great",
        "good",
        "fair",
        "bad",
        "poor",
        "horrible"
    ],
    "time": [
        "one hour",
        "two hours",
        "three hours",
        "half a day",
        "one day",
        "two days",
        "three days",
        "one week",
        "two weeks",
        "three weeks",
        "one month"
    ],
    "emotionStatus": [
        "happy",
        "bored",
        "sad",
        "upbeat",
        "meh",
        "worried",
        "excited for the future"
    ],
    "freeTime": [
        "my free time",
        "the small bits of time I have",
        "my spare time",
    ],
    "statusWord": [
        "love",
        "like",
        "not care for",
        "dislike",
        "hate"
    ],
    "emotionWord": [
        "like",
        "hate",
        "kinda enjoy",
        "would never try",
        "sometimes try"
    ],
    "waitVerb": [
        "waiting",
        "hoping",
        "going",
        "yearning"
    ],
    "actionVerb": [
        "to attempt",
        "to try"
    ],
    "randomItem": [
        "chopping wood",
        "mining rocks",
        "something",
        "something new",
        "gathering grass",
        "finding seashells",
        "playing in the ocean"
    ]
}

const genSentence = (source) => {
    const opts = talkingTree[source];
    const chosen = opts[Math.floor(Math.random() * opts.length)].replace(/\$\(.+?\)/g, src => {
        return genSentence(src.slice(2, -1));
    });
    return chosen;
}