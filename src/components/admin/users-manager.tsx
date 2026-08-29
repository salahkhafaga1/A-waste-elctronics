"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Coins,
  Calendar,
  Mail,
  Phone,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateUserRoleAdminAction } from "@/app/actions/admin";
import { formatPoints } from "@/lib/utils";
import type { Profile, UserRole } from "@/types/database";

interface UsersManagerProps {
  users: Profile[];
}

export function UsersManager({ users }: UsersManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>("user");
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || "").includes(searchQuery);

    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const openChangeRoleModal = (user: Profile, newRole: UserRole) => {
    setSelectedUser(user);
    setTargetRole(newRole);
    setRoleModalOpen(true);
  };

  const handleConfirmRoleChange = () => {
    if (!selectedUser) return;

    startTransition(async () => {
      const res = await updateUserRoleAdminAction(selectedUser.clerk_user_id, targetRole);

      if (!res.success) {
        toast.error("فشل تعديل الصلاحية", { description: res.error });
        return;
      }

      toast.success(`تم تغيير رتبة المستخدم إلى (${targetRole === "admin" ? "مسؤول" : "مستخدم عادي"}) بنجاح.`);
      setRoleModalOpen(false);
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، البريد أو الهاتف..."
            className="pr-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              roleFilter === "all"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            الكل ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              roleFilter === "admin"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            المسؤولين ({users.filter((u) => u.role === "admin").length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("user")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              roleFilter === "user"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            المستخدمين ({users.filter((u) => u.role === "user").length})
          </button>
        </div>
      </div>

      {/* Users Cards Grid */}
      {filteredUsers.length === 0 ? (
        <Card className="p-12 text-center border-dashed bg-muted/10">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-sm">لم يتم العثور على مستخدمين</h3>
          <p className="text-xs text-muted-foreground mt-1">
            جرب تعديل كلمة البحث أو تصفح باقي الرتب.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((u) => {
            const isAdmin = u.role === "admin";

            return (
              <Card
                key={u.id}
                className="p-5 hover:border-amber-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground">
                        {(u.full_name || u.email || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">
                          {u.full_name || "مستخدم بدون اسم"}
                        </h4>
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {u.email}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={isAdmin ? "default" : "secondary"}
                      className={`text-[10px] ${isAdmin ? "bg-amber-100 text-amber-900 border-amber-300" : ""}`}
                    >
                      {isAdmin ? "مسؤول (Admin)" : "عميل"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg bg-muted/20 border">
                    <div>
                      <span className="text-[10px] text-muted-foreground">رصيد النقاط:</span>
                      <p className="font-mono font-bold text-emerald-700">
                        {formatPoints(u.points_balance || 0)} نقطة
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">رقم الهاتف:</span>
                      <p className="font-mono font-medium text-foreground" dir="ltr">
                        {u.phone || "غير مسجل"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    انضم: {new Date(u.created_at).toLocaleDateString("ar-EG")}
                  </span>

                  {isAdmin ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openChangeRoleModal(u, "user")}
                      className="text-xs h-7 text-destructive hover:bg-destructive/10 border-destructive/30"
                    >
                      إلغاء صلاحية المسؤول
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openChangeRoleModal(u, "admin")}
                      className="text-xs h-7 text-amber-800 hover:bg-amber-50 border-amber-300"
                    >
                      تعيين كمسؤول (Admin)
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Role Confirmation Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold mb-1">
              <ShieldAlert className="h-4 w-4 text-amber-700" />
              <span>تعديل صلاحيات الوصول الإدارية</span>
            </div>
            <DialogTitle className="text-base font-bold">
              {targetRole === "admin"
                ? "ترقية المستخدم إلى مسؤول (Admin)"
                : "إلغاء الصلاحية الإدارية"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {targetRole === "admin"
                ? `سيتمكن (${selectedUser?.full_name || selectedUser?.email}) من الوصول الكامل لجميع صفحات الإدارة واعتماد الطلبات.`
                : `سيتم تحويل حساب (${selectedUser?.full_name || selectedUser?.email}) إلى مستخدم عادي وإلغاء صلاحيات الإدارة.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setRoleModalOpen(false)}
              disabled={isPending}
              className="text-xs"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirmRoleChange}
              disabled={isPending}
              className={`text-xs font-bold gap-2 ${
                targetRole === "admin"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-destructive hover:bg-destructive/90 text-white"
              }`}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأكيد تغيير الرتبة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
