// Gestionnaire de sessions en mémoire (sans Redis)
// Parfait pour < 10,000 utilisateurs/jour

interface SessionData {
  data: any;
  lastActivity: number;
}

class SessionManager {
  private sessions: Map<string, SessionData>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
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
    const expirationTime = 2 * 60 * 60 * 1000; // 2 heures
    
    if (now - session.lastActivity > expirationTime) {
      console.log(`⏰ Session expirée: ${key}`);
      this.sessions.delete(key);
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
  }

  // Supprimer une session
  delete(key: string): void {
    this.sessions.delete(key);
    console.log(`🗑️  Session supprimée: ${key}`);
  }

  // Nettoyage automatique des sessions expirées
  private startCleanup(): void {
    // Nettoyer toutes les 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const expirationTime = 30 * 60 * 1000; // 30 minutes
      let cleaned = 0;

      this.sessions.forEach((session, key) => {
        if (now - session.lastActivity > expirationTime) {
          this.sessions.delete(key);
          cleaned++;
        }
      });

      if (cleaned > 0) {
        console.log(`🧹 Nettoyage: ${cleaned} sessions expirées supprimées`);
        console.log(`📊 Sessions actives restantes: ${this.sessions.size}`);
      }
    }, 5 * 60 * 1000); // Toutes les 5 minutes
  }

  // Statistiques
  getStats(): { total: number; memoryUsage: string } {
    const total = this.sessions.size;
    const estimatedMemory = total * 7; // ~7 KB par session
    const memoryUsage = estimatedMemory > 1024 
      ? `${(estimatedMemory / 1024).toFixed(2)} MB`
      : `${estimatedMemory} KB`;

    return { total, memoryUsage };
  }

  // Arrêter le nettoyage (pour les tests)
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Instance unique (singleton)
export const sessionManager = new SessionManager();

// Fonctions compatibles avec l'API Redis
export async function getSession(key: string): Promise<any | null> {
  return sessionManager.get(key);
}

export async function setSession(key: string, data: any): Promise<void> {
  sessionManager.set(key, data);
}

export async function deleteSession(key: string): Promise<void> {
  sessionManager.delete(key);
}

// Afficher les stats toutes les heures
setInterval(() => {
  const stats = sessionManager.getStats();
  console.log(`\n📊 ========== STATS SESSIONS ==========`);
  console.log(`  Sessions actives: ${stats.total}`);
  console.log(`  Mémoire utilisée: ${stats.memoryUsage}`);
  console.log(`=======================================\n`);
}, 60 * 60 * 1000); // Toutes les heures
