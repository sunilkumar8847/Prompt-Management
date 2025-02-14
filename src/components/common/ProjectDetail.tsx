import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Loading from './Loading';
import { toast } from '../../hooks/use-toast';
import { promptApi } from '../../Api/apiClient';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';

export interface Prompt {
  id: string;
  name: string;
  description: string;
  confidenceScore: number;
}

interface ProjectDetailProps {
  project: {
    id: string;
    name: string;
    description: string;
  };
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  // Remove localStorage usage – initialize prompt as null.
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [promptName, setPromptName] = useState('');
  const [promptDescription, setPromptDescription] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(50);
  const [isEditing, setIsEditing] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  // Fetch existing prompt (if any) from backend on mount
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await promptApi.getAllPrompts(project.id);
        if (response.status === 200 && response.data.length > 0) {
          const fetchedPrompt = response.data[0];
          setPrompt({
            id: fetchedPrompt.id,
            name: fetchedPrompt.prompt_name,
            description: fetchedPrompt.description,
            confidenceScore: fetchedPrompt.confidence_score
          });
        }
      } catch (error: any) {
        // If error status is 404, it means no prompt exists – do nothing.
        if (error?.response?.status === 404) {
          return;
        }
        toast({
          title: "Error",
          description: "Failed to fetch prompt",
          variant: "destructive"
        });
      }
    };
    fetchPrompt();
  }, [project.id]);

  const handleCreateOrUpdatePrompt = async () => {
    setLoading(true);
    try {
      if (isEditing && prompt) {
        // Update existing prompt
        const response = await promptApi.updatePrompt(prompt.id, {
          name: promptName,
          prompt: promptName, // Assuming prompt text is same as name; adjust if needed.
          description: promptDescription,
          confidence_score: confidenceScore
        });
        if (response.status === 200) {
          toast({
            title: "Success",
            description: "Prompt updated successfully",
            variant: "default",
          });
          setPrompt({
            id: prompt.id,
            name: promptName,
            description: promptDescription,
            confidenceScore: confidenceScore
          });
          setIsEditing(false);
        }
      } else {
        // Create a new prompt
        const newPromptData = {
          prompt_name: promptName,
          prompt: promptName,
          description: promptDescription,
          confidence_score: confidenceScore
        };
        const response = await promptApi.createPrompt(project.id, newPromptData);
        if (response.status === 200 || response.status === 201) {
          toast({
            title: "Success",
            description: "Prompt created successfully",
            variant: "default",
          });
          setPrompt({
            id: response.data.id,
            name: promptName,
            description: promptDescription,
            confidenceScore: confidenceScore
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await promptApi.deletePrompt(prompt.id);
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Prompt deleted successfully",
          variant: "default",
        });
        setPrompt(null);
        setPromptName('');
        setPromptDescription('');
        setConfidenceScore(50);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (prompt) {
      setPromptName(prompt.name);
      setPromptDescription(prompt.description);
      setConfidenceScore(prompt.confidenceScore);
      setIsEditing(true);
    }
  };

  // Update input fields when prompt state changes
  useEffect(() => {
    if (prompt) {
      setPromptName(prompt.name);
      setPromptDescription(prompt.description);
      setConfidenceScore(prompt.confidenceScore);
    }
  }, [prompt]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        {loading ? (
          <Loading />
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
                >
                  <IoIosArrowBack className="w-5 h-5" />
                  <span>Back to Projects</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to Projects</p>
              </TooltipContent>
            </Tooltip>
  
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold">Project: {project.name}</h1>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleEdit}
                          className="p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit prompt</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleDelete}
                          className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
  
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
                  <p className="text-gray-700">{project.description}</p>
                </div>
  
                {prompt && !isEditing && (
                  <div className="bg-white rounded-lg">
                    <div className="border rounded-lg p-4 mb-4 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">Prompt 1: {prompt.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Confidence Score:</span>
                            <span className="text-sm font-semibold text-indigo-600">{prompt.confidenceScore}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                        <p className="text-gray-700">{prompt.description}</p>
                      </div>
                    </div>
                  </div>
                )}
  
                {(!prompt || isEditing) && (
                  <div className="border rounded-lg p-4 shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Prompt Name
                        </label>
                        <Input
                          value={promptName}
                          onChange={(e) => setPromptName(e.target.value)}
                          placeholder="Enter prompt name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Description
                        </label>
                        <Textarea
                          value={promptDescription}
                          onChange={(e) => setPromptDescription(e.target.value)}
                          placeholder="Enter prompt description"
                          className="min-h-[100px]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Confidence Score
                        </label>
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
                    <div className="mt-6 flex justify-end space-x-2">
                      {isEditing && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false);
                                if (prompt) {
                                  setPromptName(prompt.name);
                                  setPromptDescription(prompt.description);
                                  setConfidenceScore(prompt.confidenceScore);
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cancel editing</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleCreateOrUpdatePrompt}
                            disabled={!promptName.trim()}
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            {isEditing ? 'Update Prompt' : 'Create Prompt'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isEditing ? 'Update prompt' : 'Create prompt'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}
  
  {prompt && !isEditing && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex justify-end mt-6"
                    onClick={() => setShowCredentials(true)}
                  >
                    <Button
                      variant="outline"
                      className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Credentials</span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View credentials</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Credentials Modal */}
        <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold text-indigo-600">
                Credentials
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Project ID:</label>
                <Input value="IOJDS90I29IQK" readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Prompt ID:</label>
                <Input value="U38DHHDJ992" readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Secret Key:</label>
                <div className="relative">
                  <Input
                    type="text"
                    value="PROMPT392919MANAGEMENT932"
                    readOnly
                    className="bg-gray-50 pr-10"
                  />
                  <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )}
  </div>
</TooltipProvider>
  );
};

export default ProjectDetail;