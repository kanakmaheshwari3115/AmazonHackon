
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import { GeneratedProductIdea, ExternalAnalysisResult, BarcodeAnalysisResult, VoiceCommandInterpretation, VoiceCommandAction, MarketplaceListing, MarketplaceChatMessage } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "API_KEY for Gemini is not set. AI features will be disabled. " +
    "Please set the API_KEY environment variable."
  );
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const isGeminiAvailable = (): boolean => {
  return !!ai;
};

export const getEcoTip = async (): Promise<string> => {
  if (!ai) return "AI Service is unavailable. API key might be missing.";
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: "Provide a concise and actionable sustainable shopping tip. Max 50 words.",
    });
    return response.text ?? "Sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error fetching eco tip:", error);
    return "Could not fetch an eco tip at this time. Embrace reusable bags!";
  }
};

export const generateProductDescription = async (productName: string, category: string, userEcoInterests?: string[]): Promise<string> => {
  if (!ai) return `Details for ${productName} (${category}) are currently unavailable. This product promotes sustainability in the ${category} sector.`;
  try {
    let prompt = `Generate a compelling, eco-focused product description for "${productName}" in the category "${category}". Max 70 words. Highlight its key sustainable features and benefits.`;
    if (userEcoInterests && userEcoInterests.length > 0) {
      prompt += ` Emphasize aspects related to: ${userEcoInterests.join(', ')}.`;
    }
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
    });
    return response.text ?? "Sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error generating product description:", error);
    return `Learn more about ${productName} and its eco-benefits through responsible sourcing and materials. Prioritize products that align with your sustainability goals.`;
  }
};

export const generateProductIdeas = async (keywords: string, userEcoInterests?: string[]): Promise<GeneratedProductIdea[]> => {
  if (!ai) {
    console.warn("AI Service unavailable for product ideas.");
    return [];
  }
  let jsonStr = ""; 
  let originalResponseText = ""; 

  try {
    let interestsPrompt = "";
    if (userEcoInterests && userEcoInterests.length > 0) {
      interestsPrompt = `Prioritize ideas aligning with these eco-interests: ${userEcoInterests.join(', ')}.`;
    }

    const prompt = `
      Suggest 3 diverse, eco-friendly product ideas related to: "${keywords}". ${interestsPrompt}
      For each idea, provide ALL of the following fields:
      - "name" (string)
      - "category" (string)
      - "description" (string, eco-focused, max 30 words)
      - "price" (number, plausible price, e.g., 29.99)
      - "materials" (array of strings, e.g., ["Organic Cotton", "Recycled PET"])
      - "durabilityScore" (number, 1-5, 5 is most durable)
      - "packagingScore" (number, 1-5, 5 is most eco-friendly packaging)
      - "healthImpactScore" (number, 1-5, 5 is best for health/low-tox)
      
      Return the output STRICTLY as a VALID JSON array of objects. 
      Do NOT include any text, comments, or explanations outside of the JSON array itself.
      Each object in the array must represent a product idea and contain ALL the specified fields.
      All keys and string values must be enclosed in double quotes (e.g., "name": "Product Name").
      Ensure that string values are properly escaped if they contain special characters (e.g., newlines as \\n, double quotes as \\").
      Do NOT use trailing commas in objects or arrays.
      The entire response should be a single JSON array like: [ {"name": "Product 1", ...}, {"name": "Product 2", ...}, {"name": "Product 3", ...} ]
      Example of a valid entry: {"name": "Hemp Yoga Mat", "category": "Fitness", "description": "Biodegradable, non-slip mat.", "price": 65.00, "materials": ["Natural Hemp", "Natural Rubber"], "durabilityScore": 4, "packagingScore": 5, "healthImpactScore": 5}
    `;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    originalResponseText = response.text ?? "No response was generated.";
    jsonStr = originalResponseText.trim();
    
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);
    if (Array.isArray(parsedData) && parsedData.every(item => 
        item.name && 
        item.category && 
        item.description && 
        typeof item.price === 'number' &&
        Array.isArray(item.materials) &&
        typeof item.durabilityScore === 'number' &&
        typeof item.packagingScore === 'number' &&
        typeof item.healthImpactScore === 'number'
        )) {
      return parsedData.map(item => ({
        ...item,
        durabilityScore: Math.min(5, Math.max(1, item.durabilityScore || 3)),
        packagingScore: Math.min(5, Math.max(1, item.packagingScore || 3)),
        healthImpactScore: Math.min(5, Math.max(1, item.healthImpactScore || 3)),
      })) as GeneratedProductIdea[];
    }
    console.error("Generated product ideas response is not in the expected format after parsing:", parsedData, "Original JSON string:", jsonStr);
    return [];

  } catch (error) {
    console.error("Error generating product ideas. Original API response text:", originalResponseText, "Processed JSON string for parsing:", jsonStr, "Error:", error);
    return [];
  }
};

