import type { TriviaQuestion } from "@/lib/types";

export const triviaQuestions: TriviaQuestion[] = [
  {
    id: 1,
    question: "In which year did they tie the knot?",
    options: [
      { text: "1997", isCorrect: false },
      { text: "1998", isCorrect: false },
      { text: "1999", isCorrect: true },
      { text: "2000", isCorrect: false },
    ],
    explanation:
      "They got married in December 1999, just in time to start the new millennium together!",
    category: "wedding",
  },
  {
    id: 2,
    question: "What colour was the bride's wedding outfit?",
    options: [
      { text: "Red and gold", isCorrect: true },
      { text: "Pink and silver", isCorrect: false },
      { text: "Maroon and green", isCorrect: false },
      { text: "White and gold", isCorrect: false },
    ],
    explanation:
      "She wore a stunning red and gold Kanjeevaram saree that her mother had chosen — a family heirloom passed down with love.",
    category: "wedding",
  },
  {
    id: 3,
    question: "What does Dad always order at a restaurant, no matter what?",
    options: [
      { text: "Butter Chicken", isCorrect: false },
      { text: "Paneer Tikka", isCorrect: false },
      { text: "Chicken Biryani", isCorrect: true },
      { text: "Dal Makhani", isCorrect: false },
    ],
    explanation:
      "No matter how fancy the restaurant, Dad's answer is always the same: 'Let me check if they have biryani.' Spoiler: he always checks.",
    category: "habits",
  },
  {
    id: 4,
    question: "What is Mom's signature dish that the whole family loves?",
    options: [
      { text: "Rajma Chawal", isCorrect: false },
      { text: "Sunday Biryani", isCorrect: true },
      { text: "Chole Bhature", isCorrect: false },
      { text: "Aloo Paratha", isCorrect: false },
    ],
    explanation:
      "Mom's Sunday Biryani is legendary. The neighbours can smell it, the kids plan their visits around it, and Dad claims it's better than any restaurant's.",
    category: "favourites",
  },
  {
    id: 5,
    question: "Where did the family go for their first holiday together?",
    options: [
      { text: "Shimla", isCorrect: false },
      { text: "Kerala", isCorrect: false },
      { text: "Goa", isCorrect: true },
      { text: "Ooty", isCorrect: false },
    ],
    explanation:
      "Goa it was! Sandy toes, sunset walks, and the kids seeing the ocean for the very first time. It became their happy place.",
    category: "memories",
  },
  {
    id: 6,
    question: "What is their go-to Bollywood movie for a rewatch night?",
    options: [
      { text: "Sholay", isCorrect: false },
      { text: "Dilwale Dulhania Le Jayenge", isCorrect: true },
      { text: "Kabhi Khushi Kabhie Gham", isCorrect: false },
      { text: "3 Idiots", isCorrect: false },
    ],
    explanation:
      "DDLJ is the undisputed champion. Dad still does the Raj pose with the outstretched arms, and Mom still pretends to be embarrassed (she's not).",
    category: "favourites",
  },
  {
    id: 7,
    question:
      "What embarrassing thing happened at their 15th anniversary party?",
    options: [
      { text: "Dad forgot the anniversary date", isCorrect: false },
      { text: "The cake was lopsided", isCorrect: true },
      { text: "Mom wore mismatched shoes", isCorrect: false },
      { text: "The DJ played the wrong song", isCorrect: false },
    ],
    explanation:
      "The kids baked the cake themselves. It was crooked, the icing was uneven, and it was absolutely the most beautiful cake ever because it was made with love (and a lot of YouTube tutorials).",
    category: "funny",
  },
  {
    id: 8,
    question: "What does Mom always say when Dad is running late?",
    options: [
      { text: "'Typical!'", isCorrect: false },
      { text: "'Five more minutes means thirty!'", isCorrect: true },
      { text: "'I'm leaving without you!'", isCorrect: false },
      { text: "'Call me when you're ready.'", isCorrect: false },
    ],
    explanation:
      "It's become a family catchphrase. Dad's 'five minutes' is a unit of time that exists nowhere in physics — it could mean anything from ten minutes to an hour.",
    category: "funny",
  },
  {
    id: 9,
    question: "How did they celebrate their 20th anniversary?",
    options: [
      { text: "A trip to Europe", isCorrect: false },
      { text: "A big party at a hotel", isCorrect: false },
      { text: "A quiet vow renewal at home", isCorrect: true },
      { text: "A surprise flash mob", isCorrect: false },
    ],
    explanation:
      "For their 20th, they kept it intimate — a small vow renewal in the living room with close family. There wasn't a dry eye in the house.",
    category: "memories",
  },
  {
    id: 10,
    question: "What song did they dance to at their wedding?",
    options: [
      { text: "Tujhe Dekha Toh", isCorrect: true },
      { text: "Mere Haath Mein", isCorrect: false },
      { text: "Pehla Nasha", isCorrect: false },
      { text: "Kal Ho Naa Ho", isCorrect: false },
    ],
    explanation:
      "It had to be 'Tujhe Dekha Toh Yeh Jaana Sanam' from DDLJ. Their favourite movie, their favourite song, their favourite moment.",
    category: "wedding",
  },
  {
    id: 11,
    question: "What quirky habit does Dad have every morning?",
    options: [
      { text: "Reads the newspaper back to front", isCorrect: true },
      { text: "Does yoga in the garden", isCorrect: false },
      { text: "Sings in the shower", isCorrect: false },
      { text: "Makes the bed military-style", isCorrect: false },
    ],
    explanation:
      "Sports section first, then entertainment, then headlines. The family has tried to understand the logic. There is none. It's just Dad being Dad.",
    category: "habits",
  },
  {
    id: 12,
    question: "What is the family's secret code phrase for 'I love you'?",
    options: [
      { text: "'Did you eat?'", isCorrect: true },
      { text: "'Drive safe!'", isCorrect: false },
      { text: "'Take care!'", isCorrect: false },
      { text: "'Come home soon!'", isCorrect: false },
    ],
    explanation:
      "In this family, 'Did you eat?' is the ultimate expression of love. It means 'I'm thinking about you, I care about you, and I want you to be okay.' Peak desi love language.",
    category: "funny",
  },
];
