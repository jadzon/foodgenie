export interface Ingredient {
  name: string;
  amount: string;
  imageKey: string | null;
  calories?: string | number; // Dodane pole kalorii (opcjonalne)
}

export interface Dish {
  id: string;
  name: string;
  ingredients: Ingredient[];
  preparation?: string;
  mainImageKey?: string | null; // Opcjonalnie, klucz do zdjęcia głównego dania
}

export const DISHES_DATA: Dish[] = [
  {
    id: '1',
    name: 'Spaghetti Bolognese',
    mainImageKey: 'food.pasta', // Przykładowy klucz dla głównego zdjęcia (możesz użyć innego)
    ingredients: [
      { name: 'Makaron spaghetti', amount: '100g (suchy)', imageKey: 'food.pasta', calories: 350 },
      { name: 'Mięso mielone wołowe', amount: '150g', imageKey: 'food.beef', calories: 300 },
      { name: 'Passata pomidorowa', amount: '200g', imageKey: 'food.tomato', calories: 60 },
      { name: 'Cebula', amount: '1/2 sztuki', imageKey: 'food.onion', calories: 20 },
      { name: 'Czosnek', amount: '1 ząbek', imageKey: 'food.garlic', calories: 5 },
      { name: 'Marchewka', amount: '1/2 sztuki', imageKey: 'food.carrot', calories: 20 },
      { name: 'Oliwa z oliwek', amount: '1 łyżka', imageKey: 'food.oliveOil', calories: 120 },
      { name: 'Sól', amount: 'do smaku', imageKey: null, calories: 0 },
      { name: 'Czarny pieprz', amount: 'do smaku', imageKey: 'food.spice', calories: 1 },
    ],
    preparation:
      '1. Makaron ugotuj al dente zgodnie z instrukcją na opakowaniu.\n' +
      '2. Na dużej patelni rozgrzej oliwę. Dodaj posiekaną cebulę, czosnek i startą marchewkę. Smaż do zeszklenia (ok. 5 minut).\n' +
      '3. Dodaj mięso mielone. Smaż, rozdrabniając widelcem, aż mięso zbrązowieje.\n' +
      '4. Wlej passatę pomidorową. Dopraw solą i pieprzem. Możesz dodać szczyptę oregano lub bazylii (np. food.spice).\n' +
      '5. Zmniejsz ogień i duś pod przykryciem przez co najmniej 20-30 minut, aby smaki się połączyły.\n' +
      '6. Podawaj sos z ugotowanym makaronem. Możesz posypać startym parmezanem (np. food.cheese).',
  },
  {
    id: '2',
    name: 'Kurczak z Ryżem',
    mainImageKey: 'food.chicken',
    ingredients: [
      { name: 'Pierś z kurczaka', amount: '150g', imageKey: 'food.chickenBreast', calories: 250 },
      { name: 'Ryż biały', amount: '75g (suchy)', imageKey: 'food.rice', calories: 270 },
      { name: 'Brokuły (różyczki)', amount: '100g', imageKey: 'food.brocoli', calories: 35 },
      { name: 'Papryka czerwona', amount: '1/2 sztuki', imageKey: 'food.pepper', calories: 20 },
      { name: 'Cebula', amount: '1/4 sztuki', imageKey: 'food.onion', calories: 10 },
      { name: 'Sos sojowy', amount: '1 łyżka', imageKey: null, calories: 10 },
      { name: 'Olej sezamowy', amount: '1/2 łyżeczki', imageKey: 'food.cookingOil', calories: 45 },
      { name: 'Imbir (starty)', amount: '1/2 łyżeczki', imageKey: 'food.spice', calories: 2 },
    ],
    preparation:
      '1. Ryż ugotuj zgodnie z instrukcją na opakowaniu.\n' +
      '2. Pierś z kurczaka pokrój w kostkę. Paprykę i cebulę pokrój w paski.\n' +
      '3. Na patelni (najlepiej woku) rozgrzej olej sezamowy. Wrzuć kurczaka i smaż, aż będzie złocisty.\n' +
      '4. Dodaj cebulę, paprykę i starty imbir. Smaż przez 2-3 minuty.\n' +
      '5. Dodaj różyczki brokułów. Smaż jeszcze chwilę, aż brokuły lekko zmiękną, ale pozostaną chrupiące.\n' +
      '6. Wlej sos sojowy, wymieszaj. Duś przez minutę.\n' +
      '7. Podawaj kurczaka z warzywami na ugotowanym ryżu.',
  },  {
    id: '3',
    name: 'Jajecznica na maśle',
    mainImageKey: 'food.chicken',
    ingredients: [
      { name: 'Jajka', amount: '3 sztuki', imageKey: 'food.egg', calories: 250 },
      { name: 'Masło', amount: '1 łyżeczka', imageKey: 'food.butter', calories: 50 },
      { name: 'Sól', amount: 'szczypta', imageKey: null, calories: 0 },
      { name: 'Szczypiorek (opcjonalnie)', amount: '1 łyżka', imageKey: 'food.onion', calories: 0 }
    ],
    preparation:
      '1. Na małej patelni rozpuść masło na średnim ogniu.\n' +
      '2. Jajka wbij do miseczki, lekko roztrzep widelcem, dopraw solą.\n' +
      '3. Wylej masę jajeczną na rozgrzane masło.\n' +
      '4. Smaż, mieszając delikatnie, aż jajka zetną się do preferowanej konsystencji.\n' +
      '5. Przełóż na talerz, opcjonalnie posyp posiekanym szczypiorkiem.',
    
  },
];