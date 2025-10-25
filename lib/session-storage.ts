import fs from 'fs';
import path from 'path';

const SESSION_FILE = path.join(process.cwd(), '.sessions.json');

interface SessionData {
  data: any;
  lastActivity: number;
}

class PersistentSessionManager {
  private sessions: Map<string, SessionData>;
  private cleanupInterval: NodeJS.Timeout | null;
  private saveTimeout: NodeJS.Timeout | null;

  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = null;
    this.saveTimeout = null;
    this.loadSessions();
    this.startCleanup();
  }

  // Charger les sessions depuis le fichier
  private loadSessions(): void {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        const data = fs.readFileSync(SESSION_FILE, 'utf-8');
        const sessionsArray = JSON.parse(data);
        this.sessions = new Map(sessionsArray);
        console.log(`📂 ${this.sessions.size} sessions chargées depuis le fichier`);
      }
    } catch (error) {
      console.error('❌ Erreur chargement sessions:', error);
      this.sessions = new Map();
    }
  }

  // Sauvegarder les sessions dans le fichier (avec debounce)
  private saveSessions(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      try {
        const sessionsArray = Array.from(this.sessions.entries());
        fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionsArray, null, 2));
        console.log(`💾 ${this.sessions.size} sessions sauvegardées dans le fichier`);
      } catch (error) {
        console.error('❌ Erreur sauvegarde sessions:', error);
      }
    }, 1000); // Sauvegarder après 1 seconde d'inactivité
  }

  // Récupérer une session
  get(key: string): any | null {
    const session = this.sessions.get(key);
    
    if (!session) {
      console.log(`📭 Session non trouvée: ${key}`);
      return null;
    }

    // Vérifier si la session a expiré (2 heures)
    const now = Date.now();
    const expirationTime = 2 * 60 * 60 * 1000;
    
    if (now - session.lastActivity > expirationTime) {
      console.log(`⏰ Session expirée: ${key}`);
      this.sessions.delete(key);
      this.saveSessions();
      return null;
    }

    // Mettre à jour l'activité
    session.lastActivity = now;
    console.log(`✅ Session trouvée: ${key}, step: ${session.data.step}`);
    
    return session.data;
  }

  // Sauvegarder une session
  set(key: string, data: any): void {
    this.sessions.set(key, {
      data,
      lastActivity: Date.now(),
    });
    
    console.log(`💾 Session sauvegardée: ${key}, step: ${data.step}`);
    console.log(`📊 Total sessions actives: ${this.sessions.size}`);
    
    this.saveSessions();
  }

  // Supprimer une session
  delete(key: string): void {
    this.sessions.delete(key);
    console.log(`🗑️  Session supprimée: ${key}`);
    this.saveSessions();
  }

  // Nettoyage automatique
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const expirationTime = 2 * 60 * 60 * 1000;
      let cleaned = 0;

      this.sessions.forEach((session, key) => {
        if (now - session.lastActivity > expirationTime) {
          this.sessions.delete(key);
          cleaned++;
        }
      });

      if (cleaned > 0) {
        console.log(`🧹 Nettoyage: ${cleaned} sessions expirées`);
        this.saveSessions();
      }
    }, 5 * 60 * 1000);
  }

  // Statistiques
  getStats(): { total: number; memoryUsage: string } {
    const total = this.sessions.size;
    const estimatedMemory = total * 7;
    const memoryUsage = estimatedMemory > 1024 
      ? `${(estimatedMemory / 1024).toFixed(2)} MB`
      : `${estimatedMemory} KB`;

    return { total, memoryUsage };
  }
}

// Instance unique
export const sessionManager = new PersistentSessionManager();

// API compatible
export async function getSession(key: string): Promise<any | null> {
  return sessionManager.get(key);
}

export async function setSession(key: string, data: any): Promise<void> {
  sessionManager.set(key, data);
}

export async function deleteSession(key: string): Promise<void> {
  sessionManager.delete(key);
}

// Stats
setInterval(() => {
  const stats = sessionManager.getStats();
  console.log(`\n📊 ========== STATS SESSIONS ==========`);
  console.log(`  Sessions actives: ${stats.total}`);
  console.log(`  Mémoire utilisée: ${stats.memoryUsage}`);
  console.log(`=======================================\n`);
}, 60 * 60 * 1000);
