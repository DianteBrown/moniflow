import { authService } from './authService';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (element: HTMLElement | null, config: GoogleButtonConfig) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleButtonConfig {
  theme: string;
  size: string;
  width: string;
  text: string;
  shape: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

class GoogleAuthService {
  private clientId: string;
  private isInitialized = false;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: this.handleCredentialResponse.bind(this),
        });
        this.isInitialized = true;
        resolve();
      } else {
        reject(new Error('Google Identity Services not loaded'));
      }
    });
  }

  private async handleCredentialResponse(response: GoogleCredentialResponse): Promise<void> {
    try {
      const result = await authService.googleAuth(response.credential);
      authService.setToken(result.token);
      
      // Check if profile is completed based on backend response
      if (!result.user.profile_completed) {
        // Store user data for profile completion
        localStorage.setItem('pendingProfileCompletion', JSON.stringify(result.user));
      }
      
      // Always redirect to dashboard - profile completion modal will handle the rest
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Google authentication failed:', error);
      throw error;
    }
  }

  renderButton(elementId: string): void {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        shape: 'rectangular'
      }
    );
  }

  prompt(): void {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    window.google.accounts.id.prompt();
  }
}

export const googleAuthService = new GoogleAuthService();