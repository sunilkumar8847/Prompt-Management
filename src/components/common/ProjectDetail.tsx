//ProjectDetail.tsx
import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { Plus, Eye, EyeOff, X, History } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import Loading from './Loading';
import { toast } from '../../hooks/use-toast';
import { promptApi, projectApi } from '../../Api/apiClient';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';
import NewPrompt, { Prompt } from './NewPrompt';
import PromptHistory from './PromptHistory';

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
  // --- Prompt States ---
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [promptFormData, setPromptFormData] = useState({
    name: '',
    description: '',
    confidenceScore: 50
  });

  // --- Credential States ---
  const [credentialsMap, setCredentialsMap] = useState<Record<string, PromptCredentials>>({});
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  // --- Project Edit States ---
  const [isProjectEditing, setIsProjectEditing] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState(project.name);
  const [editedProjectDescription, setEditedProjectDescription] = useState(project.description);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- Prompt History States ---
  const [showHistory, setShowHistory] = useState(false);
  const [promptToShowHistory, setPromptToShowHistory] = useState<string | null>(null);

  // --- Load all prompts for the project ---
  const loadPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await promptApi.getAllPrompts(project.id);
      if (response.status === 200) {
        const fetchedPrompts: Prompt[] = response.data.map((item: any) => ({
          id: item.id,
          name: item.prompt_name,
          description: item.description,
          confidenceScore: item.confidence_score
        }));
        setPrompts(fetchedPrompts);
      }
    } catch (error: any) {
      console.error("Error loading prompts:", error);
      if (error?.response?.status === 404) {
        setPrompts([]);
        return;
      }
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch prompts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, [project.id]);

  // --- Load credentials for the selected prompt ---
  const loadCredentials = async (promptId: string) => {
    if (!promptId) return;

    setIsCredentialsLoading(true);
    try {
      const response = await promptApi.getPromptDetails(promptId);
      if (response.status === 200) {
        setCredentialsMap(prev => ({
          ...prev,
          [promptId]: {
            project_id: response.data.project_id,
            prompt_id: response.data.prompt_id,
            secret_key: response.data.secret_key
          }
        }));
      }
    } catch (error: any) {
      console.error("Error loading credentials:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch credentials",
        variant: "destructive"
      });
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  useEffect(() => {
    if (showCredentials && selectedPromptId && !credentialsMap[selectedPromptId]) {
      loadCredentials(selectedPromptId);
    }
  }, [showCredentials, selectedPromptId]);

  // --- Project Handlers (delete, update) ---
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProject = async () => {
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
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete project",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

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
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update project",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Prompt Handlers ---
  const deletePromptHandler = async (promptId: string) => {
    setIsLoading(true);
    try {
      const response = await promptApi.deletePrompt(promptId);
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Prompt deleted successfully",
          variant: "default",
        });
        setPrompts(prompts.filter(p => p.id !== promptId));
        if (selectedPromptId === promptId) {
          setSelectedPromptId(null);
        }
      }
    } catch (error: any) {
      console.error("Error deleting prompt:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete prompt",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const editPromptHandler = (promptItem: Prompt) => {
    setSelectedPromptId(promptItem.id);
    setPromptFormData({
      name: promptItem.name,
      description: promptItem.description,
      confidenceScore: promptItem.confidenceScore
    });
    setShowPromptDialog(true);
  };

  const addNewPromptHandler = () => {
    setSelectedPromptId(null);
    setPromptFormData({
      name: '',
      description: '',
      confidenceScore: 50
    });
    setShowPromptDialog(true);
  };

  const handlePromptCreated = (newPrompt: Prompt) => {
    setPrompts([...prompts, newPrompt]);
    // Immediately load credentials for the new prompt
    if (newPrompt.id) {
      loadCredentials(newPrompt.id);
    }
  };

  const handlePromptUpdated = (updatedPrompt: Prompt) => {
    setPrompts(prompts.map(p => 
      p.id === updatedPrompt.id ? updatedPrompt : p
    ));
  };

  // --- Prompt History Handlers ---
  const showPromptHistory = (promptId: string) => {
    setPromptToShowHistory(promptId);
    setShowHistory(true);
  };

  const handlePromptReverted = () => {
    // Refresh prompts list after a revert operation
    loadPrompts();
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
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
                {/* Project Header */}
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
                          onClick={handleDeleteClick}
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
                    {/* Add Delete Confirmation Dialog */}
                    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                      <AlertDialogContent className="sm:max-w-[425px]">
                        <AlertDialogHeader>
                          <div className="flex justify-between items-center">
                            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                              Delete Project
                            </AlertDialogTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 hover:bg-gray-300 rounded-full"
                              onClick={() => setShowDeleteConfirm(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <AlertDialogDescription className="mt-8 text-sm text-gray-500">
                            Are you sure you want to delete this project? This action cannot be undone and all associated data will be permanently lost.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6">
                          <AlertDialogCancel
                            className="bg-gray-200 hover:bg-gray-500 text-gray-900"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={confirmDeleteProject}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
                  <p className="text-gray-700">{project.description}</p>
                </div>

                {/* Prompts Section Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-lg font-semibold">Prompts</h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={addNewPromptHandler}
                          className="flex items-center gap-2 px-4 h-9 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Prompt</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add new prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Render prompt cards */}
                  {prompts.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-500">No prompts found. Create your first prompt!</p>
                    </div>
                  ) : (
                    prompts.map((promptItem, index) => (
                      <div key={promptItem.id} className="border rounded-lg p-4 mb-4 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              Prompt {index + 1}: {promptItem.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Confidence Score:</span>
                              <span className="text-sm font-semibold text-indigo-600">
                                {promptItem.confidenceScore}%
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => showPromptHistory(promptItem.id)}
                                  className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors duration-200"
                                >
                                  <History className="w-5 h-5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View prompt history</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => editPromptHandler(promptItem)}
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
                                  onClick={() => deletePromptHandler(promptItem.id)}
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
                          <p className="text-gray-700">{promptItem.description}</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-2"
                                onClick={() => {
                                  setSelectedPromptId(promptItem.id);
                                  setShowCredentials(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                                <span>Credentials</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View credentials</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Use the NewPrompt component */}
            <NewPrompt
              projectId={project.id}
              isOpen={showPromptDialog}
              onClose={() => setShowPromptDialog(false)}
              selectedPromptId={selectedPromptId}
              initialPromptData={promptFormData}
              onPromptCreated={handlePromptCreated}
              onPromptUpdated={handlePromptUpdated}
            />

            {/* Use the PromptHistory component */}
            <PromptHistory
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
              promptId={promptToShowHistory}
              onPromptReverted={handlePromptReverted}
            />

            {/* Credentials Modal */}
            <Dialog open={showCredentials} onOpenChange={(open) => {
              setShowCredentials(open);
              if (!open) {
                setShowSecret(false);
              }
            }}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-semibold text-indigo-600">
                    Credentials
                  </DialogTitle>
                </DialogHeader>
                {isCredentialsLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Project ID:</label>
                      <Input
                        value={selectedPromptId && credentialsMap[selectedPromptId] ? credentialsMap[selectedPromptId].project_id : project.id}
                        readOnly
                        className="bg-gray-50"
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Prompt ID:</label>
                      <Input
                        value={selectedPromptId && credentialsMap[selectedPromptId] ? credentialsMap[selectedPromptId].prompt_id : ""}
                        readOnly
                        className="bg-gray-50"
                        onFocus={(e) => e.target.select()}
                      />
                     </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Secret Key:</label>
                      <div className="relative">
                        <Input
                          type={showSecret ? "text" : "password"}
                          value={selectedPromptId && credentialsMap[selectedPromptId] ? credentialsMap[selectedPromptId].secret_key : ""}
                          readOnly
                          className="bg-gray-50 pr-10"
                          onFocus={(e) => e.target.select()}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret((prev) => !prev)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                        >
                          {showSecret ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (selectedPromptId && credentialsMap[selectedPromptId]?.secret_key) {
                            navigator.clipboard.writeText(credentialsMap[selectedPromptId].secret_key);
                            toast({
                              title: "Success",
                              description: "Secret key copied to clipboard",
                              variant: "default",
                            });
                          }
                        }}
                        className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                      >
                        Copy Secret Key
                      </Button>
                      <Button
                        onClick={() => setShowCredentials(false)}
                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Close
                      </Button>
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