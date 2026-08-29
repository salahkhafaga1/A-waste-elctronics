import React from "react";
import { Scale, Coins, Trees, Heart, ShieldCheck } from "lucide-react";

export function StatsCounter() {
  const STATS = [
    {
      label: "إجمالي المخلفات المستلمة والمفروزة",
      value: "+18,500",
      unit: "كجم خردة إلكترونية",
      icon: Scale,
      color: "text-emerald-600",
    },
    {
      label: "نقاط مكافآت تم توزيعها وصرفها",
      value: "+1,420,000",
      unit: "نقطة مستبدلة",
      icon: Coins,
      color: "text-amber-600",
    },
    {
      label: "أشجار خضراء تمت زراعتها بمصر",
      value: "+1,850",
      unit: "شجرة زيتون ومثمرة",
      icon: Trees,
      color: "text-emerald-700",
    },
    {
      label: "تبرعات موجهة لمستشفى 57357",
      value: "+95,000",
      unit: "جنيه مصري",
      icon: Heart,
      color: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {STATS.map((st) => {
        const Icon = st.icon;
        return (
          <div
            key={st.label}
            className="p-5 rounded-2xl border bg-card/80 backdrop-blur-xs shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-muted-foreground font-medium">{st.unit}</span>
              <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center">
                <Icon className={`h-4 w-4 ${st.color}`} />
              </div>
            </div>

            <div>
              <p className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${st.color}`}>
                {st.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{st.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
