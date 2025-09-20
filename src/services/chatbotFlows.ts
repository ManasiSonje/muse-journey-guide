import { supabase } from '@/integrations/supabase/client';

export interface ConversationState {
  currentFlow: 'menu' | 'booking' | 'details' | 'timeslots' | 'suggest' | null;
  awaitingInput: string | null;
}

export interface FlowResponse {
  message: string;
  nextState: ConversationState;
}

export class ChatbotFlowService {
  private async getMuseumByName(name: string) {
    const { data: museums } = await supabase
      .from('museums')
      .select('*')
      .ilike('name', `%${name}%`)
      .limit(1);
    
    return museums && museums.length > 0 ? museums[0] : null;
  }

  private async getMuseumsByCity(city: string) {
    const { data: museums } = await supabase
      .from('museums')
      .select('*')
      .ilike('city', `%${city}%`)
      .limit(5);
    
    return museums || [];
  }

  getInitialMessage(): FlowResponse {
    return {
      message: `Welcome! I'm your Museum Assistant. I can help you with:

🎫 **Museum Booking** - Get booking links for museums
🏛️ **View Museum Details** - See detailed information about museums  
⏰ **Check Available Time Slots** - View museum opening hours and availability
🗺️ **Suggest Museums** - Find museums in your preferred city

Just type what you'd like to do, or ask me anything about museums!`,
      nextState: { currentFlow: 'menu', awaitingInput: null }
    };
  }

  async processUserInput(input: string, currentState: ConversationState): Promise<FlowResponse> {
    const lowerInput = input.toLowerCase();

    // Check for main menu options
    if (lowerInput.includes('booking') || lowerInput.includes('book')) {
      return {
        message: "Great! Which museum would you like to book? Please provide the museum name.",
        nextState: { currentFlow: 'booking', awaitingInput: 'museum_name' }
      };
    }

    if (lowerInput.includes('details') || lowerInput.includes('information') || lowerInput.includes('about')) {
      return {
        message: "I'd be happy to show you museum details! Which museum would you like to know more about?",
        nextState: { currentFlow: 'details', awaitingInput: 'museum_name' }
      };
    }

    if (lowerInput.includes('time') || lowerInput.includes('slot') || lowerInput.includes('hours') || lowerInput.includes('timing')) {
      return {
        message: "I can help you check available time slots! Please provide the museum name.",
        nextState: { currentFlow: 'timeslots', awaitingInput: 'museum_name' }
      };
    }

    if (lowerInput.includes('suggest') || lowerInput.includes('recommend') || lowerInput.includes('find')) {
      return {
        message: "I'd love to suggest museums for you! Please enter the city name where you want to visit a museum.",
        nextState: { currentFlow: 'suggest', awaitingInput: 'city_name' }
      };
    }

    // Handle flow-specific responses
    if (currentState.currentFlow && currentState.awaitingInput) {
      return await this.handleFlowResponse(input, currentState);
    }

    // Fallback - return null to indicate no structured flow matched
    return {
      message: "",
      nextState: { currentFlow: null, awaitingInput: null }
    };
  }

  private async handleFlowResponse(input: string, currentState: ConversationState): Promise<FlowResponse> {
    switch (currentState.currentFlow) {
      case 'booking':
        return await this.handleBookingFlow(input);
      
      case 'details':
        return await this.handleDetailsFlow(input);
      
      case 'timeslots':
        return await this.handleTimeslotsFlow(input);
      
      case 'suggest':
        return await this.handleSuggestFlow(input);
      
      default:
        return {
          message: "I'm not sure what you're looking for. Let me help you with our main options!",
          nextState: { currentFlow: 'menu', awaitingInput: null }
        };
    }
  }

  private async handleBookingFlow(museumName: string): Promise<FlowResponse> {
    const museum = await this.getMuseumByName(museumName);
    
    if (!museum) {
      return {
        message: `Sorry, I couldn't find "${museumName}" in our database. Could you please check the spelling or try another museum name?

You can also ask me to suggest museums in a specific city!`,
        nextState: { currentFlow: 'booking', awaitingInput: 'museum_name' }
      };
    }

    if (museum.booking_link) {
      return {
        message: `Perfect! Here's the booking information for **${museum.name}**:

🎫 **Booking Link**: ${museum.booking_link}

📍 **Location**: ${museum.address || museum.city}
💰 **Entry Fee**: ${museum.entry_fee || 'Contact museum for pricing'}

Is there anything else I can help you with?`,
        nextState: { currentFlow: 'menu', awaitingInput: null }
      };
    } else {
      return {
        message: `I found **${museum.name}** but don't have a direct booking link available. Here's how you can book:

📞 **Contact**: ${museum.contact || 'Contact information not available'}
🌐 **Website**: ${museum.website || 'Website not available'}
📍 **Address**: ${museum.address || museum.city}

You can contact them directly for booking. Is there anything else I can help you with?`,
        nextState: { currentFlow: 'menu', awaitingInput: null }
      };
    }
  }

