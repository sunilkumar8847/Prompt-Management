//ProjectDetails.tsx
import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

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
  // Initialize prompt state from localStorage
  const [prompt, setPrompt] = useState<Prompt | null>(() => {
    const storedPrompt = localStorage.getItem(`project_${project.id}_prompt`);
    return storedPrompt ? JSON.parse(storedPrompt) : null;
  });

  const [promptName, setPromptName] = useState('');
  const [promptDescription, setPromptDescription] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(50);
  const [isEditing, setIsEditing] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleCreateOrUpdatePrompt = () => {
    if (promptName.trim()) {
      const newPrompt: Prompt = {
        id: prompt?.id || Date.now().toString(),
        name: promptName,
        description: promptDescription,
        confidenceScore: confidenceScore
      };

      localStorage.setItem(`project_${project.id}_prompt`, JSON.stringify(newPrompt));
      setPrompt(newPrompt);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    localStorage.removeItem(`project_${project.id}_prompt`);
    setPrompt(null);
    setPromptName('');
    setPromptDescription('');
    setConfidenceScore(50);
  };

  const handleEdit = () => {
    if (prompt) {
      setPromptName(prompt.name);
      setPromptDescription(prompt.description);
      setConfidenceScore(prompt.confidenceScore);
      setIsEditing(true);
    }
  };

  useEffect(() => {
    if (prompt) {
      setPromptName(prompt.name);
      setPromptDescription(prompt.description);
      setConfidenceScore(prompt.confidenceScore);
    }
  }, [prompt]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
        >
          <IoIosArrowBack className="w-5 h-5" />
          <span>Back to Projects</span>
        </button>

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
              <button
                onClick={handleEdit}
                className="p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
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
                    <h3 className="text-lg font-semibold mb-1">Prompt {1}: {prompt.name}</h3>
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
                )}
                <Button
                  onClick={handleCreateOrUpdatePrompt}
                  disabled={!promptName.trim()}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {isEditing ? 'Update Prompt' : 'Create Prompt'}
                </Button>
              </div>
            </div>
          )}

          {/* Credentials Button - Only shown when prompt exists and not in editing mode */}
          {prompt && !isEditing && (
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-2"
                onClick={() => setShowCredentials(true)}
              >
                <Eye className="w-4 h-4" />
                <span>Credentials</span>
              </Button>
            </div>
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
    </div>
  );
};

export default ProjectDetail;