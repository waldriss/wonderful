"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  UsersRound,
  Search,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  X,
  Check,
  Eye,
  Clock,
  Activity,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminTeam } from "@/lib/api/admin/queries";
import { useChangeUserStatus, useChangeUserRole } from "@/lib/api/admin/mutations";
import type { AdminCustomer, UserRole } from "@/lib/api/admin/types";
import { toast } from "sonner";

const roleConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "bg-purple-100 text-purple-700", icon: ShieldCheck },
  ADMIN: { label: "Admin", color: "bg-blue-100 text-blue-700", icon: Shield },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<AdminCustomer | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const { data, isLoading } = useAdminTeam();
  const changeStatus = useChangeUserStatus();
  const changeRole = useChangeUserRole();

  const members = data?.data ?? [];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      (member.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "ACTIVE").length,
    admins: members.filter((m) => m.role === "ADMIN" || m.role === "SUPER_ADMIN").length,
  };

  async function handleToggleStatus(member: AdminCustomer) {
    const newStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await changeStatus.mutateAsync({ id: member.id, data: { status: newStatus } });
      toast.success(`Statut mis à jour : ${newStatus}`);
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  }

  async function handleChangeRole(memberId: string, newRole: UserRole) {
    try {
      await changeRole.mutateAsync({ id: memberId, data: { role: newRole } });
      toast.success("Rôle mis à jour");
      setEditingRole(null);
    } catch {
      toast.error("Erreur lors du changement de rôle");
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
            <UsersRound className="w-8 h-8 text-secondary" />
            Gestion de l&apos;équipe
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            Gérez les membres et leurs permissions
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
              <UsersRound className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-2xl font-sans font-bold text-secondary-850">
              {isLoading ? "—" : stats.total}
            </span>
          </div>
          <p className="text-sm font-sans text-secondary-850/60">Membres total</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-sans font-bold text-secondary-850">
              {isLoading ? "—" : stats.active}
            </span>
          </div>
          <p className="text-sm font-sans text-secondary-850/60">Membres actifs</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-2xl font-sans font-bold text-secondary-850">
              {isLoading ? "—" : stats.admins}
            </span>
          </div>
          <p className="text-sm font-sans text-secondary-850/60">Administrateurs</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-850/40" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-card border-2 border-secondary/10 rounded-xl font-sans text-secondary-850 placeholder:text-secondary-850/40 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-12 px-4 bg-card border-2 border-secondary/10 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
        >
          <option value="all">Tous les rôles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMIN">Admin</option>
        </select>
      </motion.div>

      {/* Team List */}
      <motion.div variants={itemVariants} className="bg-card border-2 border-secondary/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Activity className="w-6 h-6 text-secondary animate-pulse" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary/10">
                  <th className="text-left py-4 px-6 font-sans font-semibold text-secondary-850">Membre</th>
                  <th className="text-left py-4 px-6 font-sans font-semibold text-secondary-850">Rôle</th>
                  <th className="text-left py-4 px-6 font-sans font-semibold text-secondary-850">Statut</th>
                  <th className="text-left py-4 px-6 font-sans font-semibold text-secondary-850">Depuis</th>
                  <th className="text-right py-4 px-6 font-sans font-semibold text-secondary-850">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-secondary-850/50 font-sans">
                      Aucun membre trouvé
                    </td>
                  </tr>
                )}
                {filteredMembers.map((member) => {
                  const roleInfo = roleConfig[member.role] ?? { label: member.role, color: "bg-gray-100 text-gray-700", icon: Shield };
                  const RoleIcon = roleInfo.icon;
                  return (
                    <tr key={member.id} className="border-b border-secondary/5 hover:bg-white/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                            <span className="font-sans font-semibold text-secondary">
                              {(member.name ?? member.email).slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-sans font-medium text-secondary-850">{member.name ?? "—"}</p>
                            <p className="text-sm text-secondary-850/60 font-sans">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {editingRole === member.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              defaultValue={member.role}
                              onChange={(e) => handleChangeRole(member.id, e.target.value as UserRole)}
                              className="h-8 px-2 bg-white/30 border-2 border-secondary/20 rounded-lg font-sans text-sm text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                            >
                              <option value="ADMIN">Admin</option>
                              <option value="SUPER_ADMIN">Super Admin</option>
                              <option value="CUSTOMER">Customer</option>
                            </select>
                            <button
                              onClick={() => setEditingRole(null)}
                              className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-sans font-medium",
                            roleInfo.color
                          )}>
                            <RoleIcon className="w-3.5 h-3.5" />
                            {roleInfo.label}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(member)}
                          disabled={changeStatus.isPending}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-sans font-medium transition-opacity",
                            member.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                            "disabled:opacity-60 cursor-pointer"
                          )}
                        >
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            member.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"
                          )} />
                          {member.status === "ACTIVE" ? "Actif" : "Inactif"}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-secondary-850/60">
                          <Clock className="w-4 h-4" />
                          <span className="font-sans text-sm">
                            {member.createdAt
                              ? new Date(member.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "short" })
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingRole(editingRole === member.id ? null : member.id)}
                            className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-secondary/10 flex items-center justify-between">
              <h2 className="text-xl font-sans font-bold text-secondary-850">
                Détails du membre
              </h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {/* Profile */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-sans font-bold text-secondary">
                    {(selectedMember.name ?? selectedMember.email).slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-sans font-bold text-secondary-850">
                    {selectedMember.name ?? selectedMember.email}
                  </h3>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-sans font-medium mt-1",
                    (roleConfig[selectedMember.role] ?? { color: "bg-gray-100 text-gray-700" }).color
                  )}>
                    {(roleConfig[selectedMember.role] ?? { label: selectedMember.role }).label}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/30 rounded-xl">
                  <Mail className="w-5 h-5 text-secondary" />
                  <span className="font-sans text-secondary-850">{selectedMember.email}</span>
                </div>
                {selectedMember.phone && (
                  <div className="flex items-center gap-3 p-3 bg-white/30 rounded-xl">
                    <Phone className="w-5 h-5 text-secondary" />
                    <span className="font-sans text-secondary-850">{selectedMember.phone}</span>
                  </div>
                )}
                {selectedMember.createdAt && (
                  <div className="flex items-center gap-3 p-3 bg-white/30 rounded-xl">
                    <Calendar className="w-5 h-5 text-secondary" />
                    <span className="font-sans text-secondary-850">
                      Membre depuis {new Date(selectedMember.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-secondary/10">
              <button
                onClick={() => setSelectedMember(null)}
                className="w-full h-12 border-2 border-secondary/20 rounded-xl font-sans font-semibold text-secondary-850 hover:bg-secondary/5 transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
