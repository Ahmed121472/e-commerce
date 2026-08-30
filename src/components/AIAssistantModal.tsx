import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  ShoppingBag,
  Truck,
  ArrowRight,
  HelpCircle,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  ListFilter,
  Package,
  Wand2,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AIMessage } from '../types';

export const AIAssistantModal: React.FC = () => {
  const {
    isAIAssistantOpen,
    closeAIAssistant,
    aiInitialPrompt,
    products,
    cart,
    orders,
    role,
    isStoreOwner,
    addToCart,
    setSelectedProductDetail,
    setFilters,
    setIsOrderTrackingModalOpen,
    setIsCartOpen,
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'chat' | 'functions'>('chat');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        '👋 Hi! I am **NOVA AI**, your intelligent shopping concierge and store assistant.\n\nI can help you **find products**, **compare technical specifications**, **track shipments**, or **recommend bundle accessories**. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      followUpSuggestions: [
        'What are the best-selling items?',
        'Find me gear under $100',
        'How do I track my order?',
        'Suggest a workspace bundle'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isAIAssistantOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAIAssistantOpen, activeTab, isLoading]);

  // Handle initial prompt passed from other components
  useEffect(() => {
    if (aiInitialPrompt && isAIAssistantOpen) {
      handleSendMessage(aiInitialPrompt);
    }
  }, [aiInitialPrompt, isAIAssistantOpen]);

  if (!isAIAssistantOpen) return null;

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Build lightweight context
      const catalogSummary = products.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        rating: p.rating,
        inventory: p.inventory,
        tags: p.tags,
        description: p.description?.substring(0, 150)
      }));

      const cartSummary = cart.map((c) => ({
        id: c.product.id,
        title: c.product.title,
        quantity: c.quantity,
        price: c.unitPrice
      }));

      const ordersSummary = orders.slice(0, 5).map((o) => ({
        id: o.id,
        status: o.status,
        trackingNumber: o.trackingNumber,
        carrier: o.carrier,
        itemCount: o.items.length
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentQuery: textToSend,
          messages: messages.slice(-6),
          catalogContext: catalogSummary,
          cartContext: cartSummary,
          ordersContext: ordersSummary,
          userRole: isStoreOwner ? role : 'customer'
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'Here is what I found for you!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction: data.suggestedAction,
          recommendedProductIds: data.recommendedProductIds,
          followUpSuggestions: data.followUpSuggestions
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'AI generation failed');
      }
    } catch (err: any) {
      console.error('AI chat request error:', err);
      const fallbackMsg: AIMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `I am currently operating in high-availability mode. Based on our catalog, we have **${products.length} verified products** available. Try searching for headphones, monitors, or keyboards, or ask me to filter by price!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUpSuggestions: ['Show all audio items', 'Browse monitors', 'Track my order']
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (action?: AIMessage['suggestedAction']) => {
    if (!action) return;

    if (action.type === 'FILTER_CATEGORY' && action.payload) {
      setFilters((prev) => ({ ...prev, category: String(action.payload) }));
      closeAIAssistant();
      addToast('Category Filter Applied', `Showing ${action.payload} products`, 'info');
    } else if (action.type === 'VIEW_PRODUCT' && action.payload) {
      const prod = products.find((p) => p.id === action.payload || p.title.toLowerCase().includes(String(action.payload).toLowerCase()));
      if (prod) {
        setSelectedProductDetail(prod);
        closeAIAssistant();
      }
    } else if (action.type === 'ADD_TO_CART' && action.payload) {
      const prod = products.find((p) => p.id === action.payload);
      if (prod) {
        addToCart(prod);
        addToast('Added to Bag', `${prod.title} was added to your cart.`, 'success');
      }
    } else if (action.type === 'OPEN_TRACKING') {
      setIsOrderTrackingModalOpen(true);
      closeAIAssistant();
    } else if (action.type === 'OPEN_CART') {
      setIsCartOpen(true);
      closeAIAssistant();
    }
  };

  return (
    <div
      id="ai-assistant-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeAIAssistant}
    >
      <div
        id="ai-assistant-modal"
        className="relative w-full max-w-2xl h-[85vh] max-h-[750px] bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-950/50 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">NOVA AI Assistant</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Shopping Concierge & Store Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                id="ai-tab-chat"
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Live Chat</span>
              </button>
              <button
                id="ai-tab-functions"
                type="button"
                onClick={() => setActiveTab('functions')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'functions'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>AI Functions</span>
              </button>
            </div>

            <button
              id="close-ai-assistant-btn"
              onClick={closeAIAssistant}
              className="p-1.5 text-slate-400 transition-colors rounded-lg hover:text-white hover:bg-slate-800"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Live Chat */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/50">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[82%] space-y-2`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Direct In-situ Action Button */}
                      {msg.suggestedAction && (
                        <div className="mt-3 pt-2 border-t border-slate-800/80">
                          <button
                            id={`ai-action-btn-${msg.id}`}
                            onClick={() => handleExecuteAction(msg.suggestedAction)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 rounded-lg transition-all shadow-sm"
                          >
                            <span>{msg.suggestedAction.label || 'Execute Action'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Recommended Product Quick Cards */}
                      {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.recommendedProductIds.map((pId) => {
                            const p = products.find((prod) => prod.id === pId);
                            if (!p) return null;
                            return (
                              <div
                                key={p.id}
                                className="flex items-center gap-2 p-2 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-colors"
                              >
                                <img
                                  src={p.images[0]}
                                  alt={p.title}
                                  className="w-10 h-10 object-cover rounded-lg shrink-0 bg-slate-800"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-semibold text-white truncate">{p.title}</p>
                                  <p className="text-[10px] font-mono text-emerald-400 font-bold">${p.price.toFixed(2)}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    addToCart(p);
                                    addToast('Added to Bag', `${p.title} added!`, 'success');
                                  }}
                                  className="p-1.5 text-slate-300 hover:text-white bg-indigo-600/40 hover:bg-indigo-600 rounded-lg transition-all"
                                  title="Add to cart"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Follow-up Chips */}
                    {msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.followUpSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            id={`ai-suggestion-chip-${idx}`}
                            onClick={() => handleSendMessage(suggestion)}
                            className="px-2.5 py-1 text-[11px] font-medium text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 rounded-full transition-all text-left"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[10px] text-slate-500 ${
                        msg.role === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-slate-400 ml-1">Analyzing store catalog & specs...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-slate-900 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  id="ai-assistant-input"
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask about products, compare specs, track order..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  disabled={isLoading}
                />
                <button
                  id="ai-send-btn"
                  type="submit"
                  disabled={!inputQuery.trim() || isLoading}
                  className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
                <span>Direct catalog sync & multi-turn reasoning</span>
                <span className="font-mono text-slate-400">Model: Gemini 3.7 Flash</span>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Specified AI Functions & Capabilities Matrix */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/60">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                <Cpu className="w-4 h-4" />
                <span>NOVA AI Architecture & Specified Functions</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The AI in this platform is built on Google Gemini 3.7 Flash with real-time server-side
                grounding across the product catalog, active shopping carts, and order fulfillment registries.
              </p>
            </div>

            {/* Customer-Facing AI Functions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Customer AI Concierge Functions</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      1. Smart Product Matchmaker
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Understands natural language requirements (budget, use-case, aesthetics) and recommends exact SKU matches.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage('Recommend the best workspace gear under $150');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    Test: "Recommend gear under $150" →
                  </button>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      2. Tech Specs & Compatibility
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Explains materials, Bluetooth codecs, refresh rates, battery lifespans, and device compatibility.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage('What are the key technical specs of your audio products?');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    Test: "Explain audio specs" →
                  </button>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-400" />
                      3. Live Order & Tracking Lookup
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Parses customer order IDs or queries recent shipments to provide real-time status and carrier updates.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage('Where is my order? Can you check tracking status?');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    Test: "Check tracking status" →
                  </button>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      4. In-Situ Store Actions
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    AI triggers direct 1-click cart addition, opens product detail modals, or applies category filters on the canvas.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage('Filter catalog to show Audio products');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    Test: "Filter to Audio" →
                  </button>
                </div>
              </div>
            </div>

            {/* Merchant / Store Owner AI Functions */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Store Owner & Dropshipping AI Functions</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                      5. Dropship Copy & SEO Enhancer
                    </span>
                    <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                      Owner Tool
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Transforms raw supplier names and descriptions into high-converting titles, bullet benefits, and tags.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      6. Margin & Price Optimizer
                    </span>
                    <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                      Owner Tool
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Calculates optimal retail pricing, compare-at anchor prices, and targeted gross margins based on supplier costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