  private async handleDetailsFlow(museumName: string): Promise<FlowResponse> {
    const museum = await this.getMuseumByName(museumName);
    
    if (!museum) {
      return {
        message: `Sorry, I couldn't find "${museumName}" in our database. Would you like to try again with a different museum name?

You can also ask me to suggest museums in a specific city!`,
        nextState: { currentFlow: 'details', awaitingInput: 'museum_name' }
      };
    }

    let details = `Here are the details for **${museum.name}**:

📍 **Location**: ${museum.city}
🏛️ **Type**: ${museum.type || 'General Museum'}
📅 **Established**: ${museum.established || 'Information not available'}

📖 **Description**: ${museum.description || 'Description not available'}

📍 **Address**: ${museum.address || 'Address not available'}
⏰ **Timings**: ${museum.timings || 'Contact museum for timings'}
💰 **Entry Fee**: ${museum.entry_fee || 'Contact museum for pricing'}
📞 **Contact**: ${museum.contact || 'Contact information not available'}`;

    if (museum.website) {
      details += `\n🌐 **Website**: ${museum.website}`;
    }

    if (museum.reviews && Array.isArray(museum.reviews) && museum.reviews.length > 0) {
      details += `\n\n⭐ **Recent Reviews**:`;
      museum.reviews.slice(0, 2).forEach((review: any) => {
        details += `\n• ${review.comment} - ${review.rating}/5 stars`;
      });
    }

    details += `\n\nWould you like to book this museum or need any other information?`;

    return {
      message: details,
      nextState: { currentFlow: 'menu', awaitingInput: null }
    };
  }

  private async handleTimeslotsFlow(museumName: string): Promise<FlowResponse> {
    const museum = await this.getMuseumByName(museumName);
    
    if (!museum) {
      return {
        message: `Sorry, I couldn't find "${museumName}" in our database. Please check the spelling or try another museum name.

Would you like me to suggest museums in a specific city?`,
        nextState: { currentFlow: 'timeslots', awaitingInput: 'museum_name' }
      };
    }

    let timingInfo = `Here are the available time slots for **${museum.name}**:

⏰ **General Timings**: ${museum.timings || 'Contact museum for current timings'}`;

    if (museum.detailed_timings) {
      const detailedTimings = museum.detailed_timings as any;
      timingInfo += `\n\n📅 **Detailed Schedule**:`;
      
      Object.entries(detailedTimings).forEach(([day, timing]) => {
        timingInfo += `\n• **${day}**: ${timing}`;
      });
    }

    timingInfo += `\n\n📞 **Contact**: ${museum.contact || 'Contact information not available'}`;
    
    if (museum.booking_link) {
      timingInfo += `\n🎫 **Book Now**: ${museum.booking_link}`;
    }

    timingInfo += `\n\n💡 **Tip**: Call ahead to confirm current timings and availability!

Is there anything else I can help you with?`;

    return {
      message: timingInfo,
      nextState: { currentFlow: 'menu', awaitingInput: null }
    };
  }

  private async handleSuggestFlow(cityName: string): Promise<FlowResponse> {
    const museums = await this.getMuseumsByCity(cityName);
    
    if (museums.length === 0) {
      return {
        message: `Sorry, I couldn't find any museums in "${cityName}" in our database. 

Please check the spelling or try another city name. You can also ask me about specific museums you have in mind!`,
        nextState: { currentFlow: 'suggest', awaitingInput: 'city_name' }
      };
    }

    let suggestions = `Great! Here are the museums I found in **${cityName}**:\n\n`;
    
    museums.forEach((museum, index) => {
      suggestions += `${index + 1}. **${museum.name}**
   📍 ${museum.address || museum.city}
   🏛️ ${museum.type || 'General Museum'}
   💰 ${museum.entry_fee || 'Contact for pricing'}`;
   
      if (museum.description) {
        suggestions += `\n   📖 ${museum.description.substring(0, 100)}${museum.description.length > 100 ? '...' : ''}`;
      }
      
      suggestions += `\n\n`;
    });

    suggestions += `Would you like to:
• See detailed information about any of these museums?
• Check booking options for a specific museum?
• Get time slots for any museum?

Just let me know which museum interests you!`;

    return {
      message: suggestions,
      nextState: { currentFlow: 'menu', awaitingInput: null }
    };
  }
}