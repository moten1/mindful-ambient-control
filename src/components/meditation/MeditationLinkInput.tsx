
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  videoLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  audioLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

interface MeditationLinkInputProps {
  onLinkSubmit: (videoLink: string | undefined, audioLink: string | undefined) => void;
}

const MeditationLinkInput: React.FC<MeditationLinkInputProps> = ({ onLinkSubmit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoLink: '',
      audioLink: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onLinkSubmit(
      values.videoLink || undefined,
      values.audioLink || undefined
    );
    
    setIsExpanded(false);
    toast({
      title: "Links updated",
      description: "Your custom meditation media has been set",
    });
  }

  return (
    <div className="mb-4">
      {!isExpanded ? (
        <Button 
          variant="outline" 
          className="w-full border-dashed border-[#2E9E83] text-[#7CE0C6] hover:bg-[#1d4230]"
          onClick={() => setIsExpanded(true)}
        >
          + Add custom video/audio links
        </Button>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-[#0A1A14] p-4 rounded-md">
            <FormField
              control={form.control}
              name="videoLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#7CE0C6]">Video Link (YouTube or direct video link)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://www.youtube.com/watch?v=7EJKDj6ELiM" 
                      {...field} 
                      className="bg-[#132920] border-[#2E9E83] text-white"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400 text-xs">
                    YouTube links will be embedded with protection against downloading
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="audioLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#7CE0C6]">Audio Link (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/audio.mp3" 
                      {...field} 
                      className="bg-[#132920] border-[#2E9E83] text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                className="text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#2E9E83] hover:bg-[#39BF9D]"
              >
                Apply
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default MeditationLinkInput;