export const analyzeProductUrl = async (productUrl: string): Promise<ExternalAnalysisResult | null> => {
  if (!ai) {
    console.warn("AI Service unavailable for URL analysis.");
    return null;
  }
  let jsonStr = "";
  let originalResponseText = "";

  try {
    const prompt = `
      You are a sustainability analysis AI. A user has provided a URL: "${productUrl}".
      While you cannot access this URL, imagine a common consumer product (e.g., apparel, electronics, kitchenware) that might be sold at such a URL.
      Provide a fictional but plausible 'productName' (string, e.g., "Organic Cotton Tee" or "Stainless Steel Water Bottle"), 
      its estimated 'co2FootprintKg' (number, e.g., a value between 0.1 and 10.0), 
      and a 'sustainabilityScore' (number, from 0 to 100, where 100 is best).
      Respond ONLY with a valid JSON object in the format: 
      {"productName": "string", "co2FootprintKg": number, "sustainabilityScore": number}
      Do NOT include any text, comments, or explanations outside of the JSON object itself.
      Ensure all keys and string values are enclosed in double quotes.
      Example: {"productName": "Bamboo Cutting Board", "co2FootprintKg": 1.2, "sustainabilityScore": 85}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    originalResponseText = response.text ?? "No response was generated.";
    jsonStr = originalResponseText.trim();

    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    if (parsedData && 
        typeof parsedData.productName === 'string' &&
        typeof parsedData.co2FootprintKg === 'number' &&
        typeof parsedData.sustainabilityScore === 'number') {
      return {
        id: `analysis-${Date.now()}`,
        productName: parsedData.productName,
        co2FootprintKg: parsedData.co2FootprintKg,
        sustainabilityScore: Math.min(100, Math.max(0, parsedData.sustainabilityScore)),
        sourceType: 'url',
        sourceValue: productUrl,
        analysisDate: new Date(),
      };
    }
    console.error("Parsed URL analysis data is not in the expected format:", parsedData, "Original JSON string:", jsonStr);
    return null;

  } catch (error) {
    console.error("Error analyzing product URL. Original API response text:", originalResponseText, "Processed JSON string for parsing:", jsonStr, "Error:", error);
    return null;
  }
};

export const analyzeProductImage = async (base64ImageData: string, mimeType: string, fileName: string): Promise<ExternalAnalysisResult | null> => {
  if (!ai) {
    console.warn("AI Service unavailable for image analysis.");
    return null;
  }
  let jsonStr = "";
  let originalResponseText = "";

  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64ImageData,
      },
    };
    const textPart = {
      text: `
        Analyze the product shown in this image. 
        Identify a plausible 'productName' (string) for it.
        Estimate its 'co2FootprintKg' (number, between 0.1 and 10.0).
        Assign a 'sustainabilityScore' (number, from 0 to 100, 100 is best).
        This is for a fictional sustainability assessment.
        Respond ONLY with a valid JSON object: {"productName": "string", "co2FootprintKg": number, "sustainabilityScore": number}
        Do NOT include any text, comments, or explanations outside the JSON.
        Example: {"productName": "Red Canvas Sneakers", "co2FootprintKg": 3.5, "sustainabilityScore": 65}
      `
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME, // Ensure this model supports image input
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
      },
    });

    originalResponseText = response.text ?? "No response was generated.";
    jsonStr = originalResponseText.trim();

    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if (parsedData &&
        typeof parsedData.productName === 'string' &&
        typeof parsedData.co2FootprintKg === 'number' &&
        typeof parsedData.sustainabilityScore === 'number') {
      return {
        id: `analysis-${Date.now()}`,
        productName: parsedData.productName,
        co2FootprintKg: parsedData.co2FootprintKg,
        sustainabilityScore: Math.min(100, Math.max(0, parsedData.sustainabilityScore)),
        sourceType: 'image',
        sourceValue: fileName,
        analysisDate: new Date(),
      };
    }
    console.error("Parsed image analysis data is not in the expected format:", parsedData, "Original JSON string:", jsonStr);
    return null;

  } catch (error) {
    console.error("Error analyzing product image. Original API response text:", originalResponseText, "Processed JSON string for parsing:", jsonStr, "Error:", error);
    return null;
  }
};

export const analyzeProductImageForBarcodeSimulation = async (base64ImageData: string, mimeType: string, fileName: string, dataUrl?: string): Promise<BarcodeAnalysisResult | null> => {
  if (!ai) {
    console.warn("AI Service unavailable for barcode image analysis.");
    return null;
  }
  let jsonStr = "";
  let originalResponseText = "";

  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64ImageData,
      },
    };
    const textPart = {
      text: `
        Analyze the product shown in this image.
        1. Identify a plausible 'productName' (string, e.g., "Organic Cotton T-Shirt").
        2. Estimate its 'co2FootprintKg' (number, e.g., a value between 0.1 and 10.0).
        3. Assign a 'sustainabilityScore' (number, from 0 to 100, where 100 is best).
        4. Generate a 'simulatedBarcode' (string, a fictional EAN-13 style 13-digit numeric string, e.g., "4006381333931").
        This is for a fictional sustainability assessment and barcode simulation.
        Respond ONLY with a valid JSON object in the format:
        {"productName": "string", "co2FootprintKg": number, "sustainabilityScore": number, "simulatedBarcode": "string"}
        Do NOT include any text, comments, or explanations outside of the JSON object itself.
        Ensure all keys and string values are enclosed in double quotes.
        Example: {"productName": "Fair Trade Coffee Beans", "co2FootprintKg": 0.8, "sustainabilityScore": 90, "simulatedBarcode": "9780201379624"}
      `
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME, 
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
      },
    });
    
    originalResponseText = response.text ?? "No response was generated.";
    jsonStr = originalResponseText.trim();

    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    if (parsedData &&
        typeof parsedData.productName === 'string' &&
        typeof parsedData.co2FootprintKg === 'number' &&
        typeof parsedData.sustainabilityScore === 'number' &&
        typeof parsedData.simulatedBarcode === 'string' &&
        /^\d{13}$/.test(parsedData.simulatedBarcode) // Basic check for 13 digits
    ) {
      return {
        id: `barcode-analysis-${Date.now()}`,
        productName: parsedData.productName,
        co2FootprintKg: parsedData.co2FootprintKg,
        sustainabilityScore: Math.min(100, Math.max(0, parsedData.sustainabilityScore)),
        simulatedBarcode: parsedData.simulatedBarcode,
        sourceType: 'image_barcode_scan',
        sourceValue: fileName,
        analysisDate: new Date(),
        imageUrl: dataUrl // Store the data URL of the image itself for display in history
      };
    }
    console.error("Parsed barcode image analysis data is not in the expected format:", parsedData, "Original JSON string:", jsonStr);
    return null;

  } catch (error) {
    console.error("Error analyzing barcode image. Original API response text:", originalResponseText, "Processed JSON string for parsing:", jsonStr, "Error:", error);
    return null;
  }
};


export const interpretVoiceCommand = async (transcript: string): Promise<VoiceCommandInterpretation | null> => {
  if (!ai) {
    console.warn("AI Service unavailable for voice command interpretation.");
    return null;
  }
  let jsonStr = "";
  let originalResponseText = "";

  try {
    const prompt = `
      You are an AI assistant for the EcoShop Navigator app.
      Interpret the user's voice command: "${transcript}"
      Determine the user's intent ('action') and extract relevant 'parameters'.
      Possible actions are: 'search_products', 'analyze_product_by_name', 'get_eco_tip', 'navigate_to_section', 'unknown_intent'.
      For 'search_products', parameters should include 'query' (string).
      For 'analyze_product_by_name', parameters should include 'productName' (string).
      For 'navigate_to_section', parameters should include 'sectionName' (string, must be one of: 'home', 'cart', 'dashboard', 'wallet', 'marketplace', 'returns', 'faq', 'analyze', 'seller_admin', 'my_impact').
      If the intent is unclear, use 'unknown_intent'.
      Provide a brief 'message' (string, max 20 words) summarizing your interpretation or asking for clarification.
      
      Respond ONLY with a valid JSON object in the format:
      {"originalTranscript": "string", "action": "string", "parameters": {"query": "string", ...}, "message": "string"}
      Do NOT include any text, comments, or explanations outside of the JSON object itself.
      Ensure all keys and string values are enclosed in double quotes.
      If a parameter is not applicable, it can be omitted from the parameters object.

      Examples:
      User: "search for bamboo toothbrushes" -> {"originalTranscript": "search for bamboo toothbrushes", "action": "search_products", "parameters": {"query": "bamboo toothbrushes"}, "message": "Searching for bamboo toothbrushes."}
      User: "what's the carbon footprint of a cotton t-shirt" -> {"originalTranscript": "what's the carbon footprint of a cotton t-shirt", "action": "analyze_product_by_name", "parameters": {"productName": "cotton t-shirt"}, "message": "Interpreted as analyze product: cotton t-shirt."}
      User: "give me a sustainability tip" -> {"originalTranscript": "give me a sustainability tip", "action": "get_eco_tip", "parameters": {}, "message": "Fetching an eco tip."}
      User: "go to my cart" -> {"originalTranscript": "go to my cart", "action": "navigate_to_section", "parameters": {"sectionName": "cart"}, "message": "Navigating to cart."}
      User: "how's the weather?" -> {"originalTranscript": "how's the weather?", "action": "unknown_intent", "parameters": {}, "message": "Sorry, I can't help with weather."}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    originalResponseText = response.text ?? "No response was generated.";
    jsonStr = originalResponseText.trim();
    
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    if (parsedData &&
        typeof parsedData.originalTranscript === 'string' &&
        typeof parsedData.action === 'string' &&
        typeof parsedData.parameters === 'object' &&
        typeof parsedData.message === 'string'
    ) {
        // Validate sectionName if action is navigate_to_section
        if (parsedData.action === 'navigate_to_section') {
            const validSections = ['home', 'cart', 'dashboard', 'wallet', 'marketplace', 'returns', 'faq', 'analyze', 'seller_admin', 'my_impact'];
            if (!parsedData.parameters.sectionName || !validSections.includes(parsedData.parameters.sectionName.toLowerCase())) {
                console.warn(`AI returned invalid section for navigation: ${parsedData.parameters.sectionName}. Defaulting to unknown_intent.`);
                parsedData.action = 'unknown_intent';
                parsedData.message = `I understood you want to navigate, but '${parsedData.parameters.sectionName}' is not a recognized section.`;
                parsedData.parameters.sectionName = undefined; 
            } else {
                 parsedData.parameters.sectionName = parsedData.parameters.sectionName.toLowerCase(); // Normalize
            }
        }

      return parsedData as VoiceCommandInterpretation;
    }
    console.error("Parsed voice command interpretation data is not in the expected format:", parsedData, "Original JSON string:", jsonStr);
    return null;

  } catch (error) {
    console.error("Error interpreting voice command. Original API response text:", originalResponseText, "Processed JSON string for parsing:", jsonStr, "Error:", error);
    return null;
  }
};

