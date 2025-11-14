import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, BillItem, User, SavedBill } from './types';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import BillingSection from './components/BillingSection';
import LoginModal from './components/LoginModal';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import CategoryFilter from './components/CategoryFilter';
import SavedBillsModal from './components/SavedBillsModal';

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Parle-G Biscuit', price: 10, category: 'Groceries' },
  { id: 2, name: 'Amul Milk 1L', price: 55, category: 'Dairy' },
  { id: 3, name: 'Tata Salt 1kg', price: 25, category: 'Groceries' },
  { id: 4, name: 'Fortune Oil 1L', price: 150, category: 'Groceries', imageUrl: 'https://i.imgur.com/s6aBqj7.jpeg' },
  { id: 5, name: 'Aashirvaad Atta 5kg', price: 250, category: 'Groceries' },
  { id: 6, name: 'Dettol Soap', price: 40, category: 'Personal Care' },
  { id: 7, name: 'Colgate Toothpaste', price: 90, category: 'Personal Care', imageUrl: 'https://i.imgur.com/uS2tVda.jpeg' },
  { id: 8, name: 'Surf Excel 1kg', price: 200, category: 'Household' },
  { id: 9, name: 'Maggi Noodles', price: 14, category: 'Snacks' },
  { id: 10, name: 'Brooke Bond Tea 250g', price: 120, category: 'Beverages', imageUrl: 'https://i.imgur.com/sS5O5yM.jpeg' },
  { id: 11, name: 'Nescafe Coffee 50g', price: 150, category: 'Beverages' },
  { id: 12, name: 'Britannia Bread', price: 45, category: 'Bakery' },
  { id: 13, name: 'Amul Butter 100g', price: 52, category: 'Dairy', imageUrl: 'https://i.imgur.com/UfGFLFf.jpeg' },
  { id: 14, name: 'Lays Chips', price: 20, category: 'Snacks' }
];

const GST_RATE = 0.18; // 18% GST
const SAVED_BILLS_KEY = 'retailBillingApp-savedBills';


