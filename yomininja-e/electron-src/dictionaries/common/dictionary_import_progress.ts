

export type DictionaryImportProgress = {
    status: 'importing' | 'completed' | 'failed';
    progress: number;
    error?: string;
};

export type DictionaryImportProgressCallBack = ( input: DictionaryImportProgress ) => void;