export const getChatbotResponse = async (
  userInput: string,
  analysisHistory: (ExternalAnalysisResult | BarcodeAnalysisResult)[] 
): Promise<string> => {
  if (!ai) return "I'm sorry, but my AI capabilities are limited right now. Please try again later.";
  try {
    let historyContext = "";
    if (analysisHistory.length > 0) {
      const recentAnalyses = analysisHistory
        .slice(0, 3) // Take last 3
        .map(
          (item) => // item can be ExternalAnalysisResult or BarcodeAnalysisResult
            `- Product: ${item.productName}, CO2: ${item.co2FootprintKg}kg, Score: ${item.sustainabilityScore}/100 (from ${item.sourceType})`
        )
        .join("\n");
      historyContext = `\n\nFor context, here is some of the user's recent product analysis activity:\n${recentAnalyses}`;
    }

    const prompt = `
      You are "Eco Assistant", a friendly and knowledgeable AI guide for the "EcoShop Navigator" web application.
      Your primary role is to assist users with understanding sustainable shopping practices and navigating the app effectively.
      User's message: "${userInput}"
      ${historyContext}
      
      --- APP INFORMATION FOR YOUR KNOWLEDGE (EcoShop Navigator) ---
      **1. Main Sections & Navigation:**
      - **Views:** Users can navigate to Home, Marketplace, Analyze Product (for external items), My Returns, FAQ.
      - **Header Controls:** Quick access to "My Impact Dashboard", "My Dashboard" (user profile/settings), "EcoCoins Wallet", "Cart", and a main "Menu" (sidebar).
      - **Sidebar Menu:** Provides links to most sections, including "Seller Admin" (if registered).
      - **Footer Links:** FAQ, Provide Feedback, Become a Seller / Seller Admin.

      **2. Core Features:**
      - **Product Discovery & Information:**
        - **Home Page Search (MultiModalHub):**
          - **Text Search:** Standard keyword search.
          - **AI-Suggested Products:** Based on keywords and user's selected "Eco-Interests", AI can generate new product ideas.
          - **Image Scan (Barcode Scanner Mockup):** Upload a product image to simulate barcode scanning. AI identifies the product, estimates sustainability, and generates a mock barcode. Result added to analysis history.
          - **Voice Command (Voice Search Mockup):** Users can speak commands (simulated by typing). AI interprets intent (search, analyze, navigate, get tip).
        - **Product Cards & Detail Modal:** Display comprehensive info including EcoScore, CO2 footprint, materials, durability, packaging, health impact scores, certifications, and AI-generated descriptions. Product images can be AI-generated.
      - **Sustainability Analysis:**
        - **EcoScore:** A 1-5 star rating (5 is best), holistically calculated from carbon footprint (lower is better), material sustainability (organic, recycled keywords grant bonus), product durability, packaging eco-friendliness, and health impact (low chemical use).
        - **"Analyze Product" Section (ExternalProductAnalyzer):** Input a URL or upload an image of an external product. AI provides a simulated analysis (product name, CO2, sustainability score). Results are added to "Analysis History".
      - **EcoCoins System:**
        - **Earning Mechanisms:** Daily login; analyzing products (CO2 saved & min bonus); high EcoScore product purchases; completing user profile (setting Eco-Interests); analysis streaks (3-day, 7-day); completing sustainability quizzes (base + perfect score bonus); first quiz completion; submitting feedback (base + screenshot bonus); seller registration steps & achievements; listing items on marketplace; purchasing used items from marketplace; successfully returning packaging (base + good condition bonus).
        - **Spending EcoCoins:** Redeem for rewards (e.g., discounts, digital goods, simulated eco-actions) via the "EcoCoins Wallet" page.
        - **Wallet Page:** View current balance, detailed transaction history, available rewards, and access sustainability quizzes.
      - **Circular Economy Marketplace:**
        - **Functionality:** Users can list, sell, buy, or trade used items. Categories include apparel, electronics, books, etc. Conditions range from "New with Tags" to "Fair".
        - **Currency:** EcoCoins, simulated USD, or "Trade".
        - **Simulated Seller Chat:** Buyers can engage in a text chat with an AI simulating the seller for any marketplace listing to ask questions or (gently) negotiate.
      - **Return Packaging System:**
        - **"My Returns" Page:** View packages eligible for return from past orders (associated with user ID).
        - **Process:** User initiates a return, reports the package's condition (Good, Slightly Damaged, Heavily Damaged), and uses a simulated QR code for drop-off. Successful returns (Good/Slightly Damaged) earn EcoCoins; heavily damaged items may incur a penalty or no reward.
      - **User Engagement & Personalization:**
        - **"My Dashboard" (CustomerDashboard):** Manage preferences like "Sustainable Packaging" (applies a small CO2 saving to orders) and select "Eco-Interests" (which personalize AI-driven product search suggestions).
        - **"My Impact Dashboard" (PersonalImpactDashboard - Mock-up):** Visualizes user's positive environmental contributions: total CO2 saved, products analyzed, EcoCoins earned, sustainability streaks, eco-score improvements, comparisons with community averages, and environmental equivalents (e.g., trees saved). Includes mock goal setting.
        - **Sustainability Quizzes:** Interactive quizzes on topics like carbon footprint & recycling, available via Wallet.
        - **Feedback System:** Users can submit app feedback (bug reports, feature requests, etc.) and earn EcoCoins.
        - **Achievements:** Unlock various achievements for milestones like first analysis, analysis streaks, total CO2 saved from analyses, first quiz, first sustainable purchase, seller onboarding steps.
      - **Seller Features:**
        - **Registration:** Multi-step "Become a Seller" wizard with EcoCoin rewards for completing steps and overall registration.
        - **Seller Admin Page:** (Simulated) Logged-in sellers can view their listed products, add new products (EcoScore calculated automatically), and remove listings.

      **3. Technical Aspects (Simplified for You):**
      - EcoShop Navigator is a modern web application, likely built with React.
      - You, Eco Assistant, are powered by a Generative AI model (like Gemini) to provide intelligent responses and power features like product idea generation, description writing, and image generation.
      - For demonstration purposes, user data (cart, coins, preferences, history, listings) is stored locally in the user's browser.

      **Your Task:**
      Based on the user's message, their analysis history, and the detailed app information above:
      1. Provide a helpful, conversational, and concise response (ideally under 100 words).
      2. If the user asks "Where can I find X?", "How do I do Y?", or about app features, use the APP INFORMATION to guide them accurately.
      3. If the user's query is about a general sustainability topic, provide direct advice.
      4. If the query relates to their analysis history, use that context in your response.
      5. Be friendly, encouraging, and promote sustainable actions and the use of relevant app features.
      6. Do NOT invent features or functionalities not listed in the APP INFORMATION. If unsure or if the app doesn't support something, politely state that or suggest they check the FAQ or explore relevant sections.
      --- END OF APP INFORMATION ---
    `;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
    });
    return response.text ?? "Sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    return "I'm having a little trouble connecting right now. Please try asking again in a moment.";
  }
};


