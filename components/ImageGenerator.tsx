
import React, { useState } from 'react';
import { generateRewardImage } from '../services/geminiService';
import { Wand2, Image as ImageIcon } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setImageUrl(null);
    const result = await generateRewardImage(prompt, size);
    setImageUrl(result);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-soft-lg border-4 border-white p-8 md:p-12 max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-scandi-honey/10 rounded-bl-[100%]"></div>
      
      <div className="text-center mb-10 relative z-10">
        <div className="w-16 h-16 bg-scandi-cream rounded-2xl mx-auto flex items-center justify-center text-scandi-moss mb-4 shadow-sm border border-scandi-oat">
           <Wand2 size={32} />
        </div>
        <h3 className="text-3xl font-kids font-bold text-scandi-chocolate">Magic Sticker Maker</h3>
        <p className="text-scandi-stone mt-2 font-medium">What should I draw for you today?</p>
      </div>

      <div className="space-y-8 relative z-10">
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cat riding a skateboard in space..."
            className="w-full p-6 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-3xl outline-none transition text-xl font-kids text-scandi-chocolate resize-none placeholder:text-scandi-sand h-40"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-scandi-stone mb-3 uppercase tracking-wider text-center">Size</label>
          <div className="flex gap-4 justify-center">
            {(['1K', '2K', '4K'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-20 py-3 rounded-2xl font-bold transition-all border-2 ${
                  size === s 
                    ? 'bg-scandi-honey text-white border-scandi-honey shadow-toy active:translate-y-[2px] active:shadow-none' 
                    : 'bg-white border-scandi-oat text-scandi-stone hover:border-scandi-sand'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full py-5 bg-scandi-moss text-white rounded-full font-bold flex items-center justify-center gap-3 shadow-toy hover:bg-opacity-90 transition active:shadow-toy-active active:translate-y-[4px] disabled:opacity-50 disabled:shadow-none text-xl"
        >
          {loading ? <LoadingSpinner size="sm" color="white" /> : <ImageIcon className="w-6 h-6" />}
          Create Magic
        </button>

        {imageUrl && (
          <div className="mt-12 animate-fade-in flex justify-center">
            <div className="p-4 bg-white rounded-[2rem] shadow-soft-lg border border-scandi-oat rotate-2 transition hover:rotate-0">
              <img src={imageUrl} alt="Generated Reward" className="rounded-[1.5rem] max-h-80 object-contain bg-scandi-cream" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;