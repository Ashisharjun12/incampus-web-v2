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
      <div className="relative w-full max-w-sm bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-0 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="text-lg font-bold text-gray-900 dark:text-white">Share</div>
          <button
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full p-1"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Description */}
        <div className="px-6 pt-3 pb-1 text-sm text-gray-500 dark:text-gray-400">Share this post with your friends</div>
        {/* Share options */}
        <div className="flex flex-col gap-2 px-6 pt-2 pb-2">
          {shareOptions.map(({ label, Button: ShareBtn, Icon }) => (
            <ShareBtn url={url} title={title} key={label}>
              <div className="flex items-center gap-3 w-full px-0 py-2 rounded-full bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                <Icon size={32} round />
                <span className="text-base font-medium text-gray-900 dark:text-white">{label}</span>
              </div>
            </ShareBtn>
          ))}
        </div>
        {/* Divider */}
        <div className="px-6">
          <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
        </div>
        {/* Copy Link */}
        <div className="px-6 pb-5">
          <Button
            variant="ghost"
            className="flex items-center gap-3 w-full px-0 py-2 rounded-full bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-base font-medium border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            onClick={handleCopy}
          >
            <Copy className="h-6 w-6" />
            Copy Link
          </Button>
        </div>
      </div>
    </div>
  );
} 