import type { TriviaQuestion } from "@/lib/types";

export const triviaQuestions: TriviaQuestion[] = [
  {
    id: 1,
    question: "In which year did Adhi & Satya tie the knot?",
    options: [
      { text: "1999", isCorrect: false },
      { text: "2000", isCorrect: false },
      { text: "2001", isCorrect: true },
      { text: "2002", isCorrect: false },
    ],
    explanation:
      "They got married on 23 November 2001, beginning 25 glorious years of togetherness!",
    category: "wedding",
  },
  {
    id: 2,
    question: "What colour was Satya's wedding saree?",
    options: [
      { text: "Red and Gold", isCorrect: false },
      { text: "Pink and Gold", isCorrect: true },
      { text: "Maroon and Green", isCorrect: false },
      { text: "White and Gold", isCorrect: false },
    ],
    explanation:
      "Satya wore a gorgeous pink and gold Kanjeevaram pattu saree on their wedding day!",
    category: "wedding",
  },
  {
    id: 3,
    question: "What was Adhi wearing on their special wedding celebration day?",
    options: [
      { text: "White Kurta", isCorrect: false },
      { text: "Silk Dhoti", isCorrect: false },
      { text: "Yellow Kurta", isCorrect: false },
      { text: "Blue Shirt", isCorrect: true },
    ],
    explanation:
      "Adhi looked handsome and classic in his signature blue shirt!",
    category: "wedding",
  },
  {
    id: 4,
    question: "What does Adhi always order at a restaurant, no matter what?",
    options: [
      { text: "Chicken Biryani", isCorrect: true },
      { text: "Gongura Mutton", isCorrect: false },
      { text: "Natu Kodi Pulusu", isCorrect: false },
      { text: "Royyala Vepudu", isCorrect: false },
    ],
    explanation:
      "No matter what Andhra delicacies are on the menu, Adhi always asks: 'Biryani undha?' and orders Chicken Biryani!",
    category: "habits",
  },
  {
    id: 5,
    question: "What is Satya's signature dish that the whole family loves?",
    options: [
      { text: "Gutti Vankaya Koora", isCorrect: false },
      { text: "Gongura Pachadi & Mudda Pappu", isCorrect: false },
      { text: "Sunday Biryani", isCorrect: true },
      { text: "Pulihora & Garelu", isCorrect: false },
    ],
    explanation:
      "Satya's Sunday Biryani made with extra love and extra masala is the family's ultimate favourite!",
    category: "favourites",
  },
  {
    id: 6,
    question: "What is Adhi and Satya's favourite park in Vizag?",
    options: [
      { text: "VUDA Park", isCorrect: false },
      { text: "Tenneti Park", isCorrect: false },
      { text: "Kailasagiri", isCorrect: false },
      { text: "All of the above", isCorrect: true },
    ],
    explanation:
      "They love all of Vizag's scenic spots — VUDA Park, Tenneti Park, and Kailasagiri!",
    category: "memories",
  },
  {
    id: 7,
    question: "Who is always the first one to dance at any family party or celebration?",
    options: [
      { text: "Satya", isCorrect: false },
      { text: "Both", isCorrect: false },
      { text: "Adhi", isCorrect: true },
      { text: "None", isCorrect: false },
    ],
    explanation:
      "Adhi is always the life of the celebration and the very first one to get the dance floor started!",
    category: "funny",
  },
  {
    id: 8,
    question: "What is Satya's absolute favourite snack or food?",
    options: [
      { text: "Pani Puri", isCorrect: false },
      { text: "Pav Bhaji", isCorrect: true },
      { text: "Chaat", isCorrect: false },
      { text: "Samosa", isCorrect: false },
    ],
    explanation:
      "Pav Bhaji is Satya's all-time favourite! Adhi even took her all the way to Mumbai just to treat her to authentic pav bhaji.",
    category: "favourites",
  },
  {
    id: 9,
    question: "What is Adhi's favourite habit every single morning?",
    options: [
      { text: "Seeing all the faces of family", isCorrect: true },
      { text: "Drinking hot filter coffee in silence", isCorrect: false },
      { text: "Reading the sports news first", isCorrect: false },
      { text: "Going for a brisk morning walk", isCorrect: false },
    ],
    explanation:
      "The very first and most precious thing Adhi loves every morning is seeing all the faces of his family!",
    category: "habits",
  },
  {
    id: 10,
    question: "What is Adhi's favourite way to playfully annoy Satya?",
    options: [
      { text: "Hiding the TV remote control", isCorrect: false },
      { text: "Pretending to forget what she said", isCorrect: false },
      { text: "Putting extra chillies in cooking", isCorrect: false },
      { text: "Irritating her by keeping things in suspense", isCorrect: true },
    ],
    explanation:
      "Adhi's favourite way of showing love is playfully irritating Satya by keeping everything in suspense!",
    category: "funny",
  },
];
