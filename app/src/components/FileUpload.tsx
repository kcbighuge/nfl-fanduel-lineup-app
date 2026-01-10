import React, { useCallback } from 'react';
import type { Player } from '../types';
import { parsePlayerCSV } from '../utils/csvParser';
import { analyzePlayerNews } from '../utils/newsAnalyzer';

interface Props {
    onPlayersLoaded: (players: Player[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export const FileUpload: React.FC<Props> = ({ onPlayersLoaded, isLoading, setIsLoading }) => {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const processFile = useCallback(async (file: File) => {
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const text = await file.text();
            const players = parsePlayerCSV(text);

            if (players.length === 0) {
                setError('No valid players found in the CSV file');
                setIsLoading(false);
                return;
            }

            // Simulate news analysis delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            const playersWithNews = analyzePlayerNews(players);

            onPlayersLoaded(playersWithNews);
        } catch (err) {
            setError(`Error parsing CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [onPlayersLoaded, setIsLoading]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="file-upload-container">
            <div
                className={`file-upload-zone ${isDragOver ? 'drag-over' : ''} ${isLoading ? 'loading' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="file-input-hidden"
                />

                {isLoading ? (
                    <div className="upload-loading">
                        <div className="spinner"></div>
                        <span>Analyzing players & fetching news...</span>
                    </div>
                ) : (
                    <>
                        <div className="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17,8 12,3 7,8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <h3>Upload FanDuel Player Export</h3>
                        <p>Drag and drop your CSV file here, or click to browse</p>
                        <span className="upload-hint">
                            Download from FanDuel → Contest Lobby → "Download Players List"
                        </span>
                    </>
                )}
            </div>

            {error && (
                <div className="upload-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};
