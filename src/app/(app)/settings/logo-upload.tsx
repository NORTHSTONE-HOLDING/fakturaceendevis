"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { saveCompanyLogoAction } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg"];

export function LogoUpload({ logoUrl }: { logoUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [current, setCurrent] = useState<string | null>(logoUrl);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Podporované formáty: PNG, JPG, JPEG.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("branding")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) {
        toast.error(`Nahrání selhalo: ${error.message}`);
        return;
      }
      const { data } = supabase.storage.from("branding").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      const res = await saveCompanyLogoAction(publicUrl);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setCurrent(publicUrl);
      toast.success("Logo nahráno — propsáno do všech dokladů");
      router.refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeLogo() {
    startTransition(async () => {
      const res = await saveCompanyLogoAction(null);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setCurrent(null);
      toast.success("Logo odebráno");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex h-24 w-40 items-center justify-center overflow-hidden rounded-lg border bg-muted">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="Logo firmy" className="max-h-20 max-w-36 object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">Žádné logo</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          className="hidden"
          onChange={onFile}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Nahrát logo
          </Button>
          {current && (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={removeLogo}
              disabled={pending}
            >
              <Trash2 className="h-4 w-4" /> Odebrat
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          PNG nebo JPG. Logo se automaticky propíše do hlavičky všech dokladů.
        </p>
      </div>
    </div>
  );
}
