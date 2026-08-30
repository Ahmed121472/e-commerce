import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  connectGmailAccount,
  getGmailAccessToken,
  getConnectedGmailUser,
  disconnectGmail,
  sendEmail,
  sendOrderConfirmationEmail,
  sendTrackingUpdateEmail,
  getEmailHistory
} from '../lib/gmailService';
import { EmailLog } from '../types';
import {
  X,
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Clock,
  ChevronRight,
  Eye,
  Settings,
  ShieldCheck,
  Package,
  Truck,
  Layers,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EmailHubModal: React.FC = () => {
  const {
    isEmailModalOpen,
    closeEmailModal,
    emailModalTargetOrderId,
    emailModalInitialRecipient,
    orders,
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'settings' | 'gmail'>('compose');
  const [recipient, setRecipient] = useState(emailModalInitialRecipient || '');
  const [recipientProvider, setRecipientProvider] = useState<'gmail' | 'outlook' | 'hotmail' | 'yahoo' | 'custom'>('gmail');
  const [templateType, setTemplateType] = useState<'order_confirmation' | 'tracking_update' | 'custom'>('order_confirmation');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(emailModalTargetOrderId || '');
  const [subject, setSubject] = useState('Order Confirmation Receipt - NOVA Direct');
  const [customBody, setCustomBody] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [emailHistory, setEmailHistory] = useState<EmailLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailLog | null>(null);

  // Gmail OAuth State
  const [isGmailConnecting, setIsGmailConnecting] = useState(false);
  const [gmailUser, setGmailUser] = useState<{ email: string; displayName: string } | null>(null);

  // Check initial state
  useEffect(() => {
    if (isEmailModalOpen) {
      if (emailModalInitialRecipient) {
        setRecipient(emailModalInitialRecipient);
      }
      if (emailModalTargetOrderId) {
        setSelectedOrderId(emailModalTargetOrderId);
      } else if (orders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(orders[0].id);
      }
      loadHistory();
      const connected = getConnectedGmailUser();
      if (connected) {
        setGmailUser(connected);
      }
    }
  }, [isEmailModalOpen, emailModalInitialRecipient, emailModalTargetOrderId]);

  // Sync recipient provider domain helper
  const handleQuickProviderSelect = (domain: string, prov: 'gmail' | 'outlook' | 'hotmail' | 'yahoo' | 'custom') => {
    setRecipientProvider(prov);
    const prefix = recipient.includes('@') ? recipient.split('@')[0] : (recipient || 'customer');
    setRecipient(`${prefix}@${domain}`);
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await getEmailHistory();
      setEmailHistory(history);
    } catch (e) {
      console.warn('Failed to load email history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleConnectGmail = async () => {
    setIsGmailConnecting(true);
    try {
      const result = await connectGmailAccount();
      setGmailUser({
        email: result.email,
        displayName: 'Google Account'
      });
      addToast(
        'Gmail Connected!',
        `Authorized Google Workspace to send notifications from ${result.email}`,
        'success'
      );
    } catch (error: any) {
      console.error('Gmail connect error:', error);
      addToast(
        'Google Auth Notice',
        error?.message || 'Unable to complete Google OAuth connection.',
        'warning'
      );
    } finally {
      setIsGmailConnecting(false);
    }
  };

  const handleDisconnectGmail = () => {
    disconnectGmail();
    setGmailUser(null);
    addToast('Gmail Disconnected', 'Cleared in-memory Google Workspace token.', 'info');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) {
      addToast('Recipient Missing', 'Please enter a valid recipient email address.', 'warning');
      return;
    }

    setIsSending(true);
    try {
      if (templateType === 'order_confirmation') {
        const order = orders.find((o) => o.id === selectedOrderId) || orders[0];
        if (!order) {
          throw new Error('No order available to send receipt for.');
        }
        const res = await sendOrderConfirmationEmail(order, recipient.trim(), order.shippingAddress?.fullName || 'Valued Customer');
        if (res.success) {
          addToast('Email Dispatched', `Receipt delivered to ${recipient} (${res.provider?.toUpperCase()})`, 'success');
          loadHistory();
          setActiveTab('history');
        }
      } else if (templateType === 'tracking_update') {
        const order = orders.find((o) => o.id === selectedOrderId) || orders[0];
        const trackingNum = order?.trackingNumber || ('TRK-' + Math.random().toString(36).substring(2, 9).toUpperCase());
        const carrier = order?.carrier || 'FedEx Express';
        const res = await sendTrackingUpdateEmail(
          order?.id || 'ORD-PREVIEW',
          trackingNum,
          carrier,
          recipient.trim(),
          order?.shippingAddress?.fullName || 'Valued Customer'
        );
        if (res.success) {
          addToast('Tracking Notification Sent', `Courier update delivered to ${recipient}`, 'success');
          loadHistory();
          setActiveTab('history');
        }
      } else {
        const res = await sendEmail({
          to: recipient.trim(),
          subject: subject || 'Notice from NOVA Direct Supply',
          textBody: customBody || 'Thank you for choosing NOVA Direct Supply. We are always here to assist you.',
          type: 'custom',
          orderId: selectedOrderId || undefined
        });
        if (res.success) {
          addToast('Custom Email Sent', `Dispatched to ${recipient} (${res.provider?.toUpperCase()})`, 'success');
          loadHistory();
          setActiveTab('history');
        }
      }
    } catch (err: any) {
      console.error('Send email error:', err);
      addToast('Email Dispatch Notice', err?.message || 'Could not complete delivery', 'warning');
    } finally {
      setIsSending(false);
    }
  };

  if (!isEmailModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Email & Notifications Hub</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Universal Multi-Provider
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct integration with Gmail, Outlook, Hotmail, Yahoo & Custom Domains
              </p>
            </div>
          </div>
          <button
            onClick={() => closeEmailModal()}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2">
          <button
            id="email-tab-compose"
            onClick={() => setActiveTab('compose')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'compose'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Compose & Test Send
          </button>
          <button
            id="email-tab-history"
            onClick={() => {
              setActiveTab('history');
              loadHistory();
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Sent History Log ({emailHistory.length})
          </button>
          <button
            id="email-tab-gmail"
            onClick={() => setActiveTab('gmail')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'gmail'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Gmail OAuth ({gmailUser ? 'Connected' : 'Configure'})
          </button>
          <button
            id="email-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Automation Triggers
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'compose' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              {/* Quick Provider Selection Badges */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Target Mail Provider
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickProviderSelect('gmail.com', 'gmail')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                      recipientProvider === 'gmail'
                        ? 'bg-red-500/15 border-red-500/40 text-red-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span>Gmail (@gmail.com)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickProviderSelect('hotmail.com', 'hotmail')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                      recipientProvider === 'hotmail'
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Hotmail (@hotmail.com)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickProviderSelect('outlook.com', 'outlook')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                      recipientProvider === 'outlook'
                        ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>Outlook (@outlook.com)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickProviderSelect('yahoo.com', 'yahoo')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                      recipientProvider === 'yahoo'
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Yahoo (@yahoo.com)</span>
                  </button>
                </div>
              </div>

              {/* Recipient Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Email Address
                </label>
                <input
                  id="email-input-recipient"
                  type="email"
                  required
                  placeholder="e.g. shopper@gmail.com, ahmed@hotmail.com, user@outlook.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                />
              </div>

              {/* Template Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTemplateType('order_confirmation');
                    setSubject('Order Confirmation Receipt - NOVA Direct');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    templateType === 'order_confirmation'
                      ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Package className="w-4 h-4 text-indigo-400 mb-1.5" />
                  <div className="text-xs font-bold">Order Receipt</div>
                  <div className="text-[11px] text-slate-500">Invoice with items & total</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTemplateType('tracking_update');
                    setSubject('Shipping Dispatch & Live Tracking Notice');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    templateType === 'tracking_update'
                      ? 'bg-emerald-600/15 border-emerald-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Truck className="w-4 h-4 text-emerald-400 mb-1.5" />
                  <div className="text-xs font-bold">Courier Dispatch</div>
                  <div className="text-[11px] text-slate-500">Tracking # and carrier ETA</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTemplateType('custom');
                    setSubject('Direct Message from NOVA Support');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    templateType === 'custom'
                      ? 'bg-purple-600/15 border-purple-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400 mb-1.5" />
                  <div className="text-xs font-bold">Custom Notification</div>
                  <div className="text-[11px] text-slate-500">Freeform support message</div>
                </button>
              </div>

              {/* Order Selection if orders exist */}
              {orders.length > 0 && templateType !== 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Attach Order Data
                  </label>
                  <select
                    id="email-select-order"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.id} - ${o.total.toFixed(2)} ({o.items.length} items) - {o.shippingAddress?.fullName || 'Customer'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  id="email-input-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Custom message if custom template */}
              {templateType === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {gmailUser
                      ? `Routing via Google Workspace (${gmailUser.email})`
                      : 'Routing via universal multi-provider mail engine'}
                  </span>
                </div>
                <button
                  id="email-btn-send"
                  type="submit"
                  disabled={isSending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSending ? 'Sending Email...' : 'Dispatch Email Now'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Recent Dispatches ({emailHistory.length} Total)
                </span>
                <button
                  onClick={loadHistory}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  <span>Refresh Log</span>
                </button>
              </div>

              {emailHistory.length === 0 ? (
                <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-xl p-8">
                  <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-300 mb-1">No Emails Dispatched Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    Complete a checkout or click 'Compose & Test Send' to trigger automated notifications to Gmail, Hotmail, or Outlook.
                  </p>
                  <button
                    onClick={() => setActiveTab('compose')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
                  >
                    Send First Test Email
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {emailHistory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            item.recipientProvider === 'gmail'
                              ? 'bg-red-500/20 text-red-400'
                              : item.recipientProvider === 'hotmail' || item.recipientProvider === 'outlook'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {item.recipientProvider.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.recipientEmail}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                              {item.recipientProvider.toUpperCase()}
                            </span>
                            {item.orderId && (
                              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                                {item.orderId}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{item.subject}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{item.status === 'sent_via_gmail_api' ? 'Gmail API' : 'Delivered'}</span>
                          </span>
                          <div className="text-[10px] text-slate-500">
                            {new Date(item.sentAt).toLocaleTimeString()}
                          </div>
                        </div>

                        <button
                          onClick={() => setPreviewEmail(item)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Preview Email HTML"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'gmail' && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Google Workspace & Gmail Direct Link</h3>
                      <p className="text-xs text-slate-400">
                        Authorize sending messages directly from your personal or merchant Gmail account.
                      </p>
                    </div>
                  </div>
                  {gmailUser && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Connected
                    </span>
                  )}
                </div>

                {gmailUser ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Active Gmail Account</div>
                      <div className="text-sm font-bold text-white">{gmailUser.email}</div>
                      <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready to send real-time receipts via Gmail REST API</span>
                      </div>
                    </div>
                    <button
                      onClick={handleDisconnectGmail}
                      className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40 rounded-lg border border-red-500/30 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Connect your Google Account to send official transactional emails with authenticated SPF/DKIM directly from your Gmail address.
                    </p>
                    <button
                      id="gmail-oauth-connect-btn"
                      onClick={handleConnectGmail}
                      disabled={isGmailConnecting}
                      className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{isGmailConnecting ? 'Connecting via Google...' : 'Connect Gmail Account'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Supported Providers List */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Supported Mail Clients & Protocols
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <div>
                      <div className="font-semibold text-white">Google / Gmail</div>
                      <div className="text-[10px] text-slate-400">@gmail.com, Google Workspace</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <div>
                      <div className="font-semibold text-white">Microsoft Outlook & Hotmail</div>
                      <div className="text-[10px] text-slate-400">@hotmail.com, @outlook.com, @live.com</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <div>
                      <div className="font-semibold text-white">Yahoo Mail</div>
                      <div className="text-[10px] text-slate-400">@yahoo.com, @ymail.com</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">iCloud & Custom SMTP</div>
                      <div className="text-[10px] text-slate-400">@icloud.com, custom domain MX</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Auto-send Order Confirmations</div>
                  <div className="text-[11px] text-slate-400">
                    Immediately send formatted invoice & order details to customer upon successful checkout.
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Auto-send Courier Tracking Updates</div>
                  <div className="text-[11px] text-slate-400">
                    Dispatches carrier tracking link as soon as dropship or local order is marked dispatched.
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Store Owner Sale Notifications</div>
                  <div className="text-[11px] text-slate-400">
                    Sends real-time profit and order alerts to store owner email.
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <div>Universal Email Engine • 100% Delivery Reliability</div>
          <button
            onClick={() => closeEmailModal()}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close Hub
          </button>
        </div>
      </motion.div>

      {/* HTML Email Preview Modal */}
      <AnimatePresence>
        {previewEmail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase">Email Preview</div>
                  <div className="text-sm font-bold text-slate-900">{previewEmail.subject}</div>
                  <div className="text-xs text-slate-600">To: {previewEmail.recipientEmail}</div>
                </div>
                <button
                  onClick={() => setPreviewEmail(null)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div
                className="p-6 overflow-y-auto flex-1 bg-slate-100"
                dangerouslySetInnerHTML={{ __html: previewEmail.previewHtml }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
