'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ToastTestPage() {
  const testToasts = () => {
    // Test different toast types
    toast.success('Success toast!', {
      description: 'This is a success message.',
    });

    toast.error('Error toast!', {
      description: 'This is an error message.',
    });

    toast.info('Info toast!', {
      description: 'This is an info message.',
    });

    toast.warning('Warning toast!', {
      description: 'This is a warning message.',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Toast Test Page
          </h1>
          <p className="text-slate-600 mb-6">
            Click the button below to test different toast notifications.
          </p>
        </div>

        <Button
          onClick={testToasts}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Test All Toast Types
        </Button>

        <div className="text-center text-sm text-slate-500">
          <p>Check the top-right corner for toast notifications.</p>
        </div>
      </div>
    </div>
  );
} 