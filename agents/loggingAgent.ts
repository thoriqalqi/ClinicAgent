
import { LogEntry } from '../types';

// Simulated Database for Logs
const LOG_DATABASE: LogEntry[] = [];

export const aiLoggingAgent = {
  /**
   * Captures inputs and outputs of other agents.
   * This function mimics a database write operation.
   */
  logInteraction: async (
    agentName: string,
    userId: string,
    payload: any,
    response: any,
    success: boolean = true
  ): Promise<{ logged: boolean; logId: string }> => {

    try {
      const logEntry: LogEntry = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        agent_name: agentName,
        user_id: userId,
        payload: JSON.parse(JSON.stringify(payload)), // Deep copy to ensure immutability
        response: JSON.parse(JSON.stringify(response)),
        status: success ? 'SUCCESS' : 'FAILURE'
      };

      // Simulate DB Write
      LOG_DATABASE.push(logEntry);

      console.groupCollapsed(`[AI AUDIT LOG] ${agentName}`);
      console.log("Timestamp:", logEntry.timestamp);
      console.log("User:", userId);
      console.log("Input:", logEntry.payload);
      console.log("Output:", logEntry.response);
      console.groupEnd();

      return { logged: true, logId: logEntry.id };

    } catch (error) {
      console.error("Logging Agent Failed:", error);
      // In a real system, we might write to a fallback local file
      return { logged: false, logId: 'failed' };
    }
  },

  /**
   * For Admin Dashboard usage
   */
  getLogs: async (): Promise<LogEntry[]> => {
    return [...LOG_DATABASE];
  }
};
