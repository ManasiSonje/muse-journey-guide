import { supabase } from '@/integrations/supabase/client';

export interface ConversationState {
  currentFlow: 'menu' | 'booking' | 'details' | 'timeslots' | 'suggest' | null;
  awaitingInput: string | null;
  currentMessage: string;
  inputPlaceholder?: string;
  showInput: boolean;
  showButtons: boolean;
}

export interface FlowResponse {
  message: string;
  nextState: ConversationState;
  redirectUrl?: string;
}

export interface ChatbotOption {
  id: string;
  label: string;
  icon: string;
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

  getInitialState(): ConversationState {
    return {
      currentFlow: 'menu',
      awaitingInput: null,
      currentMessage: "Hi! I'm MuseMate, your personal museum assistant. How can I help you today?",
      showInput: false,
      showButtons: true
    };
  }

  getMenuOptions(): ChatbotOption[] {
    return [
      { id: 'booking', label: 'Museum Booking', icon: '🎫' },
      { id: 'details', label: 'View Museum Details', icon: '🏛️' },
      { id: 'timeslots', label: 'Check Available Time Slots', icon: '⏰' },
      { id: 'suggest', label: 'Suggest Museums', icon: '🗺️' }
    ];
  }

  handleOptionSelect(optionId: string): FlowResponse {
    switch (optionId) {
      case 'booking':
        return {
          message: "Great! Which museum would you like to book?",
          nextState: {
            currentFlow: 'booking',
            awaitingInput: 'museum_name',
            currentMessage: "Great! Which museum would you like to book?",
            inputPlaceholder: "Enter museum name...",
            showInput: true,
            showButtons: false
          }
        };

      case 'details':
        return {
          message: "Which museum details would you like to see?",
          nextState: {
            currentFlow: 'details',
            awaitingInput: 'museum_name',
            currentMessage: "Which museum details would you like to see?",
            inputPlaceholder: "Enter museum name...",
            showInput: true,
            showButtons: false
          }
        };

      case 'timeslots':
        return {
          message: "Please provide the museum name to check available time slots.",
          nextState: {
            currentFlow: 'timeslots',
            awaitingInput: 'museum_name',
            currentMessage: "Please provide the museum name to check available time slots.",
            inputPlaceholder: "Enter museum name...",
            showInput: true,
            showButtons: false
          }
        };

      case 'suggest':
        return {
          message: "Please enter the city name where you want to visit a museum.",
          nextState: {
            currentFlow: 'suggest',
            awaitingInput: 'city_name',
            currentMessage: "Please enter the city name where you want to visit a museum.",
            inputPlaceholder: "Enter city name...",
            showInput: true,
            showButtons: false
          }
        };

      default:
        return {
          message: "I'm not sure what you're looking for. Please select one of the options below:",
          nextState: this.getInitialState()
        };
    }
  }

  async processUserInput(input: string, currentState: ConversationState): Promise<FlowResponse> {
    if (currentState.currentFlow && currentState.awaitingInput) {
      return await this.handleFlowResponse(input, currentState);
    }

    return {
      message: "Please select one of the options below:",
      nextState: this.getInitialState()
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
          message: "I'm not sure what you're looking for. Please select one of the options below:",
          nextState: this.getInitialState()
        };
    }
  }

  resetToMenu(): ConversationState {
    return this.getInitialState();
  }

  private async handleBookingFlow(museumName: string): Promise<FlowResponse> {
    const museum = await this.getMuseumByName(museumName);
    
    if (!museum) {
      return {
        message: `Sorry, I couldn't find "${museumName}". Please try again.`,
        nextState: {
          currentFlow: 'booking',
          awaitingInput: 'museum_name',
          currentMessage: `Sorry, I couldn't find "${museumName}". Please try again.`,
          inputPlaceholder: "Enter museum name...",
          showInput: true,
          showButtons: false
        }
      };
    }

    if (museum.booking_link) {
      // Direct redirect for booking
      return {
        message: `Redirecting you to book ${museum.name}...`,
        nextState: this.getInitialState(),
        redirectUrl: museum.booking_link
      };
    } else {
      return {
        message: `${museum.name} found, but no direct booking available. Please contact them at: ${museum.contact || 'Contact information not available'}`,
        nextState: this.getInitialState()
      };
    }
  }

  private async handleDetailsFlow(museumName: string): Promise<FlowResponse> {
    const museum = await this.getMuseumByName(museumName);
    
    if (!museum) {
      return {
        message: `Sorry, I couldn't find "${museumName}". Please try again.`,
        nextState: {
          currentFlow: 'details',
          awaitingInput: 'museum_name',
          currentMessage: `Sorry, I couldn't find "${museumName}". Please try again.`,
          inputPlaceholder: "Enter museum name...",
          showInput: true,
          showButtons: false
        }
      };
    }

    let details = `**${museum.name}**

📍 ${museum.city} | 🏛️ ${museum.type || 'Museum'}
⏰ ${museum.timings || 'Contact for timings'}
💰 ${museum.entry_fee || 'Contact for pricing'}

${museum.description || 'No description available'}`;

    if (museum.contact) {
      details += `\n\n📞 ${museum.contact}`;
    }

    return {
      message: details,
      nextState: this.getInitialState()
    };
  }

  private async handleTimeslotsFlow(museumName: string): Promise<FlowResponse> {
    const museum = await this.getMuseumByName(museumName);
    
    if (!museum) {
      return {
        message: `Sorry, I couldn't find "${museumName}". Please try again.`,
        nextState: {
          currentFlow: 'timeslots',
          awaitingInput: 'museum_name',
          currentMessage: `Sorry, I couldn't find "${museumName}". Please try again.`,
          inputPlaceholder: "Enter museum name...",
          showInput: true,
          showButtons: false
        }
      };
    }

    let timingInfo = `**${museum.name}** - Available Time Slots

⏰ ${museum.timings || 'Contact museum for current timings'}`;

    if (museum.detailed_timings) {
      const detailedTimings = museum.detailed_timings as any;
      timingInfo += `\n\n📅 Detailed Schedule:`;
      
      Object.entries(detailedTimings).forEach(([day, timing]) => {
        timingInfo += `\n• ${day}: ${timing}`;
      });
    }

    if (museum.contact) {
      timingInfo += `\n\n📞 Contact: ${museum.contact}`;
    }

    return {
      message: timingInfo,
      nextState: this.getInitialState()
    };
  }

  private async handleSuggestFlow(cityName: string): Promise<FlowResponse> {
    const museums = await this.getMuseumsByCity(cityName);
    
    if (museums.length === 0) {
      return {
        message: `Sorry, I couldn't find any museums in "${cityName}". Please try again.`,
        nextState: {
          currentFlow: 'suggest',
          awaitingInput: 'city_name',
          currentMessage: `Sorry, I couldn't find any museums in "${cityName}". Please try again.`,
          inputPlaceholder: "Enter city name...",
          showInput: true,
          showButtons: false
        }
      };
    }

    let suggestions = `Museums in **${cityName}**:\n\n`;
    
    museums.forEach((museum, index) => {
      suggestions += `${index + 1}. **${museum.name}**
📍 ${museum.address || museum.city}
💰 ${museum.entry_fee || 'Contact for pricing'}\n\n`;
    });

    return {
      message: suggestions,
      nextState: this.getInitialState()
    };
  }
}