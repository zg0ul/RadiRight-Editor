"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUIStore } from "@/lib/store/ui-store";

interface BilingualInputProps {
  label: string;
  valueEn: string;
  valueAr: string;
  onChangeEn: (value: string) => void;
  onChangeAr: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}

export function BilingualInput({
  label,
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
  multiline = false,
  placeholder,
}: BilingualInputProps) {
  const languageDisplay = useUIStore((s) => s.languageDisplay);
  const InputComp = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className={`grid gap-2 ${languageDisplay === "both" ? "grid-cols-2" : "grid-cols-1"}`}>
        {(languageDisplay === "en" || languageDisplay === "both") && (
          <div>
            {languageDisplay === "both" && (
              <span className="text-[10px] text-muted-foreground mb-1 block">EN</span>
            )}
            <InputComp
              value={valueEn}
              onChange={(e) => onChangeEn(e.target.value)}
              placeholder={placeholder || `${label} (English)`}
              className="text-sm"
            />
          </div>
        )}
        {(languageDisplay === "ar" || languageDisplay === "both") && (
          <div>
            {languageDisplay === "both" && (
              <span className="text-[10px] text-muted-foreground mb-1 block">AR</span>
            )}
            <InputComp
              value={valueAr}
              onChange={(e) => onChangeAr(e.target.value)}
              placeholder={placeholder || `${label} (Arabic)`}
              dir="rtl"
              className="text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
