
import { RoleAgentInput, RoleAgentOutput } from './schemas';
import { UserRole } from '../types';

export const roleDecisionAgent = {
  /**
   * Deterministic logic to enforce RBAC (Role Based Access Control).
   * Acts as the central authority for permissions.
   */
  determineAccess: (input: RoleAgentInput): RoleAgentOutput => {
    const role = input.role;

    switch (role) {
      case UserRole.ADMIN:
        return {
          role: UserRole.ADMIN,
          permissions: [
            "manage_users",
            "verify_doctors",
            "view_system_stats",
            "edit_settings",
            "view_audit_logs"
          ],
          ui_config: {
            show_dashboard: true,
            show_records: true, // Admin can view logs
            show_admin_panel: true,
            can_prescribe: false
          }
        };

      case UserRole.DOCTOR:
        return {
          role: UserRole.DOCTOR,
          permissions: [
            "view_assigned_patients",
            "write_prescription",
            "create_medical_record",
            "view_consultation_queue"
          ],
          ui_config: {
            show_dashboard: true,
            show_records: true,
            show_admin_panel: false,
            can_prescribe: true
          }
        };

      case UserRole.PATIENT:
      default:
        return {
          role: UserRole.PATIENT,
          permissions: [
            "run_ai_consultation",
            "view_own_history",
            "view_own_prescriptions",
            "trigger_emergency"
          ],
          ui_config: {
            show_dashboard: true,
            show_records: true, // Only own records
            show_admin_panel: false,
            can_prescribe: false
          }
        };
    }
  }
};
