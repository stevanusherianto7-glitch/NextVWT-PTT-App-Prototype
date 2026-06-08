import { describe, it, expect } from "vitest";
import {
  isHigherRole,
  canModerateRole,
  canPerformAction,
  canUsePTT,
  canUseChat,
  canUseReaction,
  type ChannelRole,
} from "./permissions";

describe("Permissions Engine – Unit Tests", () => {
  describe("isHigherRole", () => {
    it("should correctly compare roles based on hierarchy ranking", () => {
      expect(isHigherRole("noc", "sys_admin")).toBe(true);
      expect(isHigherRole("sys_admin", "pjc")).toBe(true);
      expect(isHigherRole("pjc", "operator")).toBe(true);
      expect(isHigherRole("operator", "guest")).toBe(true);

      expect(isHigherRole("guest", "operator")).toBe(false);
      expect(isHigherRole("operator", "pjc")).toBe(false);
      expect(isHigherRole("pjc", "sys_admin")).toBe(false);
      expect(isHigherRole("sys_admin", "noc")).toBe(false);

      expect(isHigherRole("noc", "noc")).toBe(false);
      expect(isHigherRole("guest", "guest")).toBe(false);
    });
  });

  describe("canModerateRole", () => {
    it("should allow NOC to moderate anyone except another NOC", () => {
      expect(canModerateRole("noc", "sys_admin")).toBe(true);
      expect(canModerateRole("noc", "pjc")).toBe(true);
      expect(canModerateRole("noc", "operator")).toBe(true);
      expect(canModerateRole("noc", "guest")).toBe(true);
      expect(canModerateRole("noc", "noc")).toBe(false);
    });

    it("should allow Sys Admin to moderate everyone except NOC and other Sys Admins", () => {
      expect(canModerateRole("sys_admin", "pjc")).toBe(true);
      expect(canModerateRole("sys_admin", "operator")).toBe(true);
      expect(canModerateRole("sys_admin", "guest")).toBe(true);
      
      expect(canModerateRole("sys_admin", "sys_admin")).toBe(false);
      expect(canModerateRole("sys_admin", "noc")).toBe(false);
    });

    it("should allow PJC to moderate only Operators and Guests", () => {
      expect(canModerateRole("pjc", "operator")).toBe(true);
      expect(canModerateRole("pjc", "guest")).toBe(true);

      expect(canModerateRole("pjc", "pjc")).toBe(false);
      expect(canModerateRole("pjc", "sys_admin")).toBe(false);
      expect(canModerateRole("pjc", "noc")).toBe(false);
    });

    it("should not allow Operator or Guest to moderate anyone", () => {
      const roles: ChannelRole[] = ["noc", "sys_admin", "pjc", "operator", "guest"];
      for (const role of roles) {
        expect(canModerateRole("operator", role)).toBe(false);
        expect(canModerateRole("guest", role)).toBe(false);
      }
    });
  });

  describe("canPerformAction", () => {
    it("should allow NOC and Sys Admin to perform all actions", () => {
      const actions: any[] = [
        "VIEW_ADMIN_PANEL",
        "MANAGE_CHANNEL",
        "MANAGE_ROLES",
        "MANAGE_SETTINGS",
        "MUTE_USER",
        "KICK_USER",
        "BAN_USER",
        "BLOCK_PTT",
        "BLOCK_CHAT",
        "MANAGE_QUEUE",
        "MANAGE_THEME",
        "VIEW_LOGS",
      ];
      for (const action of actions) {
        expect(canPerformAction("noc", action)).toBe(true);
        expect(canPerformAction("sys_admin", action)).toBe(true);
      }
    });

    it("should allow PJC to perform specific channel moderation/setting tasks, but not global channel management", () => {
      expect(canPerformAction("pjc", "VIEW_ADMIN_PANEL")).toBe(true);
      expect(canPerformAction("pjc", "MANAGE_SETTINGS")).toBe(true);
      expect(canPerformAction("pjc", "MANAGE_ROLES")).toBe(true);
      expect(canPerformAction("pjc", "MUTE_USER")).toBe(true);
      expect(canPerformAction("pjc", "KICK_USER")).toBe(true);
      expect(canPerformAction("pjc", "BAN_USER")).toBe(true);
      expect(canPerformAction("pjc", "BLOCK_PTT")).toBe(true);
      expect(canPerformAction("pjc", "BLOCK_CHAT")).toBe(true);
      expect(canPerformAction("pjc", "MANAGE_QUEUE")).toBe(true);
      expect(canPerformAction("pjc", "MANAGE_THEME")).toBe(true);
      expect(canPerformAction("pjc", "VIEW_LOGS")).toBe(true);

      // PJC cannot manage global channels
      expect(canPerformAction("pjc", "MANAGE_CHANNEL")).toBe(false);
    });

    it("should allow Operator to only view admin panel and manage queue", () => {
      expect(canPerformAction("operator", "VIEW_ADMIN_PANEL")).toBe(true);
      expect(canPerformAction("operator", "MANAGE_QUEUE")).toBe(true);

      expect(canPerformAction("operator", "MANAGE_CHANNEL")).toBe(false);
      expect(canPerformAction("operator", "MANAGE_ROLES")).toBe(false);
      expect(canPerformAction("operator", "MANAGE_SETTINGS")).toBe(false);
      expect(canPerformAction("operator", "MUTE_USER")).toBe(false);
      expect(canPerformAction("operator", "KICK_USER")).toBe(false);
      expect(canPerformAction("operator", "BAN_USER")).toBe(false);
      expect(canPerformAction("operator", "BLOCK_PTT")).toBe(false);
      expect(canPerformAction("operator", "BLOCK_CHAT")).toBe(false);
      expect(canPerformAction("operator", "MANAGE_THEME")).toBe(false);
      expect(canPerformAction("operator", "VIEW_LOGS")).toBe(false);
    });

    it("should deny all actions for Guest", () => {
      const actions: any[] = [
        "VIEW_ADMIN_PANEL",
        "MANAGE_CHANNEL",
        "MANAGE_ROLES",
        "MANAGE_SETTINGS",
        "MUTE_USER",
        "KICK_USER",
        "BAN_USER",
        "BLOCK_PTT",
        "BLOCK_CHAT",
        "MANAGE_QUEUE",
        "MANAGE_THEME",
        "VIEW_LOGS",
      ];
      for (const action of actions) {
        expect(canPerformAction("guest", action)).toBe(false);
      }
    });
  });

  describe("canUsePTT", () => {
    it("should block PTT if status is muted, ptt_blocked, banned, or suspended", () => {
      const blockStatuses = ["muted", "ptt_blocked", "banned", "suspended"];
      for (const status of blockStatuses) {
        expect(canUsePTT({ role: "noc", status, allowGuestPTT: true })).toBe(false);
        expect(canUsePTT({ role: "guest", status, allowGuestPTT: true })).toBe(false);
      }
    });

    it("should block Guest if allowGuestPTT is false", () => {
      expect(canUsePTT({ role: "guest", status: "active", allowGuestPTT: false })).toBe(false);
      expect(canUsePTT({ role: "operator", status: "active", allowGuestPTT: false })).toBe(true);
    });

    it("should allow PTT if status is active and role has clearance", () => {
      expect(canUsePTT({ role: "noc", status: "active", allowGuestPTT: false })).toBe(true);
      expect(canUsePTT({ role: "guest", status: "active", allowGuestPTT: true })).toBe(true);
    });
  });

  describe("canUseChat", () => {
    it("should block Chat if status is muted, chat_blocked, banned, or suspended", () => {
      const blockStatuses = ["muted", "chat_blocked", "banned", "suspended"];
      for (const status of blockStatuses) {
        expect(canUseChat({ role: "noc", status, allowGuestChat: true })).toBe(false);
        expect(canUseChat({ role: "guest", status, allowGuestChat: true })).toBe(false);
      }
    });

    it("should block Guest if allowGuestChat is false", () => {
      expect(canUseChat({ role: "guest", status: "active", allowGuestChat: false })).toBe(false);
      expect(canUseChat({ role: "operator", status: "active", allowGuestChat: false })).toBe(true);
    });

    it("should allow Chat if status is active and role has clearance", () => {
      expect(canUseChat({ role: "pjc", status: "active", allowGuestChat: false })).toBe(true);
      expect(canUseChat({ role: "guest", status: "active", allowGuestChat: true })).toBe(true);
    });
  });

  describe("canUseReaction", () => {
    it("should block Reaction if status is muted, banned, or suspended", () => {
      const blockStatuses = ["muted", "banned", "suspended"];
      for (const status of blockStatuses) {
        expect(canUseReaction({ role: "noc", status, allowGuestReaction: true })).toBe(false);
        expect(canUseReaction({ role: "guest", status, allowGuestReaction: true })).toBe(false);
      }
    });

    it("should allow Reaction for guest if status is active and reaction_blocked is not active", () => {
      expect(canUseReaction({ role: "guest", status: "chat_blocked", allowGuestReaction: true })).toBe(true);
    });

    it("should block Guest if allowGuestReaction is false", () => {
      expect(canUseReaction({ role: "guest", status: "active", allowGuestReaction: false })).toBe(false);
      expect(canUseReaction({ role: "operator", status: "active", allowGuestReaction: false })).toBe(true);
    });
  });
});
