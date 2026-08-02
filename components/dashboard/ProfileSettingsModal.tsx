'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string | null;
  userName: string;
}

export function ProfileSettingsModal({ isOpen, onClose, currentImage, userName }: ProfileSettingsModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Convert to base64 for better-auth
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const { error: updateError } = await authClient.updateUser({
          image: base64String,
        });

        if (updateError) {
          setError(updateError.message || 'Failed to update profile image');
        } else {
          router.refresh();
          onClose();
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('An error occurred while processing the image');
      setIsUploading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Profile Settings">
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {currentImage ? (
            <Image
              src={currentImage}
              alt={userName}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover transition-opacity group-hover:opacity-75"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-lime text-3xl font-bold text-void transition-opacity group-hover:opacity-75">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-8 w-8 text-white" />
          </div>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-lg">{userName}</h3>
          <p className="text-sm text-muted-foreground mt-1">Click your avatar to upload a new image</p>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="mt-4 flex w-full justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
