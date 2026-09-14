import * as React from "react";
import { Check, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      gap={10}
      visibleToasts={4}
      duration={4000}
      offset="20px"
      mobileOffset={{
        top: "max(16px, calc(env(safe-area-inset-top, 0px) + 12px))",
        left: "16px",
        right: "16px",
      }}
      toastOptions={{
        className: "outsy-toast",
        classNames: {
          toast:
            "group toast bg-[#0F3040] text-[#F5F5F5] border border-[#D99A7C]/40 shadow-2xl rounded-[16px] min-h-[60px] px-4 py-3 text-[15px] font-medium backdrop-blur-md",
          title: "text-[#F5F5F5] text-[15px] font-medium leading-snug",
          description: "text-[#CBD5E1] text-[13px] font-normal leading-relaxed mt-0.5",
          actionButton:
            "bg-[#D99A7C] text-[#0F3040] font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-[#D99A7C]/90 transition",
          cancelButton:
            "bg-white/10 text-[#F5F5F5] font-medium text-xs px-3 py-1.5 rounded-lg hover:bg-white/15 transition",
          closeButton:
            "border border-white/15 bg-[#0F3040] text-[#CBD5E1] hover:text-[#F5F5F5] hover:bg-white/10 rounded-full",
          success: "!border-[#D99A7C]/50",
          error: "!border-[#D34E4E]/50",
          warning: "!border-[#F59E0B]/50",
          info: "!border-[#38BDF8]/50",
        },
      }}
      icons={{
        success: (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D99A7C] text-[#0F3040] shadow-sm">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </div>
        ),
        error: (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D34E4E]/20 text-[#F87171] border border-[#D34E4E]/40 shadow-sm">
            <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
        ),
        warning: (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40 shadow-sm">
            <AlertTriangle className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
        ),
        info: (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm">
            <Info className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
        ),
        loading: (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D99A7C]/20 text-[#D99A7C]">
            <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
          </div>
        ),
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
