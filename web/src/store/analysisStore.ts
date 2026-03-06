import { create } from 'zustand';

interface AnalysisState {
    selectedImage: File | null;
    previewUrl: string | null;
    analysisResult: {
        totalMinutes: number;
        apps: { name: string; minutes: number }[];
        advice: string;
    } | null;
    setSelectedImage: (file: File | null, url: string | null) => void;
    setAnalysisResult: (result: any | null) => void;
    clearAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
    selectedImage: null,
    previewUrl: null,
    analysisResult: null,
    setSelectedImage: (file, url) => set({ selectedImage: file, previewUrl: url }),
    setAnalysisResult: (result) => set({ analysisResult: result }),
    clearAnalysis: () => set({ selectedImage: null, previewUrl: null, analysisResult: null }),
}));
