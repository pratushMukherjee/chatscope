import { create } from 'zustand';

const useChatStore = create((set) => ({
  activeConversationId: null,
  streamingMessage: '',
  isStreaming: false,

  setActiveConversation: (id) => set({ activeConversationId: id }),
  setStreamingMessage: (msg) => set({ streamingMessage: msg }),
  appendStreamingMessage: (text) =>
    set((state) => ({ streamingMessage: state.streamingMessage + text })),
  setIsStreaming: (val) => set({ isStreaming: val }),
  clearStreaming: () => set({ streamingMessage: '', isStreaming: false }),
}));

export default useChatStore;