export const getSellerSuggestions = async (productName: string, productCategory: string, currentDescription?: string): Promise<{description: string, keywords: string[]}> => {
  if (!ai) return { description: currentDescription || "Focus on unique sustainable aspects.", keywords: ["eco-friendly", productCategory.toLowerCase()] };

  let jsonStr = "";
  let originalResponseText = "";

  try {
    const prompt = `
      You are an AI assistant for sellers on EcoShop Navigator.
      Product Name: "${productName}"
      Category: "${productCategory}"
      ${currentDescription ? `Current Description (for improvement, if any): "${currentDescription}"` : ""}
      
      Provide:
      1. An improved, engaging, and eco-focused 'description' (string, about 50-70 words).
      2. A list of relevant 'keywords' (array of 5-7 strings) for search optimization, focusing on sustainability and product type.

      Respond ONLY with a valid JSON object in the format:
      {"description": "string", "keywords": ["string", "string", ...]}
      Do NOT include any text, comments, or explanations outside of the JSON object itself.
      Example: {"description": "Discover this amazing eco-friendly ${productName}...", "keywords": ["sustainable", "${productCategory.toLowerCase()}", "organic", "recycled"]}
    `;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" },
    });

    originalResponseText = response.text ?? "No response was generated.";
    jsonStr = originalResponseText.trim();
    
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    if (parsedData && 
        typeof parsedData.description === 'string' && 
        Array.isArray(parsedData.keywords) && 
        parsedData.keywords.every((k: any) => typeof k === 'string')
    ) {
        return parsedData as {description: string, keywords: string[]};
    }
    console.error("Parsed seller suggestions data is not in the expected format:", parsedData, "Original JSON string:", jsonStr);
    return { description: currentDescription || "AI suggestion error. Please write manually.", keywords: [productCategory.toLowerCase(), "eco-friendly"] };

  } catch (error) {
    console.error("Error generating seller suggestions. Original API response text:", originalResponseText, "Processed JSON string for parsing:", jsonStr, "Error:", error);
    return { description: currentDescription || "AI service unavailable for suggestions.", keywords: [productCategory.toLowerCase()] };
  }
};

