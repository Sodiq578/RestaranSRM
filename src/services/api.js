export const fetchMenu = async () => {
    return Promise.resolve([
      // Asosiy taomlar
      { id: 1, name: "Osh", price: 25000, category: "Asosiy taom", description: "An'anaviy o'zbek oshi", calories: 450 },
      { id: 2, name: "Manti", price: 18000, category: "Asosiy taom", description: "Qo'y go'shtidan tayyorlangan manti", calories: 380 },
      { id: 3, name: "Lag'mon", price: 22000, category: "Asosiy taom", description: "Uyg'urcha qovurilgan lag'mon", calories: 420 },
      { id: 4, name: "Chuchvara", price: 15000, category: "Asosiy taom", description: "Uy chuchvarasi qaymoq bilan", calories: 320 },
      { id: 5, name: "Qozon kabob", price: 30000, category: "Asosiy taom", description: "Qo'y go'shtidan qozon kabob", calories: 500 },
      
      // Ichimliklar
      { id: 6, name: "Choy", price: 3000, category: "Ichimlik", description: "Qora yoki ko'k choy", calories: 5 },
      { id: 7, name: "Cola", price: 8000, category: "Ichimlik", description: "1 litrli Coca-Cola", calories: 150 },
      { id: 8, name: "Fanta", price: 8000, category: "Ichimlik", description: "1 litrli Fanta", calories: 140 },
      { id: 9, name: "Sok", price: 7000, category: "Ichimlik", description: "Tabiiy meva sharbati", calories: 120 },
      { id: 10, name: "Ayron", price: 5000, category: "Ichimlik", description: "Suzma ayron", calories: 80 },
      
      // Salatlar
      { id: 11, name: "Achichuk", price: 10000, category: "Salat", description: "Pomidor, bodring va piyoz", calories: 90 },
      { id: 12, name: "Sezar", price: 18000, category: "Salat", description: "Sezar salati tovuq go'shti bilan", calories: 220 },
      { id: 13, name: "Mevsalat", price: 15000, category: "Salat", description: "Turli xil yangi mevalar", calories: 130 },
      
      // Desertlar
      { id: 14, name: "Keks", price: 10000, category: "Desert", description: "Shokoladli keks", calories: 250 },
      { id: 15, name: "Medovik", price: 15000, category: "Desert", description: "An'anaviy rus medovik torti", calories: 350 },
      { id: 16, name: "Pahlava", price: 12000, category: "Desert", description: "Sharqona pahlava", calories: 280 },
      { id: 17, name: "Muzqaymoq", price: 8000, category: "Desert", description: "Turli xil ta'mdagi muzqaymoq", calories: 200 },
      
      // Garnirlar
      { id: 18, name: "Fries", price: 9000, category: "Garnir", description: "Qovurilgan kartoshka", calories: 300 },
      { id: 19, name: "Qazi", price: 20000, category: "Garnir", description: "Qazi mahsuloti", calories: 400 },
      { id: 20, name: "Non", price: 2000, category: "Garnir", description: "Issiq non", calories: 150 },
      
      // Fast food
      { id: 21, name: "Lavash", price: 22000, category: "Fast food", description: "Tovuqli lavash", calories: 380 },
      { id: 22, name: "Burger", price: 25000, category: "Fast food", description: "Mol go'shtli burger", calories: 450 },
      { id: 23, name: "Hot-dog", price: 15000, category: "Fast food", description: "Klassik hot-dog", calories: 280 },
      
      // Shirinliklar
      { id: 24, name: "Halva", price: 7000, category: "Shirinlik", description: "Yer o'sti halvasi", calories: 320 },
      { id: 25, name: "Navat", price: 5000, category: "Shirinlik", description: "Tabiiy oq shakar", calories: 200 },
      
      // Nonushta
      { id: 26, name: "Qaymoq non", price: 12000, category: "Nonushta", description: "Qaymoq va issiq non", calories: 250 },
      { id: 27, name: "Omlet", price: 15000, category: "Nonushta", description: "3 tuxumdan tayyorlangan omlet", calories: 180 },
      { id: 28, name: "Sasiska", price: 18000, category: "Nonushta", description: "Qovurilgan sasiska", calories: 220 }
    ]);
  };