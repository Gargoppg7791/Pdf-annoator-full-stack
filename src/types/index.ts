export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PDF {
  id: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  userId: string;
  // Base64 data URL for client-side preview (optional)
  dataUrl?: string;
}

export interface Highlight {
  id: string;
  pdfId: string;
  userId: string;
  pageNumber: number;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
  timestamp: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
