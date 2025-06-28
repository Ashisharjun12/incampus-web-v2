import React from 'react';
import {
  WhatsappShareButton,
  TwitterShareButton,
  FacebookShareButton,
  TelegramShareButton,
  WhatsappIcon,
  TwitterIcon,
  FacebookIcon,
  TelegramIcon
} from 'react-share';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, X } from 'lucide-react';

const shareOptions = [
  {
    label: 'WhatsApp',
    Button: WhatsappShareButton,
    Icon: WhatsappIcon,
  },
  {
    label: 'Twitter',
    Button: TwitterShareButton,
    Icon: TwitterIcon,
  },
  {
    label: 'Facebook',
    Button: FacebookShareButton,
    Icon: FacebookIcon,
  },
  {
    label: 'Telegram',
    Button: TelegramShareButton,
    Icon: TelegramIcon,
  },
];

export default function ShareModal({ open, onClose, url, title }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-xs bg-background rounded-xl border border-border/60 p-6 shadow-xl flex flex-col gap-4">
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-lg font-semibold mb-2">Share Post</div>
        {shareOptions.map(({ label, Button: ShareBtn, Icon }) => (
          <ShareBtn url={url} title={title} key={label}>
            <div className="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 transition cursor-pointer">
              <Icon size={32} round />
              <span className="text-base font-medium text-foreground">{label}</span>
            </div>
          </ShareBtn>
        ))}
        <Button
          variant="ghost"
          className="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 transition text-base font-medium"
          onClick={handleCopy}
        >
          <Copy className="h-6 w-6" />
          Copy Link
        </Button>
      </div>
    </div>
  );
} 