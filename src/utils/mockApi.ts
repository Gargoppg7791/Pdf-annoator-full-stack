// Mock API for development - simulates backend functionality with localStorage persistence
import { User, PDF, Highlight } from '../types';

// Mock data storage (will be persisted to localStorage)
let users: User[] = [];
let pdfs: PDF[] = [];
let highlights: Highlight[] = [];
let currentUser: User | null = null;

// Local storage keys
const LS_USERS = 'mock_users_v1';
const LS_PDFS = 'mock_pdfs_v1';
const LS_HIGHLIGHTS = 'mock_highlights_v1';
const LS_TOKEN = 'token';

// Simple delay to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate UUID (simple)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Persistence helpers
const saveState = () => {
  try {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    localStorage.setItem(LS_PDFS, JSON.stringify(pdfs));
    localStorage.setItem(LS_HIGHLIGHTS, JSON.stringify(highlights));
  } catch (e) {
    console.warn('Failed to save mock state to localStorage', e);
  }
};

const loadState = () => {
  try {
    const u = localStorage.getItem(LS_USERS);
    const p = localStorage.getItem(LS_PDFS);
    const h = localStorage.getItem(LS_HIGHLIGHTS);
    if (u) users = JSON.parse(u);
    if (p) pdfs = JSON.parse(p);
    if (h) highlights = JSON.parse(h);

    // If token exists, try to set currentUser
    const token = localStorage.getItem(LS_TOKEN);
    if (token) {
      const parts = token.split('-');
      const id = parts[parts.length - 1];
      const found = users.find(x => x.id === id);
      if (found) currentUser = found;
    }
  } catch (e) {
    console.warn('Failed to load mock state from localStorage', e);
  }
};

// Initialize from localStorage
loadState();

// helper to read File -> data URL
const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const mockAuthAPI = {
  login: async (email: string, password: string) => {
    await delay(700);
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }
    // NOTE: password is not validated in mock
    currentUser = user;
    const token = 'mock-jwt-token-' + user.id;
    localStorage.setItem(LS_TOKEN, token);
    return { data: { token, user } };
  },

  register: async (name: string, email: string, password: string) => {
    await delay(1000);
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: generateUUID(),
      email,
      name
    };

    users.push(newUser);
    currentUser = newUser;
    const token = 'mock-jwt-token-' + newUser.id;
    localStorage.setItem(LS_TOKEN, token);
    // persist users
    saveState();
    return { data: { token, user: newUser } };
  },

  verifyToken: async () => {
    await delay(400);
    const token = localStorage.getItem(LS_TOKEN);
    if (!token) {
      throw new Error('Invalid token');
    }
    const parts = token.split('-');
    const id = parts[parts.length - 1];
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new Error('Invalid token');
    }
    currentUser = user;
    return { data: { user: currentUser } };
  }
};

export const mockPdfAPI = {
  upload: async (formData: FormData) => {
    await delay(800);
    const file = formData.get('pdf') as File;
    if (!file || !currentUser) {
      throw new Error('Upload failed');
    }

    // read file contents as data URL so react-pdf can load it directly
    const dataUrl = await readFileAsDataUrl(file);

    const newPdf: PDF = {
      id: generateUUID(),
      filename: `${generateUUID()}.pdf`,
      originalName: file.name,
      uploadDate: new Date().toISOString(),
      userId: currentUser.id,
      dataUrl
    };

    pdfs.push(newPdf);
    saveState();
    return { data: newPdf };
  },

  list: async () => {
    await delay(400);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }
    const userPdfs = pdfs.filter(pdf => pdf.userId === currentUser.id);
    return { data: userPdfs };
  },

  get: async (id: string) => {
    await delay(300);
    const pdf = pdfs.find(p => p.id === id && p.userId === currentUser?.id);
    if (!pdf) {
      throw new Error('PDF not found');
    }
    return { data: pdf };
  },

  rename: async (id: string, newName: string) => {
    await delay(300);
    const pdf = pdfs.find(p => p.id === id && p.userId === currentUser?.id);
    if (!pdf) {
      throw new Error('PDF not found');
    }
    pdf.originalName = newName;
    saveState();
    return { data: pdf };
  },

  delete: async (id: string) => {
    await delay(300);
    const index = pdfs.findIndex(p => p.id === id && p.userId === currentUser?.id);
    if (index === -1) {
      throw new Error('PDF not found');
    }
    pdfs.splice(index, 1);
    // also remove highlights for this pdf
    highlights = highlights.filter(h => h.pdfId !== id);
    saveState();
    return { data: { success: true } };
  }
};

export const mockHighlightAPI = {
  list: async (pdfId: string) => {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');
    const list = highlights.filter(h => h.pdfId === pdfId && h.userId === currentUser?.id);
    return { data: list };
  },

  create: async (payload: Omit<Highlight, 'id' | 'userId' | 'timestamp'>) => {
    await delay(200);
    if (!currentUser) throw new Error('Unauthorized');
    const newHighlight: Highlight = {
      id: generateUUID(),
      userId: currentUser.id,
      ...payload,
      timestamp: new Date().toISOString()
    };
    highlights.push(newHighlight);
    saveState();
    return { data: newHighlight };
  },

  update: async (id: string, updates: Partial<Highlight>) => {
    await delay(200);
    const highlight = highlights.find(h => h.id === id && h.userId === currentUser?.id);
    if (!highlight) throw new Error('Highlight not found');
    Object.assign(highlight, updates);
    saveState();
    return { data: highlight };
  },

  delete: async (id: string) => {
    await delay(200);
    const index = highlights.findIndex(h => h.id === id && h.userId === currentUser?.id);
    if (index === -1) throw new Error('Highlight not found');
    highlights.splice(index, 1);
    saveState();
    return { data: { success: true } };
  }
};
