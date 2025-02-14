import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { projectApi } from '../../Api/apiClient';
import { toast } from '../../hooks/use-toast';
import Loading from './Loading';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

interface NewProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

const NewProject: React.FC<NewProjectProps> = ({ isOpen, onClose, onCreateProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name and description are required",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const response = await projectApi.createProject({
        project_name: formData.name,
        description: formData.description
      });
      
      const newProject: Project = {
        id: response.data.id,
        name: formData.name,
        description: formData.description,
        createdAt: new Date()
      };
      
      toast({
        title: "Success",
        description: `Project "${formData.name}" created successfully`,
        variant: "default"
      });
      
      onCreateProject(newProject);
      setFormData({ name: '', description: '' });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          {loading && <Loading />}
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 cursor-help">
                    Project Name
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter a unique name for your project</p>
                </TooltipContent>
              </Tooltip>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <label htmlFor="description" className="text-sm font-medium text-gray-700 cursor-help">
                    Project Description
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Provide details about your project's purpose and goals</p>
                </TooltipContent>
              </Tooltip>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description"
                required
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setFormData({ name: '', description: '' });
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Discard changes and close</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                    Create Project
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new project with the provided details</p>
                </TooltipContent>
              </Tooltip>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default NewProject;