const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Product[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [savedBills, setSavedBills] = useState<SavedBill[]>([]);
  const [isSavedBillsModalOpen, setIsSavedBillsModalOpen] = useState(false);

  // Load saved bills from localStorage on initial render
  useEffect(() => {
    try {
      const storedBills = localStorage.getItem(SAVED_BILLS_KEY);
      if (storedBills) {
        setSavedBills(JSON.parse(storedBills));
      }
    } catch (error) {
      console.error("Failed to load bills from localStorage:", error);
    }
  }, []);

  // AI Avatar Generation
  const generateAvatar = useCallback(async (name: string) => {
    setCurrentUser(prev => prev ? { ...prev, isGeneratingAvatar: true } : { name, isGeneratingAvatar: true });
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Generate a unique, abstract, minimalist professional avatar for a cashier named '${name}'. Use a vibrant, friendly color palette with a clean, dark-grey background. The avatar should be modern and geometric, not a realistic portrait.` }],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
          setCurrentUser(prev => prev ? { ...prev, avatarUrl: imageUrl, isGeneratingAvatar: false } : null);
          return;
        }
      }
    } catch (error) {
      console.error("Avatar generation failed:", error);
      setCurrentUser(prev => prev ? { ...prev, isGeneratingAvatar: false } : null);
    }
  }, []);

  // Initial Product Image Generation
  useEffect(() => {
    const generateMissingImages = async () => {
      const productsToUpdate = products.filter(p => !p.imageUrl);
      if (productsToUpdate.length === 0) return;

      setProducts(prevProducts =>
        prevProducts.map(p =>
          !p.imageUrl ? { ...p, isGeneratingImage: true } : p
        )
      );

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imageGenerationPromises = productsToUpdate.map(async (product) => {
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: `A professional, clean product photograph of ${product.name}, on a dark background.` }] },
              config: { responseModalities: [Modality.IMAGE] },
            });
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                return { id: product.id, imageUrl };
              }
            }
          } catch (error) {
            console.error(`Failed to generate image for ${product.name}:`, error);
          }
          return { id: product.id, imageUrl: null };
        });
        
        const generatedImages = await Promise.all(imageGenerationPromises);

        setProducts(prevProducts => {
          const productsMap = new Map(generatedImages.filter(img => img.imageUrl).map(img => [img.id, img.imageUrl as string]));
          return prevProducts.map(p => {
            const newImageUrl = productsMap.get(p.id);
            return { ...p, imageUrl: newImageUrl ? newImageUrl : p.imageUrl, isGeneratingImage: false };
          });
        });

      } catch (error) {
        console.error("Error during image generation:", error);
        setProducts(prevProducts => prevProducts.map(p => ({ ...p, isGeneratingImage: false })));
      }
    };

    generateMissingImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AI Product Suggestions
  useEffect(() => {
    const fetchAiSuggestions = async () => {
      if (billItems.length === 0) {
        setAiSuggestions([]);
        return;
      }
      setIsFetchingSuggestions(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const lastAddedItem = billItems[billItems.length - 1];
        const billItemIds = new Set(billItems.map(item => item.id));
        const availableForSuggestion = products.filter(p => !billItemIds.has(p.id));
        
        const prompt = `A customer just added '${lastAddedItem.name}' to their cart. Based on the items in the cart, suggest 3 complementary products from the available list.
        Current cart items: ${billItems.map(i => i.name).join(', ')}.
        Available products for suggestion: ${JSON.stringify(availableForSuggestion.map(p => ({ id: p.id, name: p.name, category: p.category })))}.
        Respond with ONLY a JSON object containing an array of the recommended product IDs.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendations: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER }
                        }
                    }
                }
            }
        });

        const recommendationData = JSON.parse(response.text);
        const recommendedIds = recommendationData.recommendations || [];
        const suggestions = products.filter(p => recommendedIds.includes(p.id));
        setAiSuggestions(suggestions);

      } catch (error) {
        console.error("Failed to fetch AI suggestions:", error);
        setAiSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    };
    fetchAiSuggestions();
  }, [billItems, products]);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'All' || p.category === selectedCategory)
    );
  }, [products, searchTerm, selectedCategory]);

  const { subtotal, gstAmount, total } = useMemo(() => {
    const subtotal = billItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const gstAmount = subtotal * GST_RATE;
    const total = subtotal + gstAmount;
    return { subtotal, gstAmount, total };
  }, [billItems]);

  const handleAddProduct = (product: Product) => {
    setBillItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      setBillItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: number) => {
    setBillItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const handleClearBill = () => {
    setBillItems([]);
    setAiSuggestions([]);
  };

  const handleSaveBill = () => {
    if (billItems.length === 0) return;
    const newSavedBill: SavedBill = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: billItems,
      subtotal,
      gstAmount,
      total,
    };
    const updatedSavedBills = [newSavedBill, ...savedBills];
    setSavedBills(updatedSavedBills);
    localStorage.setItem(SAVED_BILLS_KEY, JSON.stringify(updatedSavedBills));
    handleClearBill();
  };

  const handleLoadBill = (billId: number) => {
    const billToLoad = savedBills.find(bill => bill.id === billId);
    if (billToLoad) {
      setBillItems(billToLoad.items);
      setIsSavedBillsModalOpen(false);
    }
  };

  const handleDeleteBill = (billId: number) => {
    const updatedSavedBills = savedBills.filter(bill => bill.id !== billId);
    setSavedBills(updatedSavedBills);
    localStorage.setItem(SAVED_BILLS_KEY, JSON.stringify(updatedSavedBills));
  };

  const handleLogin = async (username: string) => {
    setCurrentUser({ name: username });
    setIsLoginModalOpen(false);
    await generateAvatar(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleClearBill();
  };

  const handleRegenerateAvatar = () => {
    if (currentUser) {
      generateAvatar(currentUser.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header 
        currentUser={currentUser}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onRegenerateAvatar={handleRegenerateAvatar}
        onOpenSavedBills={() => setIsSavedBillsModalOpen(true)}
        savedBillsCount={savedBills.length}
      />
      <main className="flex flex-col lg:flex-row p-4 gap-4 max-w-screen-2xl mx-auto">
        <div className="lg:w-3/5 xl:w-2/3 flex flex-col">
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-white"
            />
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <ProductGrid products={filteredProducts} onAddProduct={handleAddProduct} />
        </div>
        <div className="lg:w-2/5 xl:w-1/3">
          <BillingSection
            items={billItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearBill={handleClearBill}
            onSaveBill={handleSaveBill}
            subtotal={subtotal}
            gstAmount={gstAmount}
            total={total}
            aiSuggestions={aiSuggestions}
            isFetchingSuggestions={isFetchingSuggestions}
            onAddProduct={handleAddProduct}
          />
        </div>
      </main>
      {isLoginModalOpen && (
        <LoginModal 
          onLogin={handleLogin}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
      {isSavedBillsModalOpen && (
        <SavedBillsModal
          bills={savedBills}
          onLoadBill={handleLoadBill}
          onDeleteBill={handleDeleteBill}
          onClose={() => setIsSavedBillsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;