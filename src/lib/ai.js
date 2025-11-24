import { supabase } from './supabase';

const OPENROUTER_API_KEY = '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';
const MODEL = 'deepseek/deepseek-r1:free';

/**
 * Makes a request to the OpenRouter API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options for the API call
 * @returns {Promise} - Response from the API
 */
async function makeAIRequest(messages, options = {}) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://e-waste-manager.com",
        "X-Title": "E-Waste Manager",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        top_p: 1,
        repetition_penalty: 1,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI request failed:', error);
    throw error;
  }
}

/**
 * Gets recycling recommendations for an item
 * @param {string} itemDescription - Description of the item
 * @returns {Promise<string>} - Recycling recommendations
 */
export async function getRecyclingRecommendations(itemDescription) {
  const messages = [
    {
      role: "system",
      content: "You are an e-waste recycling expert. Provide specific, actionable recommendations for recycling electronic items safely and sustainably."
    },
    {
      role: "user",
      content: `I need recycling recommendations for: ${itemDescription}`
    }
  ];

  return makeAIRequest(messages);
}

/**
 * Categorizes an e-waste item
 * @param {string} itemDescription - Description of the item
 * @returns {Promise<Object>} - Categorization details
 */
export async function categorizeItem(itemDescription) {
  const messages = [
    {
      role: "system",
      content: "You are an expert in categorizing electronic waste. Analyze items and provide detailed categorization including type, hazard level, and recyclable components."
    },
    {
      role: "user",
      content: `Please categorize this electronic item: ${itemDescription}`
    }
  ];

  const response = await makeAIRequest(messages);
  
  try {
    // Attempt to parse structured data from the response
    const lines = response.split('\n');
    const category = {};
    
    lines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        category[key.toLowerCase()] = value;
      }
    });

    return category;
  } catch (error) {
    // Return raw response if parsing fails
    return { description: response };
  }
}

/**
 * Generates eco-friendly tips based on user behavior
 * @param {Object} userProfile - User's recycling history and preferences
 * @returns {Promise<string>} - Personalized eco-friendly tips
 */
export async function generateEcoTips(userProfile) {
  const messages = [
    {
      role: "system",
      content: "You are a sustainability advisor specializing in electronic waste reduction. Provide personalized tips based on user behavior and recycling history."
    },
    {
      role: "user",
      content: `Generate eco-friendly tips for a user with this profile: ${JSON.stringify(userProfile)}`
    }
  ];

  return makeAIRequest(messages);
}

/**
 * Estimates the environmental impact of recycling an item
 * @param {Object} item - Item details including type, weight, and condition
 * @returns {Promise<Object>} - Environmental impact metrics
 */
export async function estimateEnvironmentalImpact(item) {
  const messages = [
    {
      role: "system",
      content: "You are an environmental impact analyst. Calculate and explain the environmental benefits of recycling electronic items."
    },
    {
      role: "user",
      content: `Calculate the environmental impact of recycling this item: ${JSON.stringify(item)}`
    }
  ];

  const response = await makeAIRequest(messages);
  
  try {
    // Parse the response into structured metrics
    const metrics = {};
    const lines = response.split('\n');
    
    lines.forEach(line => {
      const [metric, value] = line.split(':').map(s => s.trim());
      if (metric && value) {
        // Convert numerical values where possible
        metrics[metric.toLowerCase()] = isNaN(value) ? value : parseFloat(value);
      }
    });

    return metrics;
  } catch (error) {
    return { description: response };
  }
}

/**
 * Suggests repair options for electronic items
 * @param {Object} item - Item details including type and issues
 * @returns {Promise<string>} - Repair suggestions
 */
export async function getRepairSuggestions(item) {
  const messages = [
    {
      role: "system",
      content: "You are an electronics repair expert. Provide detailed suggestions for repairing and maintaining electronic devices to extend their lifespan."
    },
    {
      role: "user",
      content: `Suggest repair options for this item: ${JSON.stringify(item)}`
    }
  ];

  return makeAIRequest(messages);
}

/**
 * Validates and enhances item descriptions
 * @param {string} description - User-provided item description
 * @returns {Promise<Object>} - Enhanced item details
 */
export async function enhanceItemDescription(description) {
  const messages = [
    {
      role: "system",
      content: "You are an expert in electronic devices. Analyze item descriptions and provide standardized, detailed information including make, model, and key specifications."
    },
    {
      role: "user",
      content: `Enhance this item description: ${description}`
    }
  ];

  const response = await makeAIRequest(messages);
  
  try {
    // Parse the enhanced description into structured data
    const details = {};
    const lines = response.split('\n');
    
    lines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        details[key.toLowerCase()] = value;
      }
    });

    return details;
  } catch (error) {
    return { description: response };
  }
}