//NewPrompt.tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from '../../hooks/use-toast';
import { promptApi } from '../../Api/apiClient';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

export interface Prompt {
  id: string;
  name: string;
  description: string;
  confidenceScore: number;
}

interface NewPromptProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  selectedPromptId: string | null;
  onPromptCreated: (prompt: Prompt) => void;
  onPromptUpdated: (prompt: Prompt) => void;
  initialPromptData?: {
    name: string;
    description: string;
    confidenceScore: number;
  };
}

const NewPrompt: React.FC<NewPromptProps> = ({
  projectId,
  isOpen,
  onClose,
  selectedPromptId,
  onPromptCreated,
  onPromptUpdated,
  initialPromptData = { name: '', description: '', confidenceScore: 50 }
}) => {
  const [promptName, setPromptName] = React.useState(initialPromptData.name);
  const [promptDescription, setPromptDescription] = React.useState(initialPromptData.description);
  const [confidenceScore, setConfidenceScore] = React.useState(initialPromptData.confidenceScore);
  const [isLoading, setIsLoading] = React.useState(false);

  // Update form when initialPromptData changes
  useEffect(() => {
    if (isOpen) {
      setPromptName(initialPromptData.name);
      setPromptDescription(initialPromptData.description);
      setConfidenceScore(initialPromptData.confidenceScore);
    }
  }, [isOpen, initialPromptData]);

  const clearForm = () => {
    setPromptName('');
    setPromptDescription('');
    setConfidenceScore(50);
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleSave = async () => {
    if (!promptName.trim()) {
      toast({
        title: "Error",
        description: "Prompt name is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      if (selectedPromptId) {
        // Update existing prompt
        const response = await promptApi.updatePrompt(selectedPromptId, {
          name: promptName,
          prompt: promptName, // Using the same value for both name and prompt
          description: promptDescription,
          confidence_score: confidenceScore
        });
        
        if (response.status === 200) {
          toast({
            title: "Success",
            description: "Prompt updated successfully",
            variant: "default",
          });
          
          onPromptUpdated({
            id: selectedPromptId,
            name: promptName,
            description: promptDescription,
            confidenceScore: confidenceScore
          });
          
          handleClose();
        }
      } else {
        // Create new prompt - Make sure field names match backend expectations
        const newPromptData = {
          name: promptName,
          prompt: promptName, // Using the same value for both name and prompt
          description: promptDescription,
          confidence_score: confidenceScore
        };
        
        const response = await promptApi.createPrompt(projectId, newPromptData);
        
        if (response.status === 200 || response.status === 201) {
          toast({
            title: "Success",
            description: "Prompt created successfully",
            variant: "default",
          });
          
          // Get the prompt ID from the response if available
          let promptId = '';
          if (response.data && response.data.id) {
            promptId = response.data.id;
          } else {
            // If the backend doesn't return an ID, we need to fetch the prompts to get the ID
            try {
              const promptsResponse = await promptApi.getAllPrompts(projectId);
              if (promptsResponse.status === 200) {
                const prompts = promptsResponse.data;
                // Find the newly created prompt (likely the last one)
                const newPrompt = prompts.find((p: any) => 
                  p.prompt_name === promptName && 
                  p.description === promptDescription
                );
                if (newPrompt) {
                  promptId = newPrompt.id;
                }
              }
            } catch (error) {
              console.error("Error fetching prompts after creation:", error);
            }
          }
          
          onPromptCreated({
            id: promptId || Date.now().toString(), // Fallback ID if API doesn't return one
            name: promptName,
            description: promptDescription,
            confidenceScore: confidenceScore
          });
          
          handleClose();
        }
      }
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast({
        title: "Error",
        description: `Failed to ${selectedPromptId ? 'update' : 'create'} prompt`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-indigo-600">
            {selectedPromptId ? 'Edit Prompt' : 'Create New Prompt'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Prompt Name</label>
            <Input
              value={promptName}
              onChange={(e) => setPromptName(e.target.value)}
              placeholder="Enter prompt name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={promptDescription}
              onChange={(e) => setPromptDescription(e.target.value)}
              placeholder="Enter prompt description"
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confidence Score</label>
            <div className="flex items-center space-x-4">
              <Slider
                value={[confidenceScore]}
                onValueChange={(value) => setConfidenceScore(value[0])}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 w-12 text-right">
                {confidenceScore}%
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSave}
                disabled={!promptName.trim() || isLoading}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {isLoading ? 'Processing...' : selectedPromptId ? 'Update Prompt' : 'Create Prompt'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{selectedPromptId ? 'Update prompt' : 'Create prompt'}</p>
            </TooltipContent>
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewPrompt;