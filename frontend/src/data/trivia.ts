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
      { text: "Pink and Gold", isCorrect: true },
      { text: "Red and Gold", isCorrect: false },
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
      { text: "Blue Shirt", isCorrect: true },
      { text: "White Kurta", isCorrect: false },
      { text: "Silk Dhoti", isCorrect: false },
      { text: "Yellow Kurta", isCorrect: false },
    ],
    explanation:
      "Adhi looked handsome and classic in his signature blue shirt!",
    category: "wedding",
  },
  {
    id: 4,
    question: "What does Adhi always order at a restaurant, no matter what?",
    options: [
      { text: "Gongura Mutton", isCorrect: false },
      { text: "Natu Kodi Pulusu", isCorrect: false },
      { text: "Chicken Biryani", isCorrect: true },
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
      { text: "Sunday Biryani", isCorrect: true },
      { text: "Gongura Pachadi & Mudda Pappu", isCorrect: false },
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
    question: "What does Adhi always say to Satya when he is running late?",
    options: [
      { text: "'Five more minutes, almost ready!'", isCorrect: true },
      { text: "'I'm already in the car!'", isCorrect: false },
      { text: "'Traffic is very heavy today!'", isCorrect: false },
      { text: "'You go ahead, I will catch up!'", isCorrect: false },
    ],
    explanation:
      "Adhi's famous 'five minutes' is an eternal family joke — five minutes always turns into thirty!",
    category: "funny",
  },
  {
    id: 8,
    question: "Who is always the first one to dance at any family party or celebration?",
    options: [
      { text: "Adhi", isCorrect: true },
      { text: "Satya", isCorrect: false },
      { text: "Both", isCorrect: false },
      { text: "None", isCorrect: false },
    ],
    explanation:
      "Adhi is always the life of the celebration and the very first one to get the dance floor started!",
    category: "funny",
  },
  {
    id: 9,
    question: "What is Satya's absolute favourite snack or food?",
    options: [
      { text: "Pav Bhaji", isCorrect: true },
      { text: "Chaat", isCorrect: false },
      { text: "Pani Puri", isCorrect: false },
      { text: "Samosa", isCorrect: false },
    ],
    explanation:
      "Pav Bhaji is Satya's all-time favourite! Adhi even took her all the way to Mumbai just to treat her to authentic pav bhaji.",
    category: "favourites",
  },
  {
    id: 10,
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
    id: 11,
    question: "What is Adhi's favourite way to playfully annoy Satya?",
    options: [
      { text: "Irritating her by keeping things in suspense", isCorrect: true },
      { text: "Hiding the TV remote control", isCorrect: false },
      { text: "Pretending to forget what she said", isCorrect: false },
      { text: "Putting extra chillies in cooking", isCorrect: false },
    ],
    explanation:
      "Adhi's favourite way of showing love is playfully irritating Satya by keeping everything in suspense!",
    category: "funny",
  },
];
