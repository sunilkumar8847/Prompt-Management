//PromptHistory.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from '../ui/button';
import { toast } from '../../hooks/use-toast';
import { promptApi } from '../../Api/apiClient';

interface PromptVersion {
  version_id: string;
  prompt_id: string;
  name: string;
  prompt: string;
  description: string;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

interface PromptHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  promptId: string | null;
  onPromptReverted: (promptData?: PromptVersion) => void; // Modified to include the reverted prompt data
}

const PromptHistory: React.FC<PromptHistoryProps> = ({ 
  isOpen, 
  onClose, 
  promptId,
  onPromptReverted
}) => {
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [revertingVersionId, setRevertingVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && promptId) {
      loadPromptVersions();
    }
  }, [isOpen, promptId]);

  const loadPromptVersions = async () => {
    if (!promptId) return;
  
    setIsLoading(true);
    try {
      const response = await promptApi.getPromptVersions(promptId);
      if (response.status === 200) {
        // Sort versions by updated_at in descending order
        const sortedVersions = response.data.sort(
          (a: PromptVersion, b: PromptVersion) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setPromptVersions(sortedVersions);
      }
    } catch (error: any) {
      console.error("Error fetching prompt versions:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch prompt history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentVersionId = promptVersions.length > 0 
    ? promptVersions[0].version_id 
    : null;

  const revertToVersion = async (versionId: string) => {
    if (!promptId || revertingVersionId === versionId) return;
    
    setRevertingVersionId(versionId);
    setIsLoading(true);
    try {
      const response = await promptApi.revertPrompt(promptId, versionId);
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Prompt reverted successfully",
          variant: "default",
        });
        
        // Find the version that was reverted to
        const revertedVersion = promptVersions.find(v => v.version_id === versionId);
        
        // Notify parent component with the reverted version data
        onPromptReverted(revertedVersion);
        
        // Close the history dialog
        onClose();
      }
    } catch (error: any) {
      console.error("Error reverting prompt:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to revert prompt",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setRevertingVersionId(null);
    }
  };

  const handleClose = () => {
    setPromptVersions([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-indigo-600">
            Prompt History
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
            {promptVersions.length === 0 ? (
              <p className="text-center text-gray-500">No version history found for this prompt.</p>
            ) : (
              <div className="space-y-4">
                {promptVersions.map((version) => (
                  <div 
                    key={version.version_id} 
                    className={`border rounded-lg p-4 ${version.version_id === currentVersionId ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {version.name} {version.version_id === currentVersionId && <span className="text-blue-600 text-sm">(Current)</span>}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(version.created_at).toLocaleString()}
                        </p>
                      </div>
                      {version.version_id !== currentVersionId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          onClick={() => revertToVersion(version.version_id)}
                          disabled={revertingVersionId === version.version_id}
                        >
                          {revertingVersionId === version.version_id ? 'Reverting...' : 'Revert to this version'}
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 space-y-2">
                      <div>
                        <h4 className="text-xs font-medium text-gray-500">Description:</h4>
                        <p className="text-sm text-gray-700">{version.description}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-500">Confidence Score:</h4>
                        <p className="text-sm text-gray-700">{version.confidence_score}%</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-500">Prompt Content:</h4>
                        <div className="text-sm text-gray-700 p-2 bg-gray-50 rounded border mt-1 max-h-24 overflow-y-auto">
                          {version.prompt}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button
            onClick={handleClose}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptHistory;