import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Loading from './Loading';
import { toast } from '../../hooks/use-toast';
import { promptApi, projectApi } from '../../Api/apiClient';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';

export interface Prompt {
  id: string;
  name: string;
  description: string;
  confidenceScore: number;
}

interface PromptCredentials {
  project_id: string;
  prompt_id: string;
  secret_key: string;
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
  // Prompt states
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editedPromptName, setEditedPromptName] = useState('');
  const [editedPromptDescription, setEditedPromptDescription] = useState('');
  const [editedConfidenceScore, setEditedConfidenceScore] = useState(50);
  const [isPromptEditing, setIsPromptEditing] = useState(false);

  // Credential states
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<PromptCredentials | null>(null);
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Project edit states
  const [isProjectEditing, setIsProjectEditing] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState(project.name);
  const [editedProjectDescription, setEditedProjectDescription] = useState(project.description);

  // Load prompt from backend on mount
  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const response = await promptApi.getAllPrompts(project.id);
        if (response.status === 200 && response.data.length > 0) {
          const fetchedPrompt = response.data[0];
          setCurrentPrompt({
            id: fetchedPrompt.id,
            name: fetchedPrompt.prompt_name,
            description: fetchedPrompt.description,
            confidenceScore: fetchedPrompt.confidence_score
          });
        }
      } catch (error: any) {
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
    loadPrompt();
  }, [project.id]);

  // Load credentials when credential modal opens
  const loadCredentials = async () => {
    if (!currentPrompt) return;
    setIsCredentialsLoading(true);
    try {
      const response = await promptApi.getPromptDetails(currentPrompt.id);
      if (response.status === 200) {
        setCredentials({
          project_id: response.data.project_id,
          prompt_id: response.data.prompt_id,
          secret_key: response.data.secret_key
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch credentials",
        variant: "destructive"
      });
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  useEffect(() => {
    if (showCredentials && !credentials && currentPrompt) {
      loadCredentials();
    }
  }, [showCredentials, credentials, currentPrompt]);

  // Handle project deletion
  const deleteProjectHandler = async () => {
    setIsLoading(true);
    try {
      const response = await projectApi.deleteProject(project.id);
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Project deleted successfully",
          variant: "default",
        });
        onBack();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle project update
  const updateProjectHandler = async () => {
    setIsLoading(true);
    try {
      const response = await projectApi.updateProject(project.id, {
        name: editedProjectName,
        description: editedProjectDescription
      });
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Project updated successfully",
          variant: "default",
        });
        setIsProjectEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle prompt create/update
  const savePromptHandler = async () => {
    setIsLoading(true);
    try {
      if (isPromptEditing && currentPrompt) {
        // Update prompt
        const response = await promptApi.updatePrompt(currentPrompt.id, {
          name: editedPromptName,
          prompt: editedPromptName,
          description: editedPromptDescription,
          confidence_score: editedConfidenceScore
        });
        if (response.status === 200) {
          toast({
            title: "Success",
            description: "Prompt updated successfully",
            variant: "default",
          });
          setCurrentPrompt({
            id: currentPrompt.id,
            name: editedPromptName,
            description: editedPromptDescription,
            confidenceScore: editedConfidenceScore
          });
          setIsPromptEditing(false);
        }
      } else {
        // Create new prompt
        const newPromptData = {
          prompt_name: editedPromptName,
          prompt: editedPromptName,
          description: editedPromptDescription,
          confidence_score: editedConfidenceScore
        };
        const response = await promptApi.createPrompt(project.id, newPromptData);
        if (response.status === 200 || response.status === 201) {
          toast({
            title: "Success",
            description: "Prompt created successfully",
            variant: "default",
          });
          setCurrentPrompt({
            id: response.data.id,
            name: editedPromptName,
            description: editedPromptDescription,
            confidenceScore: editedConfidenceScore
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
      setIsLoading(false);
    }
  };

  // Handle prompt deletion
  const deletePromptHandler = async () => {
    if (!currentPrompt) return;
    setIsLoading(true);
    try {
      const response = await promptApi.deletePrompt(currentPrompt.id);
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Prompt deleted successfully",
          variant: "default",
        });
        setCurrentPrompt(null);
        setEditedPromptName('');
        setEditedPromptDescription('');
        setEditedConfidenceScore(50);
        setCredentials(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing prompt
  const editPromptHandler = () => {
    if (currentPrompt) {
      setEditedPromptName(currentPrompt.name);
      setEditedPromptDescription(currentPrompt.description);
      setEditedConfidenceScore(currentPrompt.confidenceScore);
      setIsPromptEditing(true);
    }
  };

  // Sync prompt state with edit fields when prompt changes
  useEffect(() => {
    if (currentPrompt) {
      setEditedPromptName(currentPrompt.name);
      setEditedPromptDescription(currentPrompt.description);
      setEditedConfidenceScore(currentPrompt.confidenceScore);
    }
  }, [currentPrompt]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="max-w-4xl mx-auto">
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

              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      {isProjectEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editedProjectName}
                            onChange={(e) => setEditedProjectName(e.target.value)}
                            className="text-xl font-semibold"
                            placeholder="Project name"
                          />
                          <Textarea
                            value={editedProjectDescription}
                            onChange={(e) => setEditedProjectDescription(e.target.value)}
                            placeholder="Project description"
                            className="mt-2"
                          />
                          <div className="flex space-x-2 mt-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsProjectEditing(false);
                                    setEditedProjectName(project.name);
                                    setEditedProjectDescription(project.description);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Cancel editing project</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={updateProjectHandler}
                                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                  Save Changes
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Save project changes</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ) : (
                        <h1 className="text-xl font-semibold">Project: {project.name}</h1>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsProjectEditing(true)}
                          className="p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Project</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={deleteProjectHandler}
                          className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Project</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
                  <p className="text-gray-700">{project.description}</p>
                </div>

                {currentPrompt && !isPromptEditing && (
                  <div className="bg-white rounded-lg">
                    <div className="border rounded-lg p-4 mb-4 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">Prompt 1: {currentPrompt.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Confidence Score:</span>
                            <span className="text-sm font-semibold text-indigo-600">{currentPrompt.confidenceScore}%</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={editPromptHandler}
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
                                onClick={deletePromptHandler}
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
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                        <p className="text-gray-700">{currentPrompt.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(!currentPrompt || isPromptEditing) && (
                  <div className="border rounded-lg p-4 shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Prompt Name
                        </label>
                        <Input
                          value={editedPromptName}
                          onChange={(e) => setEditedPromptName(e.target.value)}
                          placeholder="Enter prompt name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Description
                        </label>
                        <Textarea
                          value={editedPromptDescription}
                          onChange={(e) => setEditedPromptDescription(e.target.value)}
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
                            value={[editedConfidenceScore]}
                            onValueChange={(value) => setEditedConfidenceScore(value[0])}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {editedConfidenceScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-2">
                      {isPromptEditing && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsPromptEditing(false);
                                if (currentPrompt) {
                                  setEditedPromptName(currentPrompt.name);
                                  setEditedPromptDescription(currentPrompt.description);
                                  setEditedConfidenceScore(currentPrompt.confidenceScore);
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
                            onClick={savePromptHandler}
                            disabled={!editedPromptName.trim()}
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            {isPromptEditing ? 'Update Prompt' : 'Create Prompt'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isPromptEditing ? 'Update prompt' : 'Create prompt'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}

                {currentPrompt && !isPromptEditing && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex justify-end mt-6 cursor-pointer"
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
                {isCredentialsLoading ? (
                  <div className="py-8 flex justify-center">
                    <Loading />
                  </div>
                ) : (
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Project ID:</label>
                      <Input
                        value={credentials?.project_id || project.id}
                        readOnly
                        className="bg-gray-50"
                        onFocus={(e) => e.target.blur()} // Prevent auto-selection
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Prompt ID:</label>
                      <Input
                        value={credentials?.prompt_id || currentPrompt?.id || ""}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Secret Key:</label>
                      <div className="relative">
                        <Input
                          type={showSecret ? "text" : "password"}
                          value={credentials?.secret_key || ""}
                          readOnly
                          className="bg-gray-50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret((prev) => !prev)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          aria-label="Toggle secret key visibility"
                        >
                          {showSecret ? (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ProjectDetail;
