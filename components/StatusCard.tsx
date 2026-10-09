import React from "react";

interface StatusCardProps {
  title: string;
  description: string;
  status?: "active" | "pending" | "inactive";
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  description,
  status = "active",
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-200">{title}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${
            status === "active"
              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
              : "bg-amber-950/80 border-amber-500/30 text-amber-300"
          }`}
        >
          {status}
        </span>
      </div>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
};

export default StatusCard;