export const getSimulatedSellerResponse = async (listing: MarketplaceListing, userMessage: string, chatHistory: MarketplaceChatMessage[]): Promise<string> => {
    if (!ai) return "I'm sorry, the seller (AI simulation) is currently offline. Please try again later.";

    // Basic history formatting
    const historyPrompt = chatHistory.slice(-5).map(msg => `${msg.sender === 'user' ? 'Buyer' : 'Seller'}: ${msg.text}`).join('\n');

    try {
        const prompt = `
            You are an AI simulating a friendly and helpful seller on the "EcoShop Navigator" marketplace.
            You are responding to a buyer's message regarding your listing:
            Listing Title: "${listing.title}"
            Listing Description: "${listing.description}"
            Listing Category: "${listing.category}"
            Listing Condition: "${listing.condition}"
            Listing Price: ${listing.price} ${listing.currency}
            ${listing.location ? `Location: ${listing.location}` : ""}

            Chat History (last few messages):
            ${historyPrompt}

            Buyer's latest message: "${userMessage}"

            Your Task:
            Generate a concise, polite, and relevant response as the seller.
            - Address the buyer's message directly.
            - If they ask a question, try to answer it based on the listing info.
            - You can gently negotiate if they make an offer for a non-Trade item, but don't agree to huge discounts immediately. Suggest a small counter if appropriate (e.g., 5-10% off for EcoCoins/USD).
            - If it's a Trade item, you can ask what they have to offer or suggest types of items you're interested in.
            - Keep responses short (1-3 sentences).
            - Maintain a friendly and helpful tone.
            - Do NOT break character as the seller.
            - Do NOT mention you are an AI.
            
            Example Responses:
            - "Thanks for asking! Yes, it's still available."
            - "I might be able to do ${Number(listing.price) * 0.9} EcoCoins if you're serious."
            - "What did you have in mind for a trade?"
            - "It's in ${listing.condition} condition, as described. I've taken good care of it."
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: prompt,
        });
        return response.text ?? "Sorry, I couldn't generate a response at this time.";

    } catch (error) {
        console.error("Error generating simulated seller response:", error);
        return "I'm having a little trouble responding right now. Could you try asking again in a moment?";
    }
